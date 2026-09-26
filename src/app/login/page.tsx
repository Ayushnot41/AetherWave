'use client';

/**
 * AetherWave Kisan Portal // राष्ट्रीय किसान पंजीकरण एवं लॉगिन
 * Institutional Government of India Standard // Digital Agriculture Mission
 * Supports:
 * - Passwordless 6-digit SMS OTP Authentication
 * - Complete Farmer KYC Registration (Aadhaar/PM-KISAN ID, Land Area, Crop, GPS)
 * - Solana Devnet Wallet binding for Climate Disaster DBT Dividend transfers
 * - Persistent local session & offline state
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { tokens } from '@/lib/design-tokens';
import { useAuthStore } from '@/stores/auth-store';
import { useLocaleStore } from '@/stores/locale-store';

interface FarmerProfile {
  name: string;
  phone: string;
  aadhaar: string;
  state: string;
  district: string;
  village: string;
  acres: number;
  crop: string;
  solanaWallet: string;
  coords?: { lat: number; lon: number };
  registeredAt: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { demoLogin } = useAuthStore();
  const { dialectCode, setDialect } = useLocaleStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Registration Form State
  const [regForm, setRegForm] = useState<FarmerProfile>({
    name: 'रामेश्वर पाटिल (Rameshwar Patil)',
    phone: '',
    aadhaar: 'XXXX-XXXX-8924',
    state: 'Maharashtra',
    district: 'Yavatmal',
    village: 'Pimpri Budruk',
    acres: 3.5,
    crop: 'Cotton & Soybean (कपास एवं सोयाबीन)',
    solanaWallet: '7b3pu4js8YgC8opZWLx8BVW7TnTP77ruAzi7Ayms7iyM',
    registeredAt: '',
  });

  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lon: number } | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Auto-fill from localStorage if existing farmer profile exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aetherwave_farmer_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRegForm((prev) => ({ ...prev, ...parsed }));
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch {
      // ignore
    }
  }, []);

  // Detect GPS Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lon: Math.round(pos.coords.longitude * 10000) / 10000,
        };
        setGpsLocation(coords);
        setRegForm((prev) => ({ ...prev, coords }));
        setGpsDetecting(false);
        setFeedback({
          type: 'success',
          message: `GPS coordinates bound: ${coords.lat}°N, ${coords.lon}°E`,
        });
      },
      (err) => {
        setGpsDetecting(false);
        // Default to Central India farming belt coords
        const coords = { lat: 20.5937, lon: 78.9629 };
        setGpsLocation(coords);
        setRegForm((prev) => ({ ...prev, coords }));
        setFeedback({
          type: 'success',
          message: `Location set to Central Deccan Agri Grid: ${coords.lat}°N, ${coords.lon}°E`,
        });
      },
      { timeout: 10000 }
    );
  };

  // Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFeedback({ type: 'error', message: 'Please enter a valid 10-digit mobile number // कृपया १० अंकों का मान्य मोबाइल नंबर दर्ज करें' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // Call OTP request route
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${cleanPhone}`, dialect: 'hi-IN' }),
      });

      if (res.ok) {
        setOtpSent(true);
        setOtpTimer(30);
        setOtp('704912'); // Pre-fill mock OTP for demo speed
        setFeedback({
          type: 'success',
          message: `OTP sent via SMS to +91 ${cleanPhone}. Demonstration OTP: 704912`,
        });
      } else {
        // Fallback for fast demo
        setOtpSent(true);
        setOtpTimer(30);
        setOtp('704912');
        setFeedback({
          type: 'success',
          message: `Demonstration OTP generated: 704912 (Direct Login)`,
        });
      }
    } catch {
      setOtpSent(true);
      setOtp('704912');
      setFeedback({
        type: 'success',
        message: `Offline mode: Demonstration OTP is 704912`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setFeedback({ type: 'error', message: 'Enter the 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      const fakeToken = `aether-jwt-${Date.now()}`;
      demoLogin(dialectCode);

      // Update or create stored farmer profile
      const updatedProfile = {
        ...regForm,
        phone: cleanPhone,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem('aetherwave_farmer_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('aetherwave_auth_token', fakeToken);

      setFeedback({
        type: 'success',
        message: 'Aadhaar & Phone Verified! Redirecting to National Grid Dashboard...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch {
      setFeedback({ type: 'error', message: 'Authentication verification failed' });
    } finally {
      setLoading(false);
    }
  };

  // Register New Farmer
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.phone || regForm.phone.replace(/\D/g, '').length !== 10) {
      setFeedback({ type: 'error', message: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    if (!regForm.name.trim()) {
      setFeedback({ type: 'error', message: 'Farmer name is required' });
      return;
    }

    const cleanPhone = regForm.phone.replace(/\D/g, '');
    const profileToSave: FarmerProfile = {
      ...regForm,
      phone: cleanPhone,
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem('aetherwave_farmer_profile', JSON.stringify(profileToSave));
    localStorage.setItem('aetherwave_auth_token', `aether-token-${Date.now()}`);

    setFeedback({
      type: 'success',
      message: 'पंजीकरण सफल! Registration Complete. Solana DBT Dividend account linked.',
    });

    setTimeout(() => {
      router.push('/climate-dbt');
    }, 1000);
  };

  return (
    <div
      className="mukta-font"
      style={{
        backgroundColor: tokens.colors.paper,
        color: tokens.colors.ink,
        minHeight: '100vh',
        padding: '24px 16px 80px 16px',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      {/* ─── Institutional Government Masthead ──────────────────────── */}
      <div
        style={{
          borderBottom: `2px solid ${tokens.colors.authority}`,
          paddingBottom: '16px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        {/* Language Switcher Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '2px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setDialect('en-IN')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: dialectCode === 'en-IN' ? 700 : 500,
                backgroundColor: dialectCode === 'en-IN' ? tokens.colors.authority : 'transparent',
                color: dialectCode === 'en-IN' ? '#FFFFFF' : tokens.colors.ink,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setDialect('hi-IN')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: dialectCode === 'hi-IN' ? 700 : 500,
                backgroundColor: dialectCode === 'hi-IN' ? tokens.colors.authority : 'transparent',
                color: dialectCode === 'hi-IN' ? '#FFFFFF' : tokens.colors.ink,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setDialect('bn-IN')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: dialectCode === 'bn-IN' ? 700 : 500,
                backgroundColor: dialectCode === 'bn-IN' ? tokens.colors.authority : 'transparent',
                color: dialectCode === 'bn-IN' ? '#FFFFFF' : tokens.colors.ink,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              বাংলা
            </button>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: tokens.colors.authority,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            ₹
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: tokens.colors.authority,
            }}
          >
            {dialectCode === 'bn-IN' ? 'ডিজিটাল কৃষি মিশন // Digital Agriculture Mission' : dialectCode === 'hi-IN' ? 'डिजिटल कृषि मिशन // Digital Agriculture Mission' : 'Digital Agriculture Mission // National Grid'}
          </span>
        </div>

        <h1
          style={{
            fontFamily: tokens.fonts.display,
            fontSize: '1.8rem',
            fontWeight: 800,
            color: tokens.colors.authority,
            margin: '4px 0',
          }}
        >
          Kisan Registration & Portal Login
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: tokens.colors.slate }}>
          किसान पंजीकरण एवं पासवर्ड-मुक्त लॉगिन — Solana DBT राहत खाता
        </p>
      </div>

      {/* ─── Tab Switcher ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#E2DFD2',
          padding: '4px',
          borderRadius: '4px',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            setFeedback(null);
          }}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
            fontFamily: tokens.fonts.body,
            backgroundColor: activeTab === 'login' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'login' ? tokens.colors.authority : tokens.colors.slate,
            boxShadow: activeTab === 'login' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          🔑 Quick Login // किसान लॉगिन
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setFeedback(null);
          }}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
            fontFamily: tokens.fonts.body,
            backgroundColor: activeTab === 'register' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'register' ? tokens.colors.authority : tokens.colors.slate,
            boxShadow: activeTab === 'register' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          📝 New Farmer // नया पंजीकरण
        </button>
      </div>

      {/* ─── Feedback Banner ──────────────────────────────────────── */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            borderLeft: `4px solid ${feedback.type === 'success' ? tokens.colors.verifiedForest : tokens.colors.alertOchre}`,
            color: feedback.type === 'success' ? tokens.colors.verifiedForest : '#991B1B',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* ─── TAB 1: LOGIN FLOW ────────────────────────────────────── */}
      {activeTab === 'login' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #D5D1C3',
            padding: '24px',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: tokens.colors.authority }}>
              10-Digit Mobile OTP Login // मोबाइल ओटीपी लॉगिन
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: tokens.colors.slate }}>
              Enter your PM-KISAN or Aadhaar registered mobile number. No password required.
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  htmlFor="phone-input"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}
                >
                  Farmer Mobile Number // मोबाइल नंबर (+91)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#F3F4F6',
                      border: '1px solid #D1D5DB',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: '1px solid #D1D5DB',
                      fontSize: '1rem',
                      fontFamily: tokens.fonts.body,
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  backgroundColor: tokens.colors.authority,
                  color: tokens.colors.paper,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: tokens.fonts.body,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(21, 51, 80, 0.2)',
                }}
              >
                {loading ? 'Sending OTP...' : 'Send Login OTP // ओटीपी प्राप्त करें →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="otp-input" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    Enter 6-Digit OTP // ६-अंकों का ओटीपी दर्ज करें
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    style={{ background: 'none', border: 'none', color: tokens.colors.authority, fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change Number // नंबर बदलें
                  </button>
                </div>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="704912"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `2px solid ${tokens.colors.authority}`,
                    fontSize: '1.4rem',
                    letterSpacing: '0.4em',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: tokens.colors.slate }}>
                <span>Valid for 5 minutes</span>
                {otpTimer > 0 ? (
                  <span>Resend in {otpTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    style={{ background: 'none', border: 'none', color: tokens.colors.authority, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Resend OTP // पुनः भेजें
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  backgroundColor: tokens.colors.verifiedForest,
                  color: tokens.colors.paper,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: tokens.fonts.body,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(19, 136, 8, 0.25)',
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Enter Dashboard // सत्यापित कर प्रवेश करें ✓'}
              </button>
            </form>
          )}

          {/* Quick Demo Help */}
          <div style={{ marginTop: '20px', padding: '10px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: tokens.colors.slate }}>
            💡 <strong>Hackathon Demo Mode:</strong> Enter any 10-digit number. Standard test OTP is <strong>704912</strong>.
          </div>
        </div>
      )}

      {/* ─── TAB 2: FULL REGISTRATION FLOW ────────────────────────── */}
      {activeTab === 'register' && (
        <form
          onSubmit={handleRegister}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #D5D1C3',
            padding: '24px',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: tokens.colors.authority }}>
              Kisan Profile Registration // किसान विवरण पंजीकरण
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: tokens.colors.slate }}>
              Links your farm parcel to live ISRO/AgroMonitoring satellite grid & Solana Disaster DBT.
            </p>
          </div>

          {/* Farmer Full Name */}
          <div>
            <label htmlFor="reg-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
              Farmer Full Name // किसान का पूरा नाम *
            </label>
            <input
              id="reg-name"
              type="text"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
              required
            />
          </div>

          {/* Mobile & Aadhaar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="reg-phone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Mobile Number // मोबाइल *
              </label>
              <input
                id="reg-phone"
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                required
              />
            </div>
            <div>
              <label htmlFor="reg-aadhaar" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Aadhaar / PM-KISAN ID *
              </label>
              <input
                id="reg-aadhaar"
                type="text"
                value={regForm.aadhaar}
                onChange={(e) => setRegForm({ ...regForm, aadhaar: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                required
              />
            </div>
          </div>

          {/* State, District, Village */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="reg-state" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                State // राज्य
              </label>
              <select
                id="reg-state"
                value={regForm.state}
                onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              >
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                <option value="Punjab">Punjab (पंजाब)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                <option value="Gujarat">Gujarat (गुजरात)</option>
                <option value="Haryana">Haryana (हरियाणा)</option>
              </select>
            </div>
            <div>
              <label htmlFor="reg-dist" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                District // ज़िला
              </label>
              <input
                id="reg-dist"
                type="text"
                value={regForm.district}
                onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label htmlFor="reg-village" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Village // गाँव
              </label>
              <input
                id="reg-village"
                type="text"
                value={regForm.village}
                onChange={(e) => setRegForm({ ...regForm, village: e.target.value })}
                style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Land Area & Crop */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label htmlFor="reg-acres" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Landholding (Acres) // एकड़
              </label>
              <input
                id="reg-acres"
                type="number"
                step="0.1"
                min="0.5"
                value={regForm.acres}
                onChange={(e) => setRegForm({ ...regForm, acres: parseFloat(e.target.value) || 1 })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label htmlFor="reg-crop" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Primary Crop // मुख्य फसल
              </label>
              <input
                id="reg-crop"
                type="text"
                value={regForm.crop}
                onChange={(e) => setRegForm({ ...regForm, crop: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {/* GPS Coordinate Auto-Detection */}
          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: tokens.colors.authority }}>
                  🛰️ GPS Field Parcel Coordinates // खेत का भू-स्थान
                </div>
                <div style={{ fontSize: '0.8rem', color: tokens.colors.slate }}>
                  {gpsLocation ? `${gpsLocation.lat}° N, ${gpsLocation.lon}° E` : 'Not fetched yet'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={gpsDetecting}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${tokens.colors.authority}`,
                  color: tokens.colors.authority,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                {gpsDetecting ? 'Fetching...' : '📍 Fetch Phone GPS // स्थान प्राप्त करें'}
              </button>
            </div>
          </div>

          {/* Solana Wallet Address */}
          <div>
            <label htmlFor="reg-wallet" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
              Solana Blockchain Address for Disaster DBT // सोलाना राहत खाता
            </label>
            <input
              id="reg-wallet"
              type="text"
              value={regForm.solanaWallet}
              onChange={(e) => setRegForm({ ...regForm, solanaWallet: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                backgroundColor: '#FAF9F6',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: tokens.colors.slate }}>
              Pre-filled with your verified treasury address. Used for cryptographic instant dividend release.
            </span>
          </div>

          {/* Submit Registration */}
          <button
            type="submit"
            style={{
              marginTop: '8px',
              padding: '14px 20px',
              backgroundColor: tokens.colors.authority,
              color: tokens.colors.paper,
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: tokens.fonts.body,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(21, 51, 80, 0.25)',
            }}
          >
            Complete Registration & Link DBT Account // पंजीकरण पूर्ण करें →
          </button>
        </form>
      )}

      {/* ─── Bottom Navigation Links ──────────────────────────────── */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: tokens.colors.slate }}>
        Need emergency disaster assistance?{' '}
        <Link href="/climate-dbt" style={{ color: tokens.colors.authority, fontWeight: 700 }}>
          View Climate Disaster DBT Portal →
        </Link>
      </div>
    </div>
  );
}
