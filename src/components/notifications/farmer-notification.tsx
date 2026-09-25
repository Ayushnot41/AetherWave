'use client';

/**
 * AetherWeave Farmer Notification System
 * Frontend-only: WhatsApp deep-link for smartphones, SMS tel: link for keypad phones.
 * All notifications rendered as clickable native links — zero backend, zero API keys.
 * Language selection is auto-detected from locale store or falls back to Hindi.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { tokens } from '@/lib/design-tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FarmerPhoneType = 'smartphone' | 'keypad';

export type AlertLanguage =
  | 'hi'  // Hindi (हिंदी)
  | 'mr'  // Marathi (मराठी)
  | 'ta'  // Tamil (தமிழ்)
  | 'te'  // Telugu (తెలుగు)
  | 'bn'  // Bengali (বাংলা)
  | 'gu'  // Gujarati (ગુજરાતી)
  | 'pa'  // Punjabi (ਪੰਜਾਬੀ)
  | 'en'; // English

export type AlertType =
  | 'climate_disaster'
  | 'fund_transfer'
  | 'harvest_warning'
  | 'storage_alert'
  | 'market_price';

export interface NotificationPayload {
  type: AlertType;
  farmerName: string;
  language: AlertLanguage;
  amount?: number;           // in INR — for fund_transfer type
  txSignature?: string;      // Solana tx signature — for fund_transfer type
  cropName?: string;         // for harvest/storage types
  disasterType?: string;     // for climate_disaster type
  customMessage?: string;    // overrides generated message
}

// ─── Message Templates ────────────────────────────────────────────────────────

const TEMPLATES: Record<AlertType, Record<AlertLanguage, (p: NotificationPayload) => string>> = {
  climate_disaster: {
    hi: (p) => `🚨 AetherWeave चेतावनी: ${p.farmerName} जी, आपके क्षेत्र में ${p.disasterType ?? 'मौसम आपदा'} का खतरा है। कृपया तुरंत सुरक्षित स्थान पर जाएं और अपनी फसल को सुरक्षित करें। सरकारी सहायता के लिए 1800-180-1111 पर संपर्क करें।`,
    mr: (p) => `🚨 AetherWeave इशारा: ${p.farmerName}, आपल्या भागात ${p.disasterType ?? 'हवामान आपत्ती'} चा धोका आहे. कृपया तात्काळ सुरक्षित जागी जा आणि पीक सुरक्षित करा.`,
    ta: (p) => `🚨 AetherWeave எச்சரிக்கை: ${p.farmerName}, உங்கள் பகுதியில் ${p.disasterType ?? 'காலநிலை பேரிடர்'} அபாயம் உள்ளது. உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லுங்கள்.`,
    te: (p) => `🚨 AetherWeave హెచ్చరిక: ${p.farmerName}, మీ ప్రాంతంలో ${p.disasterType ?? 'వాతావరణ విపత్తు'} ప్రమాదం ఉంది. వెంటనే సురక్షిత ప్రాంతానికి వెళ్ళండి.`,
    bn: (p) => `🚨 AetherWeave সতর্কতা: ${p.farmerName}, আপনার এলাকায় ${p.disasterType ?? 'জলবায়ু বিপর্যয়'} এর ঝুঁকি রয়েছে। অবিলম্বে নিরাপদ স্থানে যান।`,
    gu: (p) => `🚨 AetherWeave ચેતવણી: ${p.farmerName}, તમારા વિસ્તારમાં ${p.disasterType ?? 'હવામાન આपदा'} નો ભય છે. તુरंत સુरक्षিत जगায़ जाओ.`,
    pa: (p) => `🚨 AetherWeave ਚੇਤਾਵਨੀ: ${p.farmerName}, ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ${p.disasterType ?? 'ਮੌਸਮ ਆਫ਼ਤ'} ਦਾ ਖ਼ਤਰਾ ਹੈ। ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਜਗ੍ਹਾ ਜਾਓ।`,
    en: (p) => `🚨 AetherWeave Alert: ${p.farmerName}, there is a ${p.disasterType ?? 'climate disaster'} risk in your area. Please move to a safe location immediately and secure your crops. Call 1800-180-1111 for government assistance.`,
  },
  fund_transfer: {
    hi: (p) => `✅ AetherWeave: ${p.farmerName} जी, आपके खाते में ₹${p.amount ?? 0} की सहायता राशि भेजी गई है। Solana लेनदेन ID: ${p.txSignature ?? 'N/A'}। सोलाना एक्सप्लोरर पर देखें: https://solscan.io/tx/${p.txSignature ?? ''}`,
    mr: (p) => `✅ AetherWeave: ${p.farmerName}, तुमच्या खात्यात ₹${p.amount ?? 0} मदत पाठवली आहे. Solana व्यवहार ID: ${p.txSignature ?? 'N/A'}`,
    ta: (p) => `✅ AetherWeave: ${p.farmerName}, உங்கள் கணக்கில் ₹${p.amount ?? 0} உதவி தொகை அனுப்பப்பட்டது. Solana: ${p.txSignature ?? 'N/A'}`,
    te: (p) => `✅ AetherWeave: ${p.farmerName}, మీ ఖాతాకు ₹${p.amount ?? 0} సహాయం పంపబడింది. Solana ID: ${p.txSignature ?? 'N/A'}`,
    bn: (p) => `✅ AetherWeave: ${p.farmerName}, আপনার অ্যাকাউন্টে ₹${p.amount ?? 0} সাহায্য পাঠানো হয়েছে। Solana ID: ${p.txSignature ?? 'N/A'}`,
    gu: (p) => `✅ AetherWeave: ${p.farmerName}, તમારા ખાતામાં ₹${p.amount ?? 0} સહાય મોklavai. Solana: ${p.txSignature ?? 'N/A'}`,
    pa: (p) => `✅ AetherWeave: ${p.farmerName}, ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ₹${p.amount ?? 0} ਮਦਦ ਭੇਜੀ ਗਈ ਹੈ। Solana ID: ${p.txSignature ?? 'N/A'}`,
    en: (p) => `✅ AetherWeave: ${p.farmerName}, ₹${p.amount ?? 0} relief funds have been transferred to your account. Solana TX: ${p.txSignature ?? 'N/A'} — View: https://solscan.io/tx/${p.txSignature ?? ''}`,
  },
  harvest_warning: {
    hi: (p) => `⚠️ AetherWeave फसल चेतावनी: ${p.farmerName} जी, ${p.cropName ?? 'आपकी फसल'} की कटाई के समय मौसम खराब होने की संभावना है। 5 दिन रुकें या अभी काटें और सुरक्षित भंडारण करें।`,
    mr: (p) => `⚠️ AetherWeave: ${p.farmerName}, ${p.cropName ?? 'तुमच्या पिकाची'} कापणीच्या वेळी वाईट हवामान येण्याची शक्यता आहे.`,
    ta: (p) => `⚠️ AetherWeave: ${p.farmerName}, ${p.cropName ?? 'உங்கள் பயிர்'} அறுவடை நேரத்தில் வானிலை மோசமாகலாம்.`,
    te: (p) => `⚠️ AetherWeave: ${p.farmerName}, ${p.cropName ?? 'మీ పంట'} కోత సమయంలో వాతావరణం చెడిపోవచ్చు.`,
    bn: (p) => `⚠️ AetherWeave: ${p.farmerName}, ${p.cropName ?? 'আপনার ফসল'} কাটার সময় আবহাওয়া খারাপ হতে পারে।`,
    gu: (p) => `⚠️ AetherWeave: ${p.farmerName}, ${p.cropName ?? 'તમારા પাকની'} લণણી સময়ে ખраб hawa aave shakhe.`,
    pa: (p) => `⚠️ AetherWeave: ${p.farmerName}, ${p.cropName ?? 'ਤੁਹਾਡੀ ਫ਼ਸਲ'} ਦੀ ਕਟਾਈ ਸਮੇਂ ਮੌਸਮ ਖ਼ਰਾਬ ਹੋਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ।`,
    en: (p) => `⚠️ AetherWeave Harvest Alert: ${p.farmerName}, adverse weather is predicted during ${p.cropName ?? 'your crop'} harvest window. Consider waiting 5 days or harvest now and secure storage immediately.`,
  },
  storage_alert: {
    hi: (p) => `📦 AetherWeave भंडारण चेतावनी: ${p.farmerName} जी, ${p.cropName ?? 'फसल'} के भंडारण में नमी और तापमान बढ़ने से कीट प्रकोप का खतरा है। हर्मेटिक बैग और लकड़ी के पैलेट का उपयोग करें।`,
    mr: (p) => `📦 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'पीक'} साठवणीत बुरशी वाढण्याचा धोका आहे. hermetic bags वापरा.`,
    ta: (p) => `📦 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'பயிர்'} சேமிப்பில் பூஞ்சை அபாயம் உள்ளது. ஹெர்மெடிக் பைகளைப் பயன்படுத்தவும்.`,
    te: (p) => `📦 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'పంట'} నిల్వలో శిలీంధ్రాల ప్రమాదం ఉంది.`,
    bn: (p) => `📦 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'ফসল'} সংরক্ষণে ছত্রাকের ঝুঁকি আছে।`,
    gu: (p) => `📦 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'પાક'} સંglhtarण ma fugal nao jokhem che.`,
    pa: (p) => `📦 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'ਫ਼ਸਲ'} ਦੇ ਭੰਡਾਰਨ ਵਿੱਚ ਫ਼ੰਗਸ ਦਾ ਖ਼ਤਰਾ ਹੈ।`,
    en: (p) => `📦 AetherWeave Storage Alert: ${p.farmerName}, your stored ${p.cropName ?? 'crop'} faces high humidity and fungal risk. Use hermetic bags, elevate on wooden pallets, and check moisture every 3 days.`,
  },
  market_price: {
    hi: (p) => `📈 AetherWeave बाज़ार भाव: ${p.farmerName} जी, ${p.cropName ?? 'फसल'} का आज का मंडी भाव बेहतर है। बेचने का सही समय है — अधिक जानकारी के लिए AetherWeave खोलें।`,
    mr: (p) => `📈 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'पीक'} चा आजचा मंडी भाव चांगला आहे. विकण्याची वेळ आहे.`,
    ta: (p) => `📈 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'பயிர்'} இன்று சந்தை விலை நல்லது. விற்க சரியான நேரம்.`,
    te: (p) => `📈 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'పంట'} మార్కెట్ ధర ఈరోజు మంచిగా ఉంది. అమ్మడానికి సరైన సమయం.`,
    bn: (p) => `📈 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'ফসল'} আজ ভালো বাজার দাম পাচ্ছে। বিক্রির সঠিক সময়।`,
    gu: (p) => `📈 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'પાક'} noj bazar bhav saro che. vecha no sahi samay.`,
    pa: (p) => `📈 AetherWeave: ${p.farmerName}, ${p.cropName ?? 'ਫ਼ਸਲ'} ਦਾ ਅੱਜ ਮੰਡੀ ਭਾਅ ਚੰਗਾ ਹੈ। ਵੇਚਣ ਦਾ ਸਹੀ ਸਮਾਂ।`,
    en: (p) => `📈 AetherWeave Market Alert: ${p.farmerName}, ${p.cropName ?? 'your crop'} market price is favorable today. Good time to sell — open AetherWeave for details.`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMessage(payload: NotificationPayload): string {
  if (payload.customMessage) return payload.customMessage;
  const tpl = TEMPLATES[payload.type]?.[payload.language];
  return tpl ? tpl(payload) : TEMPLATES[payload.type].en(payload);
}

/**
 * Build a WhatsApp deep-link for smartphones.
 * Opens WhatsApp with the message pre-filled for a given phone number.
 * If phone is not provided, opens WhatsApp compose (no number) — farmer can pick contact.
 */
export function buildWhatsAppLink(phone: string | undefined, message: string): string {
  const encoded = encodeURIComponent(message);
  if (phone) {
    // Normalise Indian mobile numbers: strip +, leading 0, ensure 91 prefix
    const clean = phone.replace(/\D/g, '').replace(/^0/, '').replace(/^91/, '');
    return `https://wa.me/91${clean}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Build an SMS tel: link for keypad (feature) phones.
 * Uses sms: scheme which is supported by all mobile browsers and keypad phones.
 */
export function buildSmsLink(phone: string | undefined, message: string): string {
  const encoded = encodeURIComponent(message);
  const clean = phone
    ? '+91' + phone.replace(/\D/g, '').replace(/^0/, '').replace(/^91/, '')
    : '';
  return `sms:${clean}?body=${encoded}`;
}

// ─── Notification Panel Component ─────────────────────────────────────────────

interface NotificationPanelProps {
  payload: NotificationPayload;
  recipientPhone?: string;
  /** Farmer's own device type — determines default channel shown first */
  defaultChannel?: FarmerPhoneType;
  onSent?: (channel: 'whatsapp' | 'sms') => void;
}

const LANG_LABELS: Record<AlertLanguage, string> = {
  hi: 'हिंदी', mr: 'मराठी', ta: 'தமிழ்', te: 'తెలుగు',
  bn: 'বাংলা', gu: 'ગુજરાતી', pa: 'ਪੰਜਾਬੀ', en: 'English',
};

export function NotificationPanel({ payload, recipientPhone, defaultChannel = 'smartphone', onSent }: NotificationPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [lang, setLang] = useState<AlertLanguage>(payload.language);
  const [channel, setChannel] = useState<FarmerPhoneType>(defaultChannel);
  const [phone, setPhone] = useState(recipientPhone ?? '');
  const [sent, setSent] = useState<'whatsapp' | 'sms' | null>(null);

  const currentPayload = { ...payload, language: lang };
  const message = buildMessage(currentPayload);
  const whatsappLink = buildWhatsAppLink(phone || undefined, message);
  const smsLink = buildSmsLink(phone || undefined, message);

  const handleSend = (ch: 'whatsapp' | 'sms') => {
    setSent(ch);
    onSent?.(ch);
  };

  return (
    <div
      role="region"
      aria-label="Send Notification / सूचना भेजें"
      style={{
        background: tokens.colors.paper,
        color: tokens.colors.ink,
        border: `${tokens.borders.rule} ${tokens.colors.authority}`,
        padding: tokens.spacing.xl,
        fontFamily: tokens.fonts.body,
        maxWidth: '540px',
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: `${tokens.borders.hairline} ${tokens.colors.ink}`, paddingBottom: tokens.spacing.md, marginBottom: tokens.spacing.lg }}>
        <h2 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.authority, margin: 0, fontSize: '1.25rem' }}>
          Send Alert to Farmer / किसान को सूचना भेजें
        </h2>
      </div>

      {/* Language selector */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: tokens.colors.slate, marginBottom: tokens.spacing.xs }}>
          Language / भाषा
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.xs }}>
          {(Object.keys(LANG_LABELS) as AlertLanguage[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              style={{
                padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                border: `${tokens.borders.hairline} ${lang === l ? tokens.colors.authority : tokens.colors.slate}`,
                background: lang === l ? tokens.colors.authority : 'transparent',
                color: lang === l ? tokens.colors.paper : tokens.colors.ink,
                cursor: 'pointer',
                fontFamily: tokens.fonts.body,
                fontSize: '0.85rem',
                minWidth: tokens.touch.minTargetA11y,
                minHeight: tokens.touch.minTargetA11y,
              }}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Channel selector */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: tokens.colors.slate, marginBottom: tokens.spacing.xs }}>
          Phone Type / फोन प्रकार
        </label>
        <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
          {(['smartphone', 'keypad'] as FarmerPhoneType[]).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              aria-pressed={channel === ch}
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                border: `${tokens.borders.hairline} ${channel === ch ? tokens.colors.authority : tokens.colors.slate}`,
                background: channel === ch ? `${tokens.colors.authority}11` : 'transparent',
                color: tokens.colors.ink,
                cursor: 'pointer',
                fontFamily: tokens.fonts.body,
                textAlign: 'left',
                minHeight: tokens.touch.minTarget,
              }}
            >
              <span style={{ fontSize: '1.5rem', display: 'block' }}>{ch === 'smartphone' ? '📱' : '📟'}</span>
              <span style={{ fontWeight: 600 }}>{ch === 'smartphone' ? 'Smartphone (WhatsApp)' : 'Keypad Phone (SMS)'}</span>
              <span style={{ display: 'block', fontSize: '0.8rem', color: tokens.colors.slate }}>
                {ch === 'smartphone' ? 'WhatsApp deep-link' : 'SMS tel: link'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Phone number input */}
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <label htmlFor="farmer-phone" style={{ display: 'block', fontSize: '0.8rem', color: tokens.colors.slate, marginBottom: tokens.spacing.xs }}>
          Farmer Mobile Number / किसान मोबाइल नंबर (optional)
        </label>
        <div style={{ display: 'flex', gap: tokens.spacing.sm, alignItems: 'center' }}>
          <span style={{ fontFamily: tokens.fonts.body, color: tokens.colors.slate, fontSize: '0.9rem' }}>+91</span>
          <input
            id="farmer-phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit number"
            aria-describedby="phone-hint"
            style={{
              flex: 1,
              padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
              border: `${tokens.borders.hairline} ${tokens.colors.ink}`,
              background: 'transparent',
              color: tokens.colors.ink,
              fontFamily: tokens.fonts.body,
              fontSize: '1rem',
              minHeight: tokens.touch.minTargetA11y,
              outline: 'none',
            }}
          />
        </div>
        <p id="phone-hint" style={{ margin: `${tokens.spacing.xs} 0 0 0`, fontSize: '0.75rem', color: tokens.colors.slate }}>
          Leave blank to let farmer choose the recipient in their messaging app.
          यदि खाली छोड़ें तो किसान खुद संपर्क चुनेगा।
        </p>
      </div>

      {/* Message preview */}
      <div style={{ marginBottom: tokens.spacing.lg, padding: tokens.spacing.md, background: `${tokens.colors.ink}08`, border: `${tokens.borders.hairline} ${tokens.colors.slate}` }}>
        <p style={{ fontSize: '0.75rem', color: tokens.colors.slate, margin: `0 0 ${tokens.spacing.xs} 0` }}>
          Message Preview / संदेश पूर्वावलोकन
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{message}</p>
      </div>

      {/* Send buttons */}
      {channel === 'smartphone' ? (
        <motion.a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSend('whatsapp')}
          {...(shouldReduceMotion ? {} : { whileHover: { scale: 1.01 }, whileTap: { scale: 0.98 } })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing.sm,
            width: '100%',
            padding: tokens.spacing.lg,
            background: '#25D366', // WhatsApp brand green
            color: '#fff',
            textDecoration: 'none',
            fontFamily: tokens.fonts.body,
            fontWeight: 700,
            fontSize: '1rem',
            minHeight: tokens.touch.minTarget,
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Send via WhatsApp"
        >
          <span style={{ fontSize: '1.4rem' }}>💬</span>
          WhatsApp पर भेजें / Send via WhatsApp
        </motion.a>
      ) : (
        <motion.a
          href={smsLink}
          onClick={() => handleSend('sms')}
          {...(shouldReduceMotion ? {} : { whileHover: { scale: 1.01 }, whileTap: { scale: 0.98 } })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing.sm,
            width: '100%',
            padding: tokens.spacing.lg,
            background: tokens.colors.authority,
            color: tokens.colors.paper,
            textDecoration: 'none',
            fontFamily: tokens.fonts.body,
            fontWeight: 700,
            fontSize: '1rem',
            minHeight: tokens.touch.minTarget,
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Send via SMS"
        >
          <span style={{ fontSize: '1.4rem' }}>📨</span>
          SMS भेजें / Send via SMS
        </motion.a>
      )}

      {/* Sent confirmation */}
      {sent && (
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={tokens.motion.spring}
          role="status"
          style={{ marginTop: tokens.spacing.md, color: tokens.colors.verifiedForest, fontWeight: 600, fontSize: '0.9rem' }}
        >
          ✓ {sent === 'whatsapp' ? 'WhatsApp link opened' : 'SMS compose opened'} —
          farmer will receive the message once they send it.
        </motion.p>
      )}
    </div>
  );
}

// ─── Compact Alert Button (for embedding in other screens) ────────────────────

interface AlertButtonProps {
  payload: NotificationPayload;
  recipientPhone?: string;
  label?: string;
}

/**
 * Compact trigger that opens a floating notification sheet.
 * Use this inside dashboard, harvest-timing, etc. without rebuilding the full panel.
 */
export function AlertButton({ payload, recipientPhone, label }: AlertButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        {...(shouldReduceMotion ? {} : { whileTap: { scale: 0.96 } })}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          background: tokens.colors.alertOchre,
          color: tokens.colors.paper,
          border: 'none',
          fontFamily: tokens.fonts.body,
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          minHeight: tokens.touch.minTarget,
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>🔔</span>
        {label ?? 'Send Alert / सूचना भेजें'}
      </motion.button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Farmer Notification"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28,43,54,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            padding: tokens.spacing.md,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <motion.div
            initial={shouldReduceMotion ? {} : { y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={tokens.motion.spring}
            style={{ width: '100%', maxWidth: '560px', position: 'relative' }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close notification panel"
              style={{
                position: 'absolute',
                top: '-2.5rem',
                right: 0,
                background: 'none',
                border: 'none',
                color: tokens.colors.paper,
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <NotificationPanel
              payload={{ ...payload, language: payload.language }}
              recipientPhone={recipientPhone}
              onSent={() => setTimeout(() => setOpen(false), 2000)}
            />
          </motion.div>
        </div>
      )}
    </>
  );
}

export default NotificationPanel;
