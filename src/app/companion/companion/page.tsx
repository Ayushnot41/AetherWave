'use client';

/**
 * Kisan Sahayak // किसान सहायक — AI Agronomic Companion & Voice Copilot
 * Institutional Government of India Standard // Digital Agriculture Mission
 * Bilingual Conversational Assistant with Audio Guidance, Mandi Arbitrage,
 * Disaster Forewarning, and Direct Solana Sealing.
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { tokens } from '@/lib/design-tokens';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  textEn: string;
  textHi: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  category?: 'weather' | 'sowing' | 'mandi' | 'insurance' | 'fertilizer';
  dataCard?: {
    title: string;
    metrics: { label: string; value: string; color?: string }[];
  };
}

export default function CompanionPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      textEn:
        'Namaste Farmer Brother! I am Kisan Sahayak, your 24/7 AI Agronomic Companion connected to ISRO RISAT-1B SAR Radar, Open-Meteo, and Agmarknet Mandis. How can I assist your farm today?',
      textHi:
        'नमस्ते किसान भाई! मैं किसान सहायक हूँ, आपका चौबीसों घंटे सक्रिय डिजिटल साथी। मैं इसरो उपग्रह, मौसम रडार एवं मंडी भाव ग्रिड से सीधे जुड़ा हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?',
      timestamp: 'Just now',
      category: 'weather',
      dataCard: {
        title: 'Central Deccan Synoptic Status // मौसम स्थिति',
        metrics: [
          { label: '3-Day Rain Sum', value: '2.5 mm', color: '#0284C7' },
          { label: 'Soil Moisture', value: '22% (Optimal)', color: '#166534' },
          { label: 'Wheat MSP 2026', value: '₹2,425 / Qtl', color: '#B96A28' },
        ],
      },
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'hi' | 'en'>('hi');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    {
      titleEn: 'Is sowing wheat safe this week?',
      titleHi: 'क्या इस हफ्ते गेहूं बोना सुरक्षित है?',
      category: 'sowing',
    },
    {
      titleEn: 'Check 30-day flood risk',
      titleHi: '३०-दिवसीय बाढ़ जोखिम जांचें',
      category: 'weather',
    },
    {
      titleEn: 'Neemuch Mandi Wheat MSP price',
      titleHi: 'नीमच मंडी गेहूं भाव एवं एमएसपी',
      category: 'mandi',
    },
    {
      titleEn: 'How to claim crop loss compensation?',
      titleHi: 'फसल नुकसान मुआवजा कैसे प्राप्त करें?',
      category: 'insurance',
    },
    {
      titleEn: 'Urea & DAP dosage for 2 acres',
      titleHi: '२ एकड़ के लिए यूरिया एवं डीएपी की मात्रा',
      category: 'fertilizer',
    },
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice playback using Web Speech API
  const handleSpeak = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const generateAnswer = (query: string): Message => {
    const q = query.toLowerCase();
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (q.includes('sow') || q.includes('बोना') || q.includes('बीज') || q.includes('seed')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        textEn:
          'Sowing Wheat HD-2967 or PBW-550 is HIGHLY RECOMMENDED over the next 48 hours. Soil volumetric moisture is at 22% and nighttime temperature is 18°C. Sowing on time yields an estimated +₹91,440 profit across 2.4 acres, avoiding late-season heat scorching.',
        textHi:
          'अगले ४८ घंटों में गेहूं एचडी-२९६७ की बुआई अत्यधिक अनुशंसित है। मिट्टी में नमी २२% और रात का तापमान १८°से. है। समय पर बुआई करने से प्रति एकड़ अधिकतम पैदावार मिलेगी और बाद में तेज धूप से नुकसान नहीं होगा।',
        timestamp: ts,
        category: 'sowing',
        actionUrl: '/crop-advisor',
        actionLabel: 'Open 3D Voxel Parcel & Seed Calculator',
        dataCard: {
          title: 'Sowing Economic Ledger // बुआई आर्थिक लाभ',
          metrics: [
            { label: 'Recommended Seed', value: '40 kg/acre (HD-2967)' },
            { label: 'On-Time Net Profit', value: '+₹91,440', color: '#166534' },
            { label: 'Delay Penalty', value: '-₹520 / day', color: '#991B1B' },
          ],
        },
      };
    }

    if (q.includes('flood') || q.includes('बाढ़') || q.includes('मौसम') || q.includes('weather') || q.includes('rain') || q.includes('बारिश')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        textEn:
          'Our Doppler Weather Radar detects low atmospheric pressure in the regional basin. 30-day flood probability is 28% and unseasonal squall wind risk is 34%. No extreme downpour alert in the next 72 hours. Check our 3D Radar Dome for live microwave sweeps.',
        textHi:
          'डॉपलर मौसम रडार के अनुसार अगले ७२ घंटों में भारी वर्षा का कोई तात्कालिक खतरा नहीं है। ३०-दिवसीय बाढ़ जोखिम २८% आंका गया है। खेत की जल निकासी नालियां खुली रखें। लाइव डॉपलर ३डी रडार में बादल गति देख सकते हैं।',
        timestamp: ts,
        category: 'weather',
        actionUrl: '/weather',
        actionLabel: 'Open 3D Volumetric Doppler Dome',
        dataCard: {
          title: 'Disaster Hazard Forewarning // आपदा पूर्वचेतावनी',
          metrics: [
            { label: 'Flood Risk', value: '28% (Moderate)', color: '#0284C7' },
            { label: 'Heatwave Risk', value: '18% (Low)', color: '#B96A28' },
            { label: 'Squall Wind', value: '16 km/h', color: '#166534' },
          ],
        },
      };
    }

    if (q.includes('mandi') || q.includes('मंडी') || q.includes('भाव') || q.includes('price') || q.includes('rate') || q.includes('msp')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        textEn:
          'Current APMC Mandi Spot Rate for Wheat in Neemuch is ₹2,480/quintal (Above MSP of ₹2,425). At Khanna Mandi, Basmati is trading at ₹3,850/quintal. We recommend harvesting mature parcels immediately to capture high spot rates before moisture deductions.',
        textHi:
          'नीमच मंडी में आज गेहूं का भाव ₹२,४८० प्रति क्विंटल है (सरकारी एमएसपी ₹२,४२५ से अधिक)। खन्ना मंडी में बासमती ₹३,८५० बिका। यदि फसल पक चुकी है तो तुरंत कटाई करके नजदीकी मंडी ले जाना लाभदायक रहेगा।',
        timestamp: ts,
        category: 'mandi',
        actionUrl: '/market-prices',
        actionLabel: 'View Live Agmarknet Price Rail',
        dataCard: {
          title: 'Agmarknet APMC Price Benchmark // मंडी भाव तुलना',
          metrics: [
            { label: 'Neemuch Spot', value: '₹2,480 / Qtl', color: '#166534' },
            { label: 'Govt MSP 2026', value: '₹2,425 / Qtl' },
            { label: 'Gain vs MSP', value: '+₹55 / Qtl', color: '#166534' },
          ],
        },
      };
    }

    if (q.includes('claim') || q.includes('compensation') || q.includes('मुआवजा') || q.includes('loss') || q.includes('नुकसान') || q.includes('insurance')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        textEn:
          'AetherWave provides INSTANT micro-relief via Bhu-Drishti AI camera capture and Solana ZK-Proof minting. Simply click a photo of the affected field parcel. The system cryptographically binds your phone GPS, proves damage via satellite SAR, and authorizes direct bank escrow release.',
        textHi:
          'एथरवेव पर मुआवजा प्राप्त करना पूर्णतः पारदर्शी और स्वचालित है। "भू-दृष्टि कैमरा" खोलकर प्रभावित खेत की फोटो लें। मोबाइल का जीपीएस और सैटेलाइट रडार नुकसान की पुष्टि करते हैं और सोलाना ब्लॉकचेन पर त्वरित राहत राशि स्वीकृत होती है।',
        timestamp: ts,
        category: 'insurance',
        actionUrl: '/verification/capture',
        actionLabel: 'Open Bhu-Drishti AI Camera Scanner',
        dataCard: {
          title: 'Cryptographic Claim Rail // ब्लॉकचेन राहत प्रक्रिया',
          metrics: [
            { label: 'Verification Method', value: 'SHA-256 Hardware GPS' },
            { label: 'Settlement Speed', value: '< 15 Minutes' },
            { label: 'Direct Disbursal', value: 'Aadhaar / UPI Bank Escrow' },
          ],
        },
      };
    }

    // Default fertilizer & agronomic recommendation
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      textEn:
        'For 2.4 acres of loamy wheat parcel: Apply 1 bag DAP (50 kg) + 1/2 bag MOP (25 kg) at sowing as basal dose. Top-dress with 1 bag Neem-Coated Urea (45 kg) at first irrigation (21 days). Adding 5 kg Zinc Sulphate prevents Khaira deficiency.',
      textHi:
        '२.४ एकड़ दोमट खेत में गेहूं के लिए: बुआई के समय १ बोरी डीएपी (५० किग्रा) + आधी बोरी पोटाश (२५ किग्रा) आधार खाद के रूप में दें। पहली सिंचाई (२१ दिन बाद) पर १ बोरी नीम-लेपित यूरिया (४५ किग्रा) डालें। ५ किग्रा जिंक सल्फेट मिलाने से पीलापन नहीं आएगा।',
      timestamp: ts,
      category: 'fertilizer',
      actionUrl: '/crop-advisor',
      actionLabel: 'View Detailed Agronomic Schedule',
      dataCard: {
        title: 'Nutrient Dosage Prescription // अनुशंसित उर्वरक',
        metrics: [
          { label: 'Basal DAP (18:46:0)', value: '50 kg (1 Bag)' },
          { label: 'Neem-Coated Urea', value: '45 kg (Top-Dress)' },
          { label: 'Zinc Sulphate (21%)', value: '5 kg / Acre' },
        ],
      },
    };
  };

  const handleSend = (text?: string) => {
    const query = text || inputQuery;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      textEn: query,
      textHi: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const responseMsg = generateAnswer(query);
      setMessages((prev) => [...prev, responseMsg]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <div
      className="mukta-font"
      style={{
        backgroundColor: tokens.colors.paper,
        color: tokens.colors.ink,
        minHeight: '100vh',
        padding: '16px 16px 90px 16px',
        maxWidth: '1080px',
        margin: '0 auto',
      }}
    >
      {/* ─── Header Masthead ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: `2px solid ${tokens.colors.authority}`,
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: tokens.colors.authority,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 3px 10px rgba(21, 51, 80, 0.25)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M9 13v2" />
              <path d="M15 13v2" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1
                style={{
                  fontFamily: 'Source Serif 4, Georgia, serif',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  margin: 0,
                  color: tokens.colors.authority,
                }}
              >
                Kisan Sahayak // किसान सहायक
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid #BBF7D0',
                }}
              >
                ONLINE 24x7
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: tokens.colors.ink, opacity: 0.8 }}>
              भारतीय कृषि अनुसंधान परिषद (ICAR) एवं मौसम रडार आधारित डिजिटल कृषि सलाहकार
            </p>
          </div>
        </div>

        {/* Language Switcher Button */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FFFFFF', padding: '3px', borderRadius: '6px', border: `1px solid ${tokens.colors.ink}20` }}>
          <button
            type="button"
            onClick={() => setActiveLang('hi')}
            style={{
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: activeLang === 'hi' ? 700 : 500,
              backgroundColor: activeLang === 'hi' ? tokens.colors.authority : 'transparent',
              color: activeLang === 'hi' ? '#FFFFFF' : tokens.colors.ink,
              cursor: 'pointer',
            }}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            style={{
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: activeLang === 'en' ? 700 : 500,
              backgroundColor: activeLang === 'en' ? tokens.colors.authority : 'transparent',
              color: activeLang === 'en' ? '#FFFFFF' : tokens.colors.ink,
              cursor: 'pointer',
            }}
          >
            English
          </button>
        </div>
      </div>

      {/* ─── Quick Topic Carousel ───────────────────────────── */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(activeLang === 'hi' ? p.titleHi : p.titleEn)}
            style={{
              whiteSpace: 'nowrap',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${tokens.colors.ink}25`,
              borderRadius: '18px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: tokens.colors.authority,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <span>{activeLang === 'hi' ? p.titleHi : p.titleEn}</span>
          </button>
        ))}
      </div>

      {/* ─── Chat Message History ───────────────────────────── */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: '480px',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const displayedText = activeLang === 'hi' ? msg.textHi : msg.textEn;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: isUser ? '85%' : '92%',
                  backgroundColor: isUser ? tokens.colors.authority : '#FFFFFF',
                  color: isUser ? '#FFFFFF' : tokens.colors.ink,
                  border: isUser ? 'none' : `1px solid ${tokens.colors.ink}25`,
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '14px 16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                {/* Assistant Label & Speaker */}
                {!isUser && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: `1px solid ${tokens.colors.ink}15`,
                      paddingBottom: '6px',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: tokens.colors.authority }}>
                      KISAN SAHAYAK // किसान सहायक
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(displayedText, msg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isSpeaking === msg.id ? '#DC2626' : tokens.colors.authority,
                      }}
                      title="Listen aloud in Hindi/English"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                      <span>{isSpeaking === msg.id ? 'Stop / रोकें' : 'Listen / सुनें'}</span>
                    </button>
                  </div>
                )}

                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{displayedText}</p>

                {/* Structured Data Card if present */}
                {msg.dataCard && (
                  <div
                    style={{
                      marginTop: '12px',
                      backgroundColor: tokens.colors.paper,
                      padding: '10px 12px',
                      border: `1px solid ${tokens.colors.ink}15`,
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.colors.authority, marginBottom: '6px' }}>
                      {msg.dataCard.title}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {msg.dataCard.metrics.map((m, idx) => (
                        <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '6px 8px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{m.label}</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: m.color || tokens.colors.ink, fontFamily: 'Source Serif 4' }}>
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Button if present */}
                {msg.actionUrl && (
                  <div style={{ marginTop: '12px' }}>
                    <Link
                      href={msg.actionUrl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: tokens.colors.authority,
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      <span>{msg.actionLabel}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                )}

                <div
                  style={{
                    fontSize: '0.66rem',
                    opacity: 0.65,
                    marginTop: '6px',
                    textAlign: isUser ? 'right' : 'left',
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: tokens.colors.authority, fontSize: '0.8rem', paddingLeft: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: tokens.colors.authority, display: 'inline-block' }} />
            <span>Kisan Sahayak is calculating agronomic models...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ─── Input Bar (Always Sticky Above Mobile Dock) ───── */}
      <div
        style={{
          position: 'sticky',
          bottom: '68px',
          backgroundColor: '#FFFFFF',
          padding: '10px 14px',
          border: `1px solid ${tokens.colors.ink}30`,
          borderRadius: '10px',
          boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
          marginTop: '20px',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              activeLang === 'hi'
                ? 'मौसम, बुआई, खाद या मंडी भाव के बारे में पूछें...'
                : 'Ask about weather, sowing date, fertilizer, or mandi prices...'
            }
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              color: tokens.colors.ink,
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
            }}
          />

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            style={{
              backgroundColor: inputQuery.trim() ? tokens.colors.authority : '#CBD5E1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: inputQuery.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Send / भेजें</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
