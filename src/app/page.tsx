'use client';

/**
 * AetherWave // National Agro-Met Resilience Grid & Climate Relief Portal
 * Institutional Government of India Standard // Digital Agriculture Mission
 * 
 * Features:
 * - 100% Responsive for both Smartphones (360px-420px) and Desktop/Laptops (>1024px)
 * - Mobile registration and login via Fast2SMS OTP Gateway
 * - Live Geological Climate Shock & Solana DBT Dividend Transfer
 * - ElevenLabs Vernacular Voice Guidance (Sweet Female Voice in Hindi / Bengali / English)
 * - Open-Meteo Synoptic Radar & AgroMonitoring Sentinel-2 Soil Moisture
 * - Live Mandi MSP Price Comparisons (100% INR ₹ format)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-tokens';
import { useAuthStore } from '@/stores/auth-store';
import { useLocaleStore } from '@/stores/locale-store';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const { dialectCode, setDialect } = useLocaleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isBn = dialectCode === 'bn-IN';
  const isHi = dialectCode === 'hi-IN';

  const titleText = isBn
    ? 'জাতীয় কৃষি-আবহাওয়া দুর্যোগ মোচন ও প্রত্যক্ষ সুবিধা হস্তান্তর গ্রিড'
    : isHi
    ? 'राष्ट्रीय कृषि-मौसम आपदा मोचन एवं प्रत्यक्ष लाभ अंतरण ग्रिड'
    : 'National Agro-Met Resilience Grid & Parametric Relief Portal';

  const subtitleText = isBn
    ? 'উপগ্রহ রাডার, রিয়েল-টাইম এআই ভিশন এবং সোলানা ব্লকচেইনের মাধ্যমে তাৎক্ষণিক কৃষক সুরক্ষা'
    : isHi
    ? 'उपग्रह रडार, त्वरित एआई दृष्टि एवं सोलाना ब्लॉकचेन के माध्यम से त्वरित किसान राहत'
    : 'Protecting smallholder farmers against cascading climate shocks with Satellite Radar, AI Vision, and Instant Solana Micro-Relief.';

  return (
    <div
      className="mukta-font"
      style={{
        backgroundColor: tokens.colors.paper,
        color: tokens.colors.ink,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ─── Top National Tricolor Header ──────────────────────────── */}
      <div style={{ display: 'flex', height: '4px', width: '100%' }}>
        <div style={{ flex: 1, backgroundColor: '#FF9933' }} />
        <div style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
        <div style={{ flex: 1, backgroundColor: '#138808' }} />
      </div>

      {/* ─── Masthead & Universal Navigation ───────────────────────── */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `2px solid ${tokens.colors.authority}`,
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Emblem & Portal Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: tokens.colors.authority,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: '0 2px 6px rgba(21, 51, 80, 0.3)',
              }}
            >
              ₹
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: tokens.colors.authority, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Ministry of Agriculture & Farmers Welfare // भारत सरकार
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: tokens.colors.authority, margin: 0 }}>
                AetherWave · एथरवेव
              </div>
            </div>
          </div>

          {/* System Indicators & Dialect Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* 3-Way Dialect Selector */}
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
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: dialectCode === 'en-IN' ? 700 : 500,
                  backgroundColor: dialectCode === 'en-IN' ? tokens.colors.authority : 'transparent',
                  color: dialectCode === 'en-IN' ? '#FFFFFF' : tokens.colors.ink,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setDialect('hi-IN')}
                style={{
                  padding: '4px 8px',
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
                  padding: '4px 8px',
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

            {/* Quick Login Link */}
            <Link
              href="/login"
              style={{
                padding: '6px 14px',
                backgroundColor: tokens.colors.authority,
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(21, 51, 80, 0.2)',
              }}
            >
              <span>👤</span>
              <span>{isBn ? 'লগইন' : isHi ? 'लॉगिन' : 'Login / Register'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section
        style={{
          padding: '36px 16px 28px 16px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Status Callout Banner */}
        {mounted && isAuthenticated && (
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 700 }}>
                {isBn
                  ? `স্বাগতম! আপনি ন্যাশনাল এগ্রো গ্রিডে লগইন করেছেন (${user?.phone || 'কৃষক অ্যাকাউন্ট'})`
                  : isHi
                  ? `सक्रिय सत्र! आप राष्ट्रीय कृषि ग्रिड से जुड़े हैं (${user?.phone || 'किसान खाता'})`
                  : `Active Session: Connected as Beneficiary Farmer (${user?.phone || 'Verified Farmer'})`}
              </span>
            </div>
            <Link
              href="/dashboard"
              style={{
                padding: '6px 12px',
                backgroundColor: '#166534',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '4px',
                textDecoration: 'none',
              }}
            >
              Open Dashboard / डैशबोर्ड खोलें →
            </Link>
          </div>
        )}

        {/* Hero Title & Actions */}
        <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 32px auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#1D4ED8',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            <span>🛰️</span>
            <span>Digital Agriculture Mission // डिजिटल कृषि मिशन</span>
          </div>

          <h1
            style={{
              fontFamily: tokens.fonts.display,
              fontSize: 'clamp(1.7rem, 4vw, 2.7rem)',
              fontWeight: 800,
              color: tokens.colors.authority,
              lineHeight: 1.25,
              margin: '0 0 14px 0',
            }}
          >
            {titleText}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: tokens.colors.slate,
              lineHeight: 1.6,
              margin: '0 0 28px 0',
            }}
          >
            {subtitleText}
          </p>

          {/* Primary Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <Link
              href="/login"
              style={{
                padding: '14px 28px',
                backgroundColor: tokens.colors.authority,
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(21, 51, 80, 0.3)',
              }}
            >
              <span>📱</span>
              <span>
                {isBn
                  ? 'মোবাইল ওটিপি লগইন // প্রবেশ করুন'
                  : isHi
                  ? 'मोबाइल ओटीपी लॉगिन // प्रवेश करें'
                  : 'Fast2SMS Mobile Login // Register'}
              </span>
            </Link>

            <Link
              href="/climate-dbt"
              style={{
                padding: '14px 28px',
                backgroundColor: tokens.colors.verifiedForest,
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(51, 87, 60, 0.3)',
              }}
            >
              <span>⚡</span>
              <span>
                {isBn
                  ? 'দুর্যোগ ত্রাণ DBT (সোলানা) ₹৫,০০০'
                  : isHi
                  ? 'आपदा राहत DBT (सोलाना) ₹5,000'
                  : 'Climate Disaster DBT Rail (₹5,000)'}
              </span>
            </Link>

            <Link
              href="/companion"
              style={{
                padding: '14px 24px',
                backgroundColor: '#FFFFFF',
                color: tokens.colors.authority,
                border: `2px solid ${tokens.colors.authority}`,
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🎙️</span>
              <span>
                {isBn
                  ? 'ভয়েস সহায়ক (মিষ্টি কণ্ঠ)'
                  : isHi
                  ? 'आवाज सहायक (मधुर स्वर)'
                  : 'Kisan AI Voice Assistant'}
              </span>
            </Link>
          </div>
        </div>

        {/* ─── Real-Time Architecture Telemetry Badges ───────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '36px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #16A34A' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.colors.slate, textTransform: 'uppercase' }}>Fast2SMS Indian Gateway</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', margin: '4px 0' }}>200 SMS Armed</div>
            <div style={{ fontSize: '0.78rem', color: tokens.colors.slate }}>Instant 6-digit OTP delivery to Indian SIMs</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #9333EA' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.colors.slate, textTransform: 'uppercase' }}>ElevenLabs Multilingual v2</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7E22CE', margin: '4px 0' }}>Sweet Female Hindi</div>
            <div style={{ fontSize: '0.78rem', color: tokens.colors.slate }}>Voice: Sarah (EXAVITQu4vr4xnSDxMaL)</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #2563EB' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.colors.slate, textTransform: 'uppercase' }}>Solana Devnet Blockchain</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1D4ED8', margin: '4px 0' }}>ZK Relief Escrow</div>
            <div style={{ fontSize: '0.78rem', color: tokens.colors.slate }}>Immutable parametric DBT verification</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #D97706' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.colors.slate, textTransform: 'uppercase' }}>AgroMonitoring & Open-Meteo</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B45309', margin: '4px 0' }}>Sentinel-2 & Radar</div>
            <div style={{ fontSize: '0.78rem', color: tokens.colors.slate }}>10m Surface Moisture & 30-Day Hazards</div>
          </div>
        </div>

        {/* ─── Core Institutional Feature Grid ──────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <h2
            style={{
              fontFamily: tokens.fonts.display,
              fontSize: '1.45rem',
              fontWeight: 800,
              color: tokens.colors.authority,
              marginBottom: '16px',
              borderBottom: '2px solid #E2E8F0',
              paddingBottom: '8px',
            }}
          >
            {isBn ? 'কার্যকরী মডিউল ও পোর্টাল সূচী' : isHi ? 'सक्रिय मॉड्यूल एवं पोर्टल अनुभाग' : 'Operational System Modules & Public Rails'}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Card 1: Farmer Portal */}
            <Link
              href="/login"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '20px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🔐</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#F0FDF4', color: '#166534', fontWeight: 800, borderRadius: '4px' }}>
                    FAST2SMS OTP
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: tokens.colors.authority, margin: '0 0 6px 0' }}>
                  Kisan Registration & Login // किसान पंजीकरण
                </h3>
                <p style={{ fontSize: '0.85rem', color: tokens.colors.slate, lineHeight: 1.5, margin: 0 }}>
                  Passwordless 6-digit SMS OTP authentication, full KYC profile, Aadhaar/PM-KISAN ID, and GPS coordinates mapping.
                </p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 700, color: tokens.colors.authority }}>
                Launch Portal / लॉगिन करें →
              </div>
            </Link>

            {/* Card 2: Climate Disaster DBT */}
            <Link
              href="/climate-dbt"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '20px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>⚡</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 800, borderRadius: '4px' }}>
                    SOLANA DEVNET
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: tokens.colors.authority, margin: '0 0 6px 0' }}>
                  Climate Disaster DBT Rail // त्वरित आपदा राहत
                </h3>
                <p style={{ fontSize: '0.85rem', color: tokens.colors.slate, lineHeight: 1.5, margin: 0 }}>
                  Automated 30-day flood/heatwave forecast, cutting & storage directives, and ₹5,000 instant on-chain DBT dividend with WhatsApp village relay.
                </p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 700, color: tokens.colors.authority }}>
                View Climate DBT / राहत प्राप्त करें →
              </div>
            </Link>

            {/* Card 3: AI Voice Copilot */}
            <Link
              href="/companion"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '20px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🎙️</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#FAF5FF', color: '#7E22CE', fontWeight: 800, borderRadius: '4px' }}>
                    ELEVENLABS HINDI
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: tokens.colors.authority, margin: '0 0 6px 0' }}>
                  Kisan Sahayak Copilot // किसान सहायक
                </h3>
                <p style={{ fontSize: '0.85rem', color: tokens.colors.slate, lineHeight: 1.5, margin: 0 }}>
                  24/7 conversational agronomic AI companion answering questions on sowing, pest control, and mandi MSP in a sweet female voice.
                </p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 700, color: tokens.colors.authority }}>
                Talk with Copilot / बातचीत करें →
              </div>
            </Link>

            {/* Card 4: Weather Radar */}
            <Link
              href="/weather"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '20px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🌦️</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 800, borderRadius: '4px' }}>
                    LIVE OPEN-METEO
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: tokens.colors.authority, margin: '0 0 6px 0' }}>
                  Synoptic Weather Radar // मौसम रडार
                </h3>
                <p style={{ fontSize: '0.85rem', color: tokens.colors.slate, lineHeight: 1.5, margin: 0 }}>
                  Real-time WBGT Heat Index gauge, 3-day rainfall accumulation strip, and 30-day natural hazard forecast based on phone coordinates.
                </p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 700, color: tokens.colors.authority }}>
                Inspect Weather / मौसम देखें →
              </div>
            </Link>

            {/* Card 5: Mandi Prices */}
            <Link
              href="/market-prices"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '20px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>⚖️</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#F0FDF4', color: '#166534', fontWeight: 800, borderRadius: '4px' }}>
                    100% INR ₹
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: tokens.colors.authority, margin: '0 0 6px 0' }}>
                  Agmarknet Mandi Prices // मंडी भाव एवं MSP
                </h3>
                <p style={{ fontSize: '0.85rem', color: tokens.colors.slate, lineHeight: 1.5, margin: 0 }}>
                  Real APMC mandi benchmarks, modal prices, distance calculations, and best times to sell crops to maximize farmer profit.
                </p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 700, color: tokens.colors.authority }}>
                Check Mandi Rates / भाव देखें →
              </div>
            </Link>

            {/* Card 6: Bhu-Drishti Satellite & Ground Audit */}
            <Link
              href="/verification/capture"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '20px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>🛰️</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 800, borderRadius: '4px' }}>
                    WEBCRYPTO SIGNED
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: tokens.colors.authority, margin: '0 0 6px 0' }}>
                  Bhu-Drishti Damage Audit // भू-दृष्टि सत्यापन
                </h3>
                <p style={{ fontSize: '0.85rem', color: tokens.colors.slate, lineHeight: 1.5, margin: 0 }}>
                  Camera photo capture cryptographically bound to hardware gyroscope, GPS, and timestamp for tamper-proof crop claim verification.
                </p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 700, color: tokens.colors.authority }}>
                Start Field Audit / सत्यापन शुरू करें →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Institutional Footer ──────────────────────────────────── */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: '#FFFFFF',
          borderTop: `1px solid #CBD5E1`,
          padding: '20px 16px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: tokens.colors.slate,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <strong>AetherWave</strong> // National Agro-Met Resilience Grid · Ministry of Agriculture & Farmers Welfare
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
            Built with Next.js 15 · Solana Devnet · Fast2SMS Gateway · ElevenLabs Voice · AgroMonitoring · Open-Meteo
          </div>
        </div>
      </footer>
    </div>
  );
}
