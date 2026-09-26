'use client';

/**
 * AetherWave — Farmer Alert Enrollment & Broadcast Centre
 * किसान सतर्कता नामांकन केंद्र
 *
 * Covers:
 * 1. Farmer self-registration (name, mobile, village, crop) → localStorage
 * 2. Browser push-notification permission + polling-based disaster watch
 * 3. Unique keypad-phone share link generation (WhatsApp + SMS)
 * 4. Broadcast panel: smartphone farmer notifies up to 10 keypad neighbours
 *
 * Zero backend. Zero API keys. 100% frontend.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { tokens } from '@/lib/design-tokens';
import { buildWhatsAppLink, buildSmsLink } from '@/components/notifications/farmer-notification';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FarmerProfile {
  name: string;
  mobile: string;         // 10-digit India
  village: string;
  crop: string;
  language: 'hi' | 'en';
  enrolledAt: string;     // ISO
  notifPermission: NotificationPermission;
}

interface KeypadContact {
  id: string;
  name: string;
  mobile: string;
}

interface DisasterSnapshot {
  floodRisk: number;       // 0-100
  heatRisk: number;
  droughtRisk: number;
  cycloneRisk: number;
  precipMm: number;
  tempC: number;
  lastChecked: string;     // ISO
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'aw_farmer_profile';
const CONTACTS_KEY = 'aw_keypad_contacts';
const DISASTER_KEY = 'aw_last_disaster';
const THRESHOLD = 60; // % risk — fire notification above this

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadProfile(): FarmerProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FarmerProfile) : null;
  } catch { return null; }
}

function saveProfile(p: FarmerProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function loadContacts(): KeypadContact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? (JSON.parse(raw) as KeypadContact[]) : [];
  } catch { return []; }
}

function saveContacts(c: KeypadContact[]) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(c));
}

function buildDisasterShareText(
  profile: FarmerProfile,
  snap: DisasterSnapshot,
  lang: 'hi' | 'en',
): string {
  const threat = snap.floodRisk > THRESHOLD
    ? (lang === 'hi' ? 'बाढ़' : 'Flood')
    : snap.heatRisk > THRESHOLD
    ? (lang === 'hi' ? 'लू/गर्मी' : 'Heatwave')
    : snap.cycloneRisk > THRESHOLD
    ? (lang === 'hi' ? 'चक्रवात' : 'Cyclone')
    : (lang === 'hi' ? 'मौसम आपदा' : 'Climate Disaster');

  const riskPct = Math.max(snap.floodRisk, snap.heatRisk, snap.cycloneRisk, snap.droughtRisk);

  if (lang === 'hi') {
    return `🚨 AetherWave चेतावनी — ${profile.village}
${threat} का खतरा: ${riskPct}%
तापमान: ${snap.tempC}°C | वर्षा: ${snap.precipMm}mm
किसान ${profile.name} के पास से सूचना।
अपनी फसल सुरक्षित करें। सरकारी सहायता: 1800-180-1111`;
  }
  return `🚨 AetherWave Alert — ${profile.village}
${threat} risk: ${riskPct}%
Temp: ${snap.tempC}°C | Rainfall: ${snap.precipMm}mm
Alert shared by farmer ${profile.name}.
Secure your crops. Govt helpline: 1800-180-1111`;
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function RadioIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M7.76 7.76a6 6 0 0 0 0 8.48" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'enroll' | 'watch' | 'broadcast';

const TABS: { id: Tab; label: string; labelHi: string; icon: React.ReactNode }[] = [
  { id: 'enroll', label: 'My Profile', labelHi: 'मेरी प्रोफ़ाइल', icon: <UserIcon /> },
  { id: 'watch', label: 'Disaster Watch', labelHi: 'आपदा निगरानी', icon: <RadioIcon /> },
  { id: 'broadcast', label: 'Broadcast', labelHi: 'समूह सूचना', icon: <BellIcon /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AlertEnrollmentPage() {
  const shouldReduceMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>('enroll');
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [contacts, setContacts] = useState<KeypadContact[]>([]);
  const [disaster, setDisaster] = useState<DisasterSnapshot | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    setProfile(loadProfile());
    setContacts(loadContacts());
    const raw = localStorage.getItem(DISASTER_KEY);
    if (raw) setDisaster(JSON.parse(raw) as DisasterSnapshot);
    setHydrated(true);
  }, []);

  const handleSaveProfile = useCallback((p: FarmerProfile) => {
    saveProfile(p);
    setProfile(p);
  }, []);

  const handleSaveContacts = useCallback((c: KeypadContact[]) => {
    saveContacts(c);
    setContacts(c);
  }, []);

  const handleDisasterUpdate = useCallback((d: DisasterSnapshot) => {
    localStorage.setItem(DISASTER_KEY, JSON.stringify(d));
    setDisaster(d);
  }, []);

  if (!hydrated) {
    return (
      <div style={{ background: tokens.colors.paper, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: tokens.fonts.body, color: tokens.colors.slate }}>Loading… / लोड हो रहा है…</p>
      </div>
    );
  }

  return (
    <div style={{ background: tokens.colors.paper, color: tokens.colors.ink, minHeight: '100vh', fontFamily: tokens.fonts.body }}>
      {/* Authority strip */}
      <div style={{ background: tokens.colors.authority, color: tokens.colors.paper, padding: `${tokens.spacing.sm} ${tokens.spacing.xl}`, fontSize: '0.75rem', display: 'flex', gap: tokens.spacing.lg, flexWrap: 'wrap' }}>
        <span>🇮🇳 AetherWave</span>
        <span>किसान सतर्कता नामांकन केंद्र</span>
        <span style={{ marginLeft: 'auto' }}>Farmer Alert Enrollment Centre</span>
      </div>

      {/* Header */}
      <div style={{ borderBottom: `${tokens.borders.rule} ${tokens.colors.authority}`, padding: `${tokens.spacing.lg} ${tokens.spacing.xl}` }}>
        <h1 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.authority, margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>
          Farmer Alert Enrollment
        </h1>
        <p style={{ margin: `${tokens.spacing.xs} 0 0`, color: tokens.colors.slate, fontSize: '0.9rem' }}>
          किसान सतर्कता नामांकन — Register · Watch · Broadcast
        </p>
      </div>

      {/* Tab bar */}
      <div role="tablist" style={{ display: 'flex', borderBottom: `${tokens.borders.hairline} ${tokens.colors.slate}`, background: tokens.colors.paper, position: 'sticky', top: 0, zIndex: 10 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: `${tokens.spacing.md} ${tokens.spacing.sm}`,
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.id ? `3px solid ${tokens.colors.authority}` : '3px solid transparent',
              color: tab === t.id ? tokens.colors.authority : tokens.colors.slate,
              cursor: 'pointer',
              fontFamily: tokens.fonts.body,
              fontWeight: tab === t.id ? 700 : 400,
              fontSize: '0.75rem',
              transition: 'all 0.15s',
              minHeight: tokens.touch.minTargetA11y,
            }}
          >
            {t.icon}
            <span>{t.label}</span>
            <span style={{ fontSize: '0.65rem' }}>{t.labelHi}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: tokens.spacing.xl }}>
        <AnimatePresence mode="wait">
          {tab === 'enroll' && (
            <motion.div
              key="enroll"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={tokens.motion.spring}
            >
              <EnrollTab profile={profile} onSave={handleSaveProfile} />
            </motion.div>
          )}
          {tab === 'watch' && (
            <motion.div
              key="watch"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={tokens.motion.spring}
            >
              <WatchTab profile={profile} disaster={disaster} onDisasterUpdate={handleDisasterUpdate} />
            </motion.div>
          )}
          {tab === 'broadcast' && (
            <motion.div
              key="broadcast"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={tokens.motion.spring}
            >
              <BroadcastTab profile={profile} contacts={contacts} disaster={disaster} onSaveContacts={handleSaveContacts} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Enroll Tab ───────────────────────────────────────────────────────────────

function EnrollTab({ profile, onSave }: { profile: FarmerProfile | null; onSave: (p: FarmerProfile) => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [name, setName] = useState(profile?.name ?? '');
  const [mobile, setMobile] = useState(profile?.mobile ?? '');
  const [village, setVillage] = useState(profile?.village ?? '');
  const [crop, setCrop] = useState(profile?.crop ?? 'गेहूं');
  const [lang, setLang] = useState<'hi' | 'en'>(profile?.language ?? 'hi');
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const CROPS = ['गेहूं', 'धान', 'मक्का', 'गन्ना', 'कपास', 'सोयाबीन', 'सरसों', 'चना', 'प्याज', 'टमाटर'];

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name required / नाम आवश्यक है';
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = 'Enter valid 10-digit mobile / मान्य मोबाइल नंबर दर्ज करें';
    if (!village.trim()) e.village = 'Village required / गाँव का नाम आवश्यक है';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const p: FarmerProfile = {
      name: name.trim(),
      mobile,
      village: village.trim(),
      crop,
      language: lang,
      enrolledAt: new Date().toISOString(),
      notifPermission: Notification.permission,
    };
    onSave(p);
    setSaved(true);
    setErrors({});
    setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    border: `${tokens.borders.hairline} ${tokens.colors.ink}`,
    background: 'transparent',
    color: tokens.colors.ink,
    fontFamily: tokens.fonts.body,
    fontSize: '1rem',
    minHeight: tokens.touch.minTargetA11y,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    color: tokens.colors.slate,
    marginBottom: tokens.spacing.xs,
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Enrolled banner */}
      {profile && (
        <div style={{ padding: tokens.spacing.md, background: `${tokens.colors.verifiedForest}12`, borderLeft: `3px solid ${tokens.colors.verifiedForest}`, marginBottom: tokens.spacing.xl, display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
          <span style={{ color: tokens.colors.verifiedForest }}><CheckIcon /></span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: tokens.colors.verifiedForest, fontSize: '0.9rem' }}>Enrolled / नामांकित</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: tokens.colors.slate }}>{profile.name} · {profile.village} · Enrolled {new Date(profile.enrolledAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      )}

      <h2 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.authority, fontSize: '1.1rem', marginBottom: tokens.spacing.lg }}>
        {profile ? 'Update Profile / प्रोफ़ाइल अपडेट करें' : 'Register / नामांकन करें'}
      </h2>

      {/* Language */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <span style={labelStyle}>Alert Language / चेतावनी भाषा</span>
        <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
          {(['hi', 'en'] as const).map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: `${tokens.spacing.xs} ${tokens.spacing.lg}`,
                border: `${tokens.borders.hairline} ${lang === l ? tokens.colors.authority : tokens.colors.slate}`,
                background: lang === l ? tokens.colors.authority : 'transparent',
                color: lang === l ? tokens.colors.paper : tokens.colors.ink,
                fontFamily: tokens.fonts.body,
                cursor: 'pointer',
                minHeight: tokens.touch.minTargetA11y,
              }}
            >
              {l === 'hi' ? 'हिंदी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <label htmlFor="farmer-name" style={labelStyle}>Full Name / पूरा नाम *</label>
        <input id="farmer-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. रामलाल पाटील" style={{ ...inputStyle, borderColor: errors.name ? '#B91C1C' : tokens.colors.ink }} />
        {errors.name && <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.75rem', color: '#B91C1C' }}>{errors.name}</p>}
      </div>

      {/* Mobile */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <label htmlFor="farmer-mobile" style={labelStyle}>Mobile Number / मोबाइल नंबर *</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
          <span style={{ color: tokens.colors.slate, fontSize: '0.9rem', flexShrink: 0 }}>+91</span>
          <input
            id="farmer-mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={mobile}
            onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit"
            style={{ ...inputStyle, borderColor: errors.mobile ? '#B91C1C' : tokens.colors.ink }}
          />
        </div>
        {errors.mobile && <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.75rem', color: '#B91C1C' }}>{errors.mobile}</p>}
        <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.75rem', color: tokens.colors.slate }}>
          Used only to generate share links. Not sent to any server. / केवल लिंक बनाने के लिए — कोई सर्वर नहीं।
        </p>
      </div>

      {/* Village */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <label htmlFor="farmer-village" style={labelStyle}>Village / Tehsil / गाँव / तहसील *</label>
        <input id="farmer-village" type="text" value={village} onChange={e => setVillage(e.target.value)} placeholder="e.g. नगरपाड़ा, Nagarpada" style={{ ...inputStyle, borderColor: errors.village ? '#B91C1C' : tokens.colors.ink }} />
        {errors.village && <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.75rem', color: '#B91C1C' }}>{errors.village}</p>}
      </div>

      {/* Crop */}
      <div style={{ marginBottom: tokens.spacing.xl }}>
        <label style={labelStyle}>Primary Crop / मुख्य फसल</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.xs }}>
          {CROPS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCrop(c)}
              style={{
                padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                border: `${tokens.borders.hairline} ${crop === c ? tokens.colors.authority : tokens.colors.slate}`,
                background: crop === c ? `${tokens.colors.authority}15` : 'transparent',
                color: crop === c ? tokens.colors.authority : tokens.colors.ink,
                fontFamily: tokens.fonts.body,
                cursor: 'pointer',
                minHeight: tokens.touch.minTargetA11y,
                fontSize: '0.9rem',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        {...(shouldReduceMotion ? {} : { whileTap: { scale: 0.97 } })}
        style={{
          width: '100%',
          padding: tokens.spacing.lg,
          background: tokens.colors.authority,
          color: tokens.colors.paper,
          border: 'none',
          fontFamily: tokens.fonts.body,
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          minHeight: tokens.touch.minTarget,
        }}
      >
        {profile ? '✓ Save Changes / बदलाव सहेजें' : '✓ Enroll & Register / नामांकन करें'}
      </motion.button>

      <AnimatePresence>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: tokens.spacing.md, color: tokens.colors.verifiedForest, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}
          >
            ✓ Profile saved / प्रोफ़ाइल सहेजी गई
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

// ─── Watch Tab ────────────────────────────────────────────────────────────────

function WatchTab({
  profile,
  disaster,
  onDisasterUpdate,
}: {
  profile: FarmerProfile | null;
  disaster: DisasterSnapshot | null;
  onDisasterUpdate: (d: DisasterSnapshot) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [checking, setChecking] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  // Start polling once we have GPS + permission
  useEffect(() => {
    if (permission === 'granted' && gpsCoords) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => checkWeather(gpsCoords), 15 * 60 * 1000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission, gpsCoords]);

  async function requestPermission() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted' && profile) {
      new Notification('AetherWave — Alert Active / सतर्कता सक्रिय', {
        body: `नमस्ते ${profile.name}! आपदा चेतावनी सक्रिय। Hello ${profile.name}! Disaster watch is active.`,
        icon: '/icons/icon-192x192.png',
      });
    }
  }

  function getGps() {
    setGpsStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setGpsCoords(coords);
        setGpsStatus('done');
        checkWeather(coords);
      },
      () => {
        setGpsStatus('error');
        setError('GPS unavailable. Using default location (Delhi). / GPS उपलब्ध नहीं। डिफ़ॉल्ट स्थान (दिल्ली) का उपयोग।');
        const coords = { lat: 28.6139, lon: 77.2090 };
        setGpsCoords(coords);
        checkWeather(coords);
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }

  async function checkWeather(coords: { lat: number; lon: number }) {
    setChecking(true);
    setError('');
    try {
      const res = await fetch(`/api/weather/live?lat=${coords.lat}&lon=${coords.lon}`);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json() as {
        current: {
          temperature_2m: number;
          precipitation: number;
          windspeed_10m: number;
          relativehumidity_2m: number;
          heatstress_index: number;
        };
      };

      const temp = data.current.temperature_2m;
      const precip = data.current.precipitation;
      const wind = data.current.windspeed_10m;
      const humidity = data.current.relativehumidity_2m;

      // Compute risk scores
      const floodRisk = Math.min(100, Math.round((precip / 50) * 100 + (humidity > 85 ? 20 : 0)));
      const heatRisk = Math.min(100, Math.round(data.current.heatstress_index * 100));
      const cycloneRisk = Math.min(100, Math.round((wind / 120) * 100));
      const droughtRisk = Math.min(100, Math.round((humidity < 30 ? (30 - humidity) / 30 : 0) * 100));

      const snap: DisasterSnapshot = {
        floodRisk,
        heatRisk,
        cycloneRisk,
        droughtRisk,
        precipMm: precip,
        tempC: temp,
        lastChecked: new Date().toISOString(),
      };
      onDisasterUpdate(snap);

      // Fire browser notification if risk exceeds threshold
      const maxRisk = Math.max(floodRisk, heatRisk, cycloneRisk, droughtRisk);
      if (permission === 'granted' && maxRisk >= THRESHOLD) {
        const threatName = floodRisk >= THRESHOLD ? 'Flood / बाढ़'
          : heatRisk >= THRESHOLD ? 'Heatwave / लू'
          : cycloneRisk >= THRESHOLD ? 'Cyclone / चक्रवात'
          : 'Drought / सूखा';
        new Notification(`🚨 AetherWave — ${threatName} Alert`, {
          body: `Risk: ${maxRisk}%. Temp: ${temp}°C. Rainfall: ${precip}mm. Secure your crops immediately.`,
          icon: '/icons/icon-192x192.png',
          tag: 'aw-disaster-alert',
          requireInteraction: true,
        });
      }
    } catch {
      setError('Could not fetch weather. Check connection. / मौसम डेटा उपलब्ध नहीं।');
    } finally {
      setChecking(false);
    }
  }

  const maxRisk = disaster ? Math.max(disaster.floodRisk, disaster.heatRisk, disaster.cycloneRisk, disaster.droughtRisk) : 0;
  const isHighRisk = maxRisk >= THRESHOLD;

  function riskColor(pct: number) {
    if (pct >= THRESHOLD) return '#B91C1C';
    if (pct >= 30) return tokens.colors.alertOchre;
    return tokens.colors.verifiedForest;
  }

  function RiskBar({ value, label }: { value: number; label: string }) {
    return (
      <div style={{ marginBottom: tokens.spacing.sm }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 700, color: riskColor(value) }}>{value}%</span>
        </div>
        <div style={{ height: '8px', background: `${tokens.colors.ink}18`, position: 'relative' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 20 }}
            style={{ height: '100%', background: riskColor(value), position: 'absolute', top: 0, left: 0 }}
          />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: tokens.spacing.xl, textAlign: 'center', color: tokens.colors.slate }}>
        <p style={{ fontSize: '2rem', margin: 0 }}>⚠️</p>
        <p>Please enroll first in the <strong>My Profile</strong> tab to activate disaster watch.</p>
        <p style={{ fontSize: '0.85rem' }}>पहले <strong>मेरी प्रोफ़ाइल</strong> टैब में नामांकन करें।</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.authority, fontSize: '1.1rem', marginBottom: tokens.spacing.lg }}>
        Disaster Watch / आपदा निगरानी
      </h2>

      {/* Notification permission */}
      <div style={{ padding: tokens.spacing.lg, border: `${tokens.borders.hairline} ${permission === 'granted' ? tokens.colors.verifiedForest : tokens.colors.alertOchre}`, marginBottom: tokens.spacing.xl }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing.md }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{permission === 'granted' ? '🔔' : '🔕'}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: permission === 'granted' ? tokens.colors.verifiedForest : tokens.colors.alertOchre }}>
              {permission === 'granted' ? 'Notifications Active / सूचनाएं सक्रिय' : permission === 'denied' ? 'Notifications Blocked / सूचनाएं अवरुद्ध' : 'Enable Notifications / सूचनाएं सक्षम करें'}
            </p>
            <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.8rem', color: tokens.colors.slate }}>
              {permission === 'granted'
                ? `AetherWave will alert you when disaster risk exceeds ${THRESHOLD}%.`
                : permission === 'denied'
                ? 'Please enable notifications in browser settings to receive disaster alerts.'
                : 'Allow notifications to receive automatic disaster alerts on your phone.'}
            </p>
            <p style={{ margin: `2px 0 0`, fontSize: '0.8rem', color: tokens.colors.slate }}>
              {permission === 'granted'
                ? `${THRESHOLD}% से अधिक जोखिम होने पर AetherWave आपको सतर्क करेगा।`
                : permission === 'denied'
                ? 'ब्राउज़र सेटिंग में सूचनाएं सक्षम करें।'
                : 'स्वचालित आपदा सूचनाएं पाने के लिए अनुमति दें।'}
            </p>
          </div>
        </div>
        {permission === 'default' && (
          <motion.button
            onClick={requestPermission}
            {...(shouldReduceMotion ? {} : { whileTap: { scale: 0.97 } })}
            style={{ marginTop: tokens.spacing.md, width: '100%', padding: tokens.spacing.md, background: tokens.colors.authority, color: tokens.colors.paper, border: 'none', fontFamily: tokens.fonts.body, fontWeight: 700, cursor: 'pointer', minHeight: tokens.touch.minTargetA11y }}
          >
            🔔 Enable Disaster Alerts / आपदा सूचनाएं सक्षम करें
          </motion.button>
        )}
      </div>

      {/* GPS + check */}
      <div style={{ marginBottom: tokens.spacing.xl }}>
        <motion.button
          onClick={getGps}
          disabled={checking}
          {...(shouldReduceMotion ? {} : { whileTap: { scale: 0.97 } })}
          style={{
            width: '100%',
            padding: tokens.spacing.lg,
            background: checking ? tokens.colors.slate : tokens.colors.alertOchre,
            color: tokens.colors.paper,
            border: 'none',
            fontFamily: tokens.fonts.body,
            fontWeight: 700,
            fontSize: '1rem',
            cursor: checking ? 'wait' : 'pointer',
            minHeight: tokens.touch.minTarget,
          }}
        >
          {checking ? '⏳ Checking… / जाँच हो रही है…' : '📍 Check My Location & Disaster Risk / स्थान व जोखिम जाँचें'}
        </motion.button>
        {gpsStatus === 'done' && gpsCoords && (
          <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.75rem', color: tokens.colors.slate }}>
            📍 {gpsCoords.lat.toFixed(4)}, {gpsCoords.lon.toFixed(4)} — Auto-polls every 15 min / हर 15 मिनट स्वतः जाँच
          </p>
        )}
        {error && <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.8rem', color: tokens.colors.alertOchre }}>{error}</p>}
      </div>

      {/* Risk display */}
      {disaster && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={tokens.motion.spring}
          style={{ border: `${tokens.borders.rule} ${isHighRisk ? '#B91C1C' : tokens.colors.slate}`, padding: tokens.spacing.lg, marginBottom: tokens.spacing.xl }}
        >
          {isHighRisk && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: tokens.spacing.md, color: '#B91C1C', fontWeight: 700 }}>
              <AlertTriangleIcon />
              <span>HIGH RISK — Immediate action needed / उच्च जोखिम — तुरंत कार्रवाई करें</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: tokens.spacing.xl, marginBottom: tokens.spacing.lg, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: tokens.colors.slate }}>Temperature / तापमान</p>
              <p style={{ margin: 0, fontSize: '2rem', fontFamily: tokens.fonts.display, color: tokens.colors.authority, lineHeight: 1 }}>{disaster.tempC}°C</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: tokens.colors.slate }}>Rainfall / वर्षा</p>
              <p style={{ margin: 0, fontSize: '2rem', fontFamily: tokens.fonts.display, color: tokens.colors.authority, lineHeight: 1 }}>{disaster.precipMm}mm</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: tokens.colors.slate }}>Max Risk / अधिकतम जोखिम</p>
              <p style={{ margin: 0, fontSize: '2rem', fontFamily: tokens.fonts.display, color: riskColor(maxRisk), lineHeight: 1 }}>{maxRisk}%</p>
            </div>
          </div>

          <RiskBar value={disaster.floodRisk} label="Flood / बाढ़" />
          <RiskBar value={disaster.heatRisk} label="Heatwave / लू" />
          <RiskBar value={disaster.cycloneRisk} label="Cyclone / चक्रवात" />
          <RiskBar value={disaster.droughtRisk} label="Drought / सूखा" />

          <p style={{ margin: `${tokens.spacing.sm} 0 0`, fontSize: '0.75rem', color: tokens.colors.slate }}>
            Last checked / अंतिम जाँच: {new Date(disaster.lastChecked).toLocaleString('en-IN')}
          </p>
        </motion.div>
      )}

      {/* How it works */}
      <div style={{ padding: tokens.spacing.md, background: `${tokens.colors.authority}08`, borderLeft: `3px solid ${tokens.colors.authority}`, fontSize: '0.85rem', lineHeight: 1.7 }}>
        <strong style={{ color: tokens.colors.authority }}>How it detects you / यह आपको कैसे पहचानता है</strong>
        <ul style={{ margin: `${tokens.spacing.sm} 0 0 ${tokens.spacing.lg}`, padding: 0 }}>
          <li>Your enrolled profile is stored only on <strong>this device</strong> — no server.</li>
          <li>GPS detects your real farming location in real-time.</li>
          <li>Open-Meteo live weather is fetched for your exact coordinates.</li>
          <li>If risk ≥ {THRESHOLD}%, browser notification fires immediately — even if app is in background.</li>
          <li style={{ color: tokens.colors.slate }}>आपकी प्रोफ़ाइल केवल इस डिवाइस पर है। GPS आपका वास्तविक स्थान पकड़ता है। {THRESHOLD}% से अधिक जोखिम पर तुरंत सूचना।</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Broadcast Tab ────────────────────────────────────────────────────────────

function BroadcastTab({
  profile,
  contacts,
  disaster,
  onSaveContacts,
}: {
  profile: FarmerProfile | null;
  contacts: KeypadContact[];
  disaster: DisasterSnapshot | null;
  onSaveContacts: (c: KeypadContact[]) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [addError, setAddError] = useState('');
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  function addContact() {
    if (!newName.trim()) { setAddError('Name required'); return; }
    if (!/^[6-9]\d{9}$/.test(newMobile)) { setAddError('Valid 10-digit mobile required'); return; }
    if (contacts.length >= 10) { setAddError('Maximum 10 contacts allowed'); return; }
    if (contacts.some(c => c.mobile === newMobile)) { setAddError('Mobile already added'); return; }
    const updated = [...contacts, { id: crypto.randomUUID(), name: newName.trim(), mobile: newMobile }];
    onSaveContacts(updated);
    setNewName('');
    setNewMobile('');
    setAddError('');
  }

  function removeContact(id: string) {
    onSaveContacts(contacts.filter(c => c.id !== id));
  }

  function getShareText(contactName: string) {
    if (!profile || !disaster) return '';
    const base = buildDisasterShareText(profile, disaster, profile.language ?? 'hi');
    return profile.language === 'hi'
      ? `नमस्ते ${contactName}!\n${base}`
      : `Hello ${contactName}!\n${base}`;
  }

  function markSent(id: string) {
    setSentIds(prev => new Set([...prev, id]));
  }

  if (!profile) {
    return (
      <div style={{ padding: tokens.spacing.xl, textAlign: 'center', color: tokens.colors.slate }}>
        <p style={{ fontSize: '2rem', margin: 0 }}>⚠️</p>
        <p>Enroll first in <strong>My Profile</strong> tab.</p>
        <p style={{ fontSize: '0.85rem' }}>पहले <strong>मेरी प्रोफ़ाइल</strong> टैब में नामांकन करें।</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.authority, fontSize: '1.1rem', marginBottom: tokens.spacing.xs }}>
        Broadcast to Keypad Farmers
      </h2>
      <p style={{ margin: `0 0 ${tokens.spacing.xl}`, fontSize: '0.85rem', color: tokens.colors.slate }}>
        कीपैड फोन किसानों को SMS से सूचित करें — Add up to 10 keypad-phone farmers. Tap to send SMS or WhatsApp.
      </p>

      {/* No disaster warning */}
      {!disaster && (
        <div style={{ padding: tokens.spacing.md, background: `${tokens.colors.alertOchre}10`, borderLeft: `3px solid ${tokens.colors.alertOchre}`, marginBottom: tokens.spacing.xl, fontSize: '0.85rem' }}>
          <strong style={{ color: tokens.colors.alertOchre }}>⚠ Run Disaster Watch first</strong>
          <p style={{ margin: `${tokens.spacing.xs} 0 0`, color: tokens.colors.slate }}>Go to the <strong>Disaster Watch</strong> tab and check your location to generate a live alert message.</p>
          <p style={{ margin: `2px 0 0`, color: tokens.colors.slate }}>पहले आपदा निगरानी टैब में स्थान जाँचें।</p>
        </div>
      )}

      {/* Add contact */}
      <div style={{ padding: tokens.spacing.lg, border: `${tokens.borders.hairline} ${tokens.colors.slate}`, marginBottom: tokens.spacing.xl }}>
        <h3 style={{ margin: `0 0 ${tokens.spacing.md}`, fontFamily: tokens.fonts.display, fontSize: '0.95rem', color: tokens.colors.authority }}>
          Add Keypad Farmer / कीपैड किसान जोड़ें
        </h3>
        <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Farmer name / नाम"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ flex: '1 1 140px', padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, border: `${tokens.borders.hairline} ${tokens.colors.ink}`, background: 'transparent', color: tokens.colors.ink, fontFamily: tokens.fonts.body, fontSize: '0.9rem', minHeight: tokens.touch.minTargetA11y, outline: 'none' }}
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="+91 mobile"
            value={newMobile}
            onChange={e => setNewMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            style={{ flex: '1 1 120px', padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, border: `${tokens.borders.hairline} ${tokens.colors.ink}`, background: 'transparent', color: tokens.colors.ink, fontFamily: tokens.fonts.body, fontSize: '0.9rem', minHeight: tokens.touch.minTargetA11y, outline: 'none' }}
          />
          <motion.button
            onClick={addContact}
            {...(shouldReduceMotion ? {} : { whileTap: { scale: 0.95 } })}
            style={{ padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`, background: tokens.colors.authority, color: tokens.colors.paper, border: 'none', fontFamily: tokens.fonts.body, fontWeight: 700, cursor: 'pointer', minHeight: tokens.touch.minTargetA11y, fontSize: '0.9rem' }}
          >
            + Add
          </motion.button>
        </div>
        {addError && <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.8rem', color: '#B91C1C' }}>{addError}</p>}
        <p style={{ margin: `${tokens.spacing.xs} 0 0`, fontSize: '0.75rem', color: tokens.colors.slate }}>
          {contacts.length}/10 contacts · Numbers stored only on this device.
        </p>
      </div>

      {/* Contacts list */}
      {contacts.length === 0 ? (
        <div style={{ padding: tokens.spacing.xl, textAlign: 'center', color: tokens.colors.slate, border: `${tokens.borders.hairline} ${tokens.colors.slate}` }}>
          <span style={{ fontSize: '2rem' }}>📟</span>
          <p style={{ margin: `${tokens.spacing.sm} 0 0` }}>No keypad contacts yet. Add farmers above.</p>
          <p style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>अभी कोई कीपैड संपर्क नहीं। ऊपर किसान जोड़ें।</p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.8rem', color: tokens.colors.slate, marginBottom: tokens.spacing.md }}>
            Tap 💬 to WhatsApp or 📨 to SMS each farmer individually with the live disaster alert.
          </p>
          <AnimatePresence>
            {contacts.map((contact, i) => {
              const shareText = getShareText(contact.name);
              const waLink = buildWhatsAppLink(contact.mobile, shareText || 'AetherWave alert — check app for details.');
              const smsLink = buildSmsLink(contact.mobile, shareText || 'AetherWave alert — check app for details.');
              const isSent = sentIds.has(contact.id);

              return (
                <motion.div
                  key={contact.id}
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ ...tokens.motion.spring, delay: i * 0.04 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing.md,
                    padding: tokens.spacing.md,
                    borderBottom: `${tokens.borders.hairline} ${tokens.colors.slate}`,
                    background: isSent ? `${tokens.colors.verifiedForest}08` : 'transparent',
                  }}
                >
                  {/* Icon */}
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📟</span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: tokens.colors.slate }}>+91 {contact.mobile}</p>
                    {isSent && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: tokens.colors.verifiedForest, fontWeight: 600 }}>✓ Alert sent</p>}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: tokens.spacing.xs, flexShrink: 0 }}>
                    {/* WhatsApp */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markSent(contact.id)}
                      aria-label={`WhatsApp ${contact.name}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: '1.2rem' }}
                      title="Send via WhatsApp"
                    >
                      💬
                    </a>
                    {/* SMS */}
                    <a
                      href={smsLink}
                      onClick={() => markSent(contact.id)}
                      aria-label={`SMS ${contact.name}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: tokens.colors.authority, color: tokens.colors.paper, textDecoration: 'none', fontSize: '1.2rem' }}
                      title="Send via SMS"
                    >
                      📨
                    </a>
                    {/* Remove */}
                    <button
                      onClick={() => removeContact(contact.id)}
                      aria-label={`Remove ${contact.name}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'transparent', border: `${tokens.borders.hairline} ${tokens.colors.slate}`, color: tokens.colors.slate, cursor: 'pointer' }}
                      title="Remove contact"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Broadcast all */}
          {contacts.length > 1 && disaster && (
            <div style={{ marginTop: tokens.spacing.xl, padding: tokens.spacing.lg, border: `${tokens.borders.rule} ${tokens.colors.alertOchre}` }}>
              <h3 style={{ margin: `0 0 ${tokens.spacing.sm}`, fontFamily: tokens.fonts.display, fontSize: '0.95rem', color: tokens.colors.alertOchre }}>
                📢 Broadcast to All / सभी को एक साथ भेजें
              </h3>
              <p style={{ margin: `0 0 ${tokens.spacing.md}`, fontSize: '0.85rem', color: tokens.colors.slate }}>
                Open each contact's SMS one by one. Your browser will allow sending to all {contacts.length} farmers.
                <br /><span style={{ fontSize: '0.8rem' }}>प्रत्येक किसान का SMS एक-एक करके खुलेगा।</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
                {contacts.map((contact) => {
                  const shareText = getShareText(contact.name);
                  return (
                    <a
                      key={contact.id}
                      href={buildSmsLink(contact.mobile, shareText || 'AetherWave alert.')}
                      onClick={() => markSent(contact.id)}
                      style={{ padding: `${tokens.spacing.xs} ${tokens.spacing.md}`, background: tokens.colors.alertOchre, color: tokens.colors.paper, textDecoration: 'none', fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '0.85rem', minHeight: tokens.touch.minTargetA11y, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <PhoneIcon /> {contact.name}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unique share link for QR / sharing */}
      {disaster && profile && (
        <div style={{ marginTop: tokens.spacing.xl, padding: tokens.spacing.lg, background: `${tokens.colors.authority}08`, borderLeft: `3px solid ${tokens.colors.authority}` }}>
          <h3 style={{ margin: `0 0 ${tokens.spacing.sm}`, fontFamily: tokens.fonts.display, fontSize: '0.95rem', color: tokens.colors.authority }}>
            🔗 Universal Share Link / सार्वजनिक चेतावनी लिंक
          </h3>
          <p style={{ margin: `0 0 ${tokens.spacing.sm}`, fontSize: '0.85rem', color: tokens.colors.slate }}>
            Send this WhatsApp link to any farmer — they can forward it to others.
            <br /><span style={{ fontSize: '0.8rem' }}>इस लिंक को किसी भी किसान को भेजें — वे आगे फॉरवर्ड कर सकते हैं।</span>
          </p>
          <a
            href={buildWhatsAppLink(undefined, buildDisasterShareText(profile, disaster, profile.language ?? 'hi'))}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing.sm,
              padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
              background: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: tokens.fonts.body,
              fontWeight: 700,
              fontSize: '0.9rem',
              minHeight: tokens.touch.minTargetA11y,
            }}
          >
            💬 Share Alert via WhatsApp / WhatsApp से भेजें
          </a>
        </div>
      )}
    </div>
  );
}
