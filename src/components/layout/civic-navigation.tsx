'use client';

/**
 * Universal Civic Header & Responsive Mobile Bottom Dock
 * Institutional Government of India Standard // National Agro-Met Resilience Grid
 * Seamlessly adapts between 360px mobile smartphones, tablets, laptops, and wide monitors.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { tokens } from '@/lib/design-tokens';
import { useLocaleStore } from '@/stores/locale-store';

interface NavItem {
  id: string;
  href: string;
  labelEn: string;
  labelHi: string;
  badge?: string;
  icon: (color: string) => React.ReactNode;
}

export function CivicNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { dialectCode, setDialect } = useLocaleStore();

  // If on initial splash or pure onboarding dialect select, optionally render minimal bar
  const isMinimal = pathname === '/onboarding' || pathname === '/offline';

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      href: '/dashboard',
      labelEn: 'Dashboard',
      labelHi: 'डैशबोर्ड',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      id: 'weather',
      href: '/weather',
      labelEn: '3D Radar',
      labelHi: 'मौसम ग्रिड',
      badge: 'LIVE',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      ),
    },
    {
      id: 'scanner',
      href: '/verification/capture',
      labelEn: 'Bhu-Drishti',
      labelHi: 'भू-दृष्टि',
      badge: 'AI',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      ),
    },
    {
      id: 'advisor',
      href: '/crop-advisor',
      labelEn: 'Crop Advisor',
      labelHi: 'फसल सलाह',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 22 16 8" />
          <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
          <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
        </svg>
      ),
    },
    {
      id: 'mandi',
      href: '/market-prices',
      labelEn: 'Mandi MSP',
      labelHi: 'मंडी भाव',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: 'companion',
      href: '/companion',
      labelEn: 'Kisan Sahayak',
      labelHi: 'किसान सहायक',
      badge: 'COPILOT',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M9 13v2" />
          <path d="M15 13v2" />
        </svg>
      ),
    },
    {
      id: 'vault',
      href: '/payout',
      labelEn: 'Solana Vault',
      labelHi: 'राहत खाता',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="m14 14 3 3" />
        </svg>
      ),
    },
    {
      id: 'alerts',
      href: '/alert-enrollment',
      labelEn: 'Alert Enroll',
      labelHi: 'सतर्कता',
      badge: 'SMS',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          <circle cx="18" cy="8" r="3" fill={color} stroke="none" />
        </svg>
      ),
    },
    {
      id: 'climate-dbt',
      href: '/climate-dbt',
      labelEn: 'Disaster DBT',
      labelHi: 'आपदा राहत',
      badge: 'SOLANA',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <line x1="12" x2="12" y1="6" y2="18" />
        </svg>
      ),
    },
  ];

  if (isMinimal) return null;

  return (
    <>
      {/* ─── Top Government Masthead & Desktop Navigation ──────────────── */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `2px solid ${tokens.colors.authority}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}
      >
        {/* Tricolor Ribbon */}
        <div style={{ display: 'flex', height: '3px', width: '100%' }}>
          <div style={{ flex: 1, backgroundColor: '#FF9933' }} />
          <div style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
          <div style={{ flex: 1, backgroundColor: '#138808' }} />
        </div>

        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & National Grid Branding */}
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: tokens.colors.authority,
            }}
          >
            {/* Government Emblem Symbol */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: tokens.colors.authority,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.1rem',
                boxShadow: '0 2px 6px rgba(21, 51, 80, 0.3)',
              }}
            >
              AW
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'Source Serif 4, Georgia, serif',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    letterSpacing: '-0.3px',
                    color: tokens.colors.authority,
                  }}
                >
                  AetherWave
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: '#EFF6FF',
                    color: tokens.colors.authority,
                    border: '1px solid #BFDBFE',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  GOV.IN RESILIENCE
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: tokens.colors.ink, opacity: 0.8, marginTop: '-1px' }}>
                राष्ट्रीय कृषि मौसम एवं आपदा पूर्वचेतावनी ग्रिड // ISRO RISAT-1B SAR Sync
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
            }}
            className="md:flex"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    color: isActive ? tokens.colors.authority : tokens.colors.ink,
                    backgroundColor: isActive ? '#F1F5F9' : 'transparent',
                    border: isActive ? `1px solid ${tokens.colors.authority}30` : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.icon(isActive ? tokens.colors.authority : '#64748B')}
                  <span>{item.labelEn}</span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        backgroundColor: item.badge === 'LIVE' ? '#DC2626' : item.badge === 'COPILOT' ? '#166534' : tokens.colors.authority,
                        color: '#FFFFFF',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick System Indicators & Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 3-Way Language Switcher (EN | हिन्दी | বাংলা) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
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
                title="Switch to English"
                style={{
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: dialectCode === 'en-IN' ? 700 : 500,
                  backgroundColor: dialectCode === 'en-IN' ? tokens.colors.authority : 'transparent',
                  color: dialectCode === 'en-IN' ? '#FFFFFF' : tokens.colors.ink,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setDialect('hi-IN')}
                title="हिन्दी में बदलें"
                style={{
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: dialectCode === 'hi-IN' ? 700 : 500,
                  backgroundColor: dialectCode === 'hi-IN' ? tokens.colors.authority : 'transparent',
                  color: dialectCode === 'hi-IN' ? '#FFFFFF' : tokens.colors.ink,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setDialect('bn-IN')}
                title="বাংলায় পরিবর্তন করুন"
                style={{
                  padding: '3px 7px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: dialectCode === 'bn-IN' ? 700 : 500,
                  backgroundColor: dialectCode === 'bn-IN' ? tokens.colors.authority : 'transparent',
                  color: dialectCode === 'bn-IN' ? '#FFFFFF' : tokens.colors.ink,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                বাংলা
              </button>
            </div>

            {/* Login / Kisan Portal Button (Desktop) */}
            <Link
              href="/login"
              className="hidden lg:inline-flex"
              style={{
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                backgroundColor: tokens.colors.authority,
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>लॉगिन // Login</span>
            </Link>

            {/* Live GPS Dot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '16px',
                fontSize: '0.72rem',
                color: '#166534',
                fontWeight: 600,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
              <span className="hidden sm:inline">GPS &amp; SAR Active</span>
              <span className="sm:hidden">GPS OK</span>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              style={{
                border: `1px solid ${tokens.colors.ink}30`,
                backgroundColor: '#FFFFFF',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle Navigation Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.authority} strokeWidth="2">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                borderTop: `1px solid ${tokens.colors.ink}20`,
                padding: '12px 16px',
              }}
              className="md:hidden"
            >
              {/* Mobile Quick Actions: Login + Language Bar */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    backgroundColor: tokens.colors.authority,
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>किसान लॉगिन // Login</span>
                </Link>
                <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '2px', backgroundColor: '#F1F5F9' }}>
                  <button
                    type="button"
                    onClick={() => setDialect('en-IN')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: dialectCode === 'en-IN' ? 700 : 500,
                      backgroundColor: dialectCode === 'en-IN' ? tokens.colors.authority : 'transparent',
                      color: dialectCode === 'en-IN' ? '#FFFFFF' : tokens.colors.ink,
                      border: 'none',
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
                      fontSize: '0.72rem',
                      fontWeight: dialectCode === 'hi-IN' ? 700 : 500,
                      backgroundColor: dialectCode === 'hi-IN' ? tokens.colors.authority : 'transparent',
                      color: dialectCode === 'hi-IN' ? '#FFFFFF' : tokens.colors.ink,
                      border: 'none',
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
                      fontSize: '0.72rem',
                      fontWeight: dialectCode === 'bn-IN' ? 700 : 500,
                      backgroundColor: dialectCode === 'bn-IN' ? tokens.colors.authority : 'transparent',
                      color: dialectCode === 'bn-IN' ? '#FFFFFF' : tokens.colors.ink,
                      border: 'none',
                    }}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: pathname === item.href ? '#F1F5F9' : '#F8FAFC',
                      border: `1px solid ${pathname === item.href ? tokens.colors.authority : '#E2E8F0'}`,
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: tokens.colors.ink,
                      fontSize: '0.82rem',
                      fontWeight: pathname === item.href ? 700 : 500,
                    }}
                  >
                    {item.icon(tokens.colors.authority)}
                    <div>
                      <div>{item.labelEn}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{item.labelHi}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Mobile Bottom Ergonomic Navigation Dock (Phones Only) ──────── */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: '#FFFFFF',
          borderTop: `1px solid ${tokens.colors.ink}20`,
          boxShadow: '0 -4px 18px rgba(0, 0, 0, 0.10)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 6px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 8px',
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          {/* Dashboard */}
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '8px',
              color: pathname === '/dashboard' ? tokens.colors.authority : '#64748B',
              minWidth: '56px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span style={{ fontSize: '0.68rem', fontWeight: pathname === '/dashboard' ? 700 : 500, marginTop: '2px' }}>
              Home
            </span>
          </Link>

          {/* 3D Radar Weather */}
          <Link
            href="/weather"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '8px',
              color: pathname === '/weather' ? tokens.colors.authority : '#64748B',
              minWidth: '56px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span style={{ fontSize: '0.68rem', fontWeight: pathname === '/weather' ? 700 : 500, marginTop: '2px' }}>
              Radar
            </span>
          </Link>

          {/* Bhu-Drishti Center Action Pill */}
          <Link
            href="/verification/capture"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              marginTop: '-18px',
            }}
          >
            <motion.div
              whileTap={{ scale: 0.92 }}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #153350 0%, #33573C 100%)',
                border: '3px solid #FFFFFF',
                boxShadow: '0 4px 14px rgba(21, 51, 80, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </motion.div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: tokens.colors.authority, marginTop: '2px' }}>
              भू-दृष्टि
            </span>
          </Link>

          {/* Mandi Prices */}
          <Link
            href="/market-prices"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '8px',
              color: pathname === '/market-prices' ? tokens.colors.authority : '#64748B',
              minWidth: '56px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span style={{ fontSize: '0.68rem', fontWeight: pathname === '/market-prices' ? 700 : 500, marginTop: '2px' }}>
              Mandi
            </span>
          </Link>

          {/* Kisan Sahayak AI Companion */}
          <Link
            href="/companion"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '8px',
              color: pathname === '/companion' ? tokens.colors.authority : '#64748B',
              minWidth: '56px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M9 13v2" />
              <path d="M15 13v2" />
            </svg>
            <span style={{ fontSize: '0.68rem', fontWeight: pathname === '/companion' ? 700 : 500, marginTop: '2px' }}>
              सहायक
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
