'use client';

/**
 * Gram Panchayat Mutual Aid & Collective Disaster Pool
 * Ministry of Panchayati Raj & Agriculture // Government of India
 * Parametric Smart Escrow Trigger, Rainfall Threshold Gauges,
 * and Community Emergency Relief Disbursal.
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { tokens } from '@/lib/design-tokens';

interface FarmerMember {
  id: string;
  name: string;
  village: string;
  acres: number;
  crop: string;
  status: 'verified' | 'disbursed';
  payoutAmountInr: number;
}

export default function CommunityPoolPage() {
  const [currentRain24h, setCurrentRain24h] = useState<number>(48.2); // mm
  const [triggerThreshold] = useState<number>(65.0); // mm
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [poolBalanceInr, setPoolBalanceInr] = useState<number>(845000);

  const members: FarmerMember[] = [
    { id: 'FM-101', name: 'Rameshwar Patil (रामेश्वर पाटिल)', village: 'Sawangi', acres: 2.5, crop: 'Wheat HD-2967', status: isTriggered ? 'disbursed' : 'verified', payoutAmountInr: 18500 },
    { id: 'FM-102', name: 'Devidas Shinde (देवीदास शिंदे)', village: 'Sawangi', acres: 3.2, crop: 'Mustard Pusa Bold', status: isTriggered ? 'disbursed' : 'verified', payoutAmountInr: 22000 },
    { id: 'FM-103', name: 'Sunita Bai Dhurve (सुनीता बाई धुर्वे)', village: 'Asoli', acres: 1.8, crop: 'Chickpea JG-11', status: isTriggered ? 'disbursed' : 'verified', payoutAmountInr: 14200 },
    { id: 'FM-104', name: 'Anandrao Kale (आनंदराव काले)', village: 'Borgaon', acres: 4.0, crop: 'Wheat PBW-550', status: isTriggered ? 'disbursed' : 'verified', payoutAmountInr: 28000 },
    { id: 'FM-105', name: 'Gopalrao Tekam (गोपालराव टेकाम)', village: 'Sawangi', acres: 2.1, crop: 'Soybean JS-335', status: isTriggered ? 'disbursed' : 'verified', payoutAmountInr: 16500 },
  ];

  const handleSimulateSurge = () => {
    setCurrentRain24h(72.4);
    setIsTriggered(true);
    setPoolBalanceInr(745800);
  };

  const rainPercentage = Math.min(100, Math.round((currentRain24h / triggerThreshold) * 100));

  return (
    <div
      className="mukta-font"
      style={{
        backgroundColor: tokens.colors.paper,
        color: tokens.colors.ink,
        minHeight: '100vh',
        padding: '24px 20px 90px 20px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* ─── Header ────────────────────────────────────────── */}
      <div style={{ borderBottom: `2px solid ${tokens.colors.authority}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colors.authority, fontSize: '0.82rem', fontWeight: 700 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>PANCHAYAT RESILIENCE RAIL // ग्राम पंचायत सामुदायिक आपदा सुरक्षा कोष</span>
        </div>
        <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: '2.1rem', margin: '4px 0 2px 0', color: tokens.colors.authority, fontWeight: 700 }}>
          Community Mutual Aid &amp; Parametric Relief Pool
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: tokens.colors.ink, opacity: 0.85 }}>
          ग्राम पंचायत स्तर पर स्वचालित जलभराव एवं ओलावृष्टि पूर्वचेतावनी एस्क्रो फंड
        </p>
      </div>

      {/* ─── Community Pool Stats Grid ──────────────────────── */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Pool Reserve */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', border: `1px solid ${tokens.colors.ink}25`, borderTop: `4px solid #166534` }}>
          <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>COMMUNITY ESCROW RESERVE (कोष शेष)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Source Serif 4', color: '#166534', marginTop: '4px' }}>
            ₹{poolBalanceInr.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: tokens.colors.ink, opacity: 0.8, marginTop: '4px' }}>
            Protected by Solana Multi-Sig Escrow &bull; 42 Member Farmers
          </div>
        </div>

        {/* Parametric Weather Gauge */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', border: `1px solid ${tokens.colors.ink}25`, borderTop: `4px solid ${isTriggered ? '#DC2626' : '#0284C7'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: isTriggered ? '#DC2626' : '#0284C7', fontWeight: 700 }}>
              24-HOUR RAINFALL GAUGE // २४-घंटे वर्षा माप
            </span>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: isTriggered ? '#FEF2F2' : '#F0F9FF', color: isTriggered ? '#DC2626' : '#0284C7', fontWeight: 700 }}>
              {isTriggered ? 'TRIGGER BREACHED' : 'NORMAL RANGE'}
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Source Serif 4', marginTop: '4px' }}>
            {currentRain24h} mm <span style={{ fontSize: '0.9rem', color: '#64748B' }}>/ {triggerThreshold} mm Trigger</span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '8px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${rainPercentage}%`, backgroundColor: isTriggered ? '#DC2626' : '#0284C7' }} />
          </div>
        </div>

        {/* Quick Simulation Trigger */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', border: `1px solid ${tokens.colors.ink}25`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: tokens.colors.authority, fontWeight: 700 }}>EMERGENCY SIMULATOR // आपातकालीन परीक्षण</div>
            <p style={{ fontSize: '0.8rem', color: tokens.colors.ink, opacity: 0.85, margin: '6px 0 0 0' }}>
              Simulate cloudburst rainfall &gt; 65mm to verify instant parametric smart escrow release.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSimulateSurge}
            disabled={isTriggered}
            style={{
              marginTop: '10px',
              backgroundColor: isTriggered ? '#166534' : '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: isTriggered ? 'default' : 'pointer',
            }}
          >
            {isTriggered ? 'Disbursal Executed to 42 Accounts' : 'Simulate 72mm Cloudburst Surge / परीक्षण करें'}
          </button>
        </div>
      </div>

      {/* ─── Member Farmers Relief Ledger ────────────────────── */}
      <div style={{ marginTop: '28px' }}>
        <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: '1.35rem', color: tokens.colors.authority, margin: '0 0 12px 0', fontWeight: 700 }}>
          Panchayat Enrolled Farmers &amp; Disbursal Ledger // पंजीकृत किसान सूची
        </h2>

        <div style={{ overflowX: 'auto', backgroundColor: '#FFFFFF', border: `1px solid ${tokens.colors.ink}25` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `2px solid ${tokens.colors.ink}20`, color: tokens.colors.authority, fontSize: '0.78rem' }}>
                <th style={{ padding: '12px 14px' }}>MEMBER ID</th>
                <th style={{ padding: '12px 14px' }}>FARMER NAME</th>
                <th style={{ padding: '12px 14px' }}>VILLAGE</th>
                <th style={{ padding: '12px 14px' }}>PARCEL</th>
                <th style={{ padding: '12px 14px' }}>CROP</th>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>RELIEF GRANT</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{m.id}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{m.name}</td>
                  <td style={{ padding: '12px 14px' }}>{m.village}</td>
                  <td style={{ padding: '12px 14px' }}>{m.acres} Acres</td>
                  <td style={{ padding: '12px 14px' }}>{m.crop}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: m.status === 'disbursed' ? '#DCFCE7' : '#EFF6FF',
                        color: m.status === 'disbursed' ? '#166534' : '#1E40AF',
                      }}
                    >
                      {m.status === 'disbursed' ? 'DISBURSED (हस्तांतरित)' : 'COVERAGE ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontFamily: 'Source Serif 4', color: m.status === 'disbursed' ? '#166534' : tokens.colors.ink }}>
                    ₹{m.payoutAmountInr.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
