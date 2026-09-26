'use client';

/**
 * Dedicated page for the AetherWeave Farmer Notification System.
 * Showcases WhatsApp + SMS alert dispatch with language switching.
 * Frontend-only: no backend, no API keys.
 */

import { useState } from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-tokens';
import { NotificationPanel, AlertButton } from '@/components/notifications/farmer-notification';
import type { AlertType, AlertLanguage } from '@/components/notifications/farmer-notification';

const DEMO_SCENARIOS: Array<{
  id: AlertType;
  label: string;
  labelHi: string;
  icon: string;
  description: string;
}> = [
  {
    id: 'climate_disaster',
    label: 'Disaster Alert',
    labelHi: 'आपदा चेतावनी',
    icon: '🚨',
    description: 'Flood / Heatwave / Cyclone threat detected in region',
  },
  {
    id: 'fund_transfer',
    label: 'Fund Transfer',
    labelHi: 'राशि भेजी गई',
    icon: '✅',
    description: 'Solana blockchain confirmed — ₹500 disbursed to farmer',
  },
  {
    id: 'harvest_warning',
    label: 'Harvest Warning',
    labelHi: 'कटाई चेतावनी',
    icon: '⚠️',
    description: 'Adverse weather predicted during harvest window',
  },
  {
    id: 'storage_alert',
    label: 'Storage Alert',
    labelHi: 'भंडारण चेतावनी',
    icon: '📦',
    description: 'High humidity — fungal risk in stored grain',
  },
  {
    id: 'market_price',
    label: 'Market Price',
    labelHi: 'मंडी भाव',
    icon: '📈',
    description: 'Favorable mandi price detected — good time to sell',
  },
];

export default function NotifyPage() {
  const [selected, setSelected] = useState<AlertType>('climate_disaster');
  const [lang, setLang] = useState<AlertLanguage>('hi');

  const selectedScenario = DEMO_SCENARIOS.find((s) => s.id === selected)!;

  const payload = {
    type: selected,
    farmerName: 'रामलाल पाटील',
    language: lang,
    amount: selected === 'fund_transfer' ? 500 : undefined,
    txSignature: selected === 'fund_transfer' ? '3xKq8...mNp2' : undefined,
    cropName: ['harvest_warning', 'storage_alert', 'market_price'].includes(selected) ? 'गेहूं' : undefined,
    disasterType: selected === 'climate_disaster' ? 'बाढ़ (Flood)' : undefined,
  };

  return (
    <div
      style={{
        backgroundColor: tokens.colors.paper,
        color: tokens.colors.ink,
        minHeight: '100vh',
        fontFamily: tokens.fonts.body,
      }}
    >
      {/* Top strip */}
      <div
        style={{
          background: tokens.colors.authority,
          color: tokens.colors.paper,
          padding: `${tokens.spacing.sm} ${tokens.spacing.xl}`,
          fontSize: '0.75rem',
          display: 'flex',
          gap: tokens.spacing.lg,
        }}
      >
        <span>📡 Connected</span>
        <span>AetherWeave — Farmer Alert System</span>
        <span>Frontend-only · No backend required</span>
      </div>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: tokens.spacing.xl }}>
        {/* Header */}
        <div style={{ borderBottom: `${tokens.borders.rule} ${tokens.colors.ink}`, paddingBottom: tokens.spacing.lg, marginBottom: tokens.spacing.xl }}>
          <h1
            style={{
              fontFamily: tokens.fonts.display,
              color: tokens.colors.authority,
              fontSize: '1.6rem',
              margin: `0 0 ${tokens.spacing.xs} 0`,
            }}
          >
            Farmer Notification System
          </h1>
          <p style={{ margin: 0, color: tokens.colors.slate, fontSize: '0.9rem' }}>
            किसान सूचना प्रणाली — WhatsApp (smartphone) / SMS (keypad phone)
          </p>
        </div>

        {/* Enrollment CTA */}
        <Link
          href="/alert-enrollment"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.md,
            padding: tokens.spacing.lg,
            background: `${tokens.colors.verifiedForest}12`,
            borderLeft: `3px solid ${tokens.colors.verifiedForest}`,
            textDecoration: 'none',
            color: tokens.colors.ink,
            marginBottom: tokens.spacing.xl,
          }}
        >
          <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>🔔</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: tokens.colors.verifiedForest, fontSize: '0.95rem' }}>
              Register for Automatic Disaster Alerts → किसान सतर्कता नामांकन
            </p>
            <p style={{ margin: `2px 0 0`, fontSize: '0.8rem', color: tokens.colors.slate }}>
              Enroll your phone, enable push notifications, and broadcast to keypad-phone farmers.
              नामांकन करें · GPS आपदा निगरानी · कीपैड किसानों को SMS भेजें
            </p>
          </div>
        </Link>

        {/* How it works */}
        <div
          style={{
            padding: tokens.spacing.lg,
            background: `${tokens.colors.authority}0A`,
            borderLeft: `3px solid ${tokens.colors.authority}`,
            marginBottom: tokens.spacing.xl,
            fontSize: '0.85rem',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: tokens.colors.authority }}>How it works / कैसे काम करता है</strong>
          <ul style={{ margin: `${tokens.spacing.sm} 0 0 ${tokens.spacing.lg}`, padding: 0 }}>
            <li>For <strong>smartphone farmers</strong>: tapping the WhatsApp button opens WhatsApp with the alert pre-filled in their chosen language.</li>
            <li>For <strong>keypad/feature phone farmers</strong>: tapping SMS opens the phone's SMS compose screen with the message ready to send.</li>
            <li>Zero backend required — all links are client-side native <code>wa.me</code> and <code>sms:</code> URIs.</li>
          </ul>
        </div>

        {/* Scenario picker */}
        <div style={{ marginBottom: tokens.spacing.xl }}>
          <p style={{ fontSize: '0.8rem', color: tokens.colors.slate, margin: `0 0 ${tokens.spacing.sm} 0` }}>
            Select Alert Type / चेतावनी प्रकार चुनें
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
            {DEMO_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                aria-pressed={selected === s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing.md,
                  padding: tokens.spacing.md,
                  border: `${tokens.borders.hairline} ${selected === s.id ? tokens.colors.authority : tokens.colors.slate}`,
                  background: selected === s.id ? `${tokens.colors.authority}0A` : 'transparent',
                  color: tokens.colors.ink,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: tokens.fonts.body,
                  minHeight: tokens.touch.minTarget,
                }}
              >
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</span>
                <span>
                  <strong>{s.label} / {s.labelHi}</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: tokens.colors.slate }}>{s.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderBottom: `${tokens.borders.hairline} ${tokens.colors.slate}`, margin: `${tokens.spacing.xl} 0` }} />

        {/* Active notification panel */}
        <NotificationPanel
          payload={payload}
          defaultChannel="smartphone"
        />

        {/* Inline usage demo */}
        <div style={{ marginTop: tokens.spacing.xxl, paddingTop: tokens.spacing.xl, borderTop: `${tokens.borders.hairline} ${tokens.colors.slate}` }}>
          <h2 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.authority, fontSize: '1rem', marginBottom: tokens.spacing.md }}>
            Embedded Alert Button (used inside other screens)
          </h2>
          <p style={{ fontSize: '0.85rem', color: tokens.colors.slate, marginBottom: tokens.spacing.lg }}>
            The <code>AlertButton</code> component can be embedded in the Dashboard, Harvest Timing, or Weather screens:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.md }}>
            <AlertButton
              payload={{ type: 'climate_disaster', farmerName: 'Ramlal', language: 'hi', disasterType: 'Flood' }}
              label="Alert Farmer / किसान को चेतावनी"
            />
            <AlertButton
              payload={{ type: 'fund_transfer', farmerName: 'Kamala Devi', language: 'mr', amount: 500, txSignature: '5xKm...n2Pq' }}
              label="Send Fund Confirmation"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
