'use client';
import { useState } from 'react';
import { tokens } from '@/lib/design-tokens';

export default function HarvestTimingPage() {
  const [data] = useState({
    loss_risk: 0.42,
    gain_wait: 12,
    threats: [
      { threat: 'Unseasonal Rain / बेमौसम बारिश', severity: 'High', icon: '🌧️' },
      { threat: 'Pest Surge / कीट प्रकोप', severity: 'Medium', icon: '🐛' }
    ]
  });

  return (
    <div className="mukta-font" style={{ backgroundColor: tokens.colors.paper, color: tokens.colors.ink, minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: tokens.colors.authority }}>Harvest Timing Intelligence / कटाई समय बुद्धिमत्ता</h1>
      <div style={{ borderBottom: `1px solid ${tokens.colors.ink}`, margin: '1rem 0 2rem 0' }} />
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ flex: 1, padding: '2rem', border: `2px solid ${tokens.colors.alertOchre}`, textAlign: 'center' }}>
          <h3>Loss if harvest today / आज कटाई पर नुकसान</h3>
          <div style={{ fontFamily: 'Source Serif 4', fontSize: '4rem', color: tokens.colors.alertOchre }}>
            {(data.loss_risk * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ flex: 1, padding: '2rem', border: `2px solid ${tokens.colors.verifiedForest}`, textAlign: 'center' }}>
          <h3>Gain if wait 5 days / 5 दिन रुकने पर लाभ</h3>
          <div style={{ fontFamily: 'Source Serif 4', fontSize: '4rem', color: tokens.colors.verifiedForest }}>
            +{data.gain_wait}%
          </div>
        </div>
      </div>

      <div>
        <h3>Climate Threats Timeline / जलवायु खतरा समयरेखा</h3>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {data.threats.map(t => (
            <div key={t.threat} style={{ padding: '1rem', border: `1px solid ${tokens.colors.ink}`, minWidth: '250px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t.icon}</div>
              <div style={{ fontWeight: 'bold' }}>{t.threat}</div>
              <div style={{ color: t.severity === 'High' ? tokens.colors.alertOchre : tokens.colors.authority }}>Severity: {t.severity}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: `${tokens.colors.ink}11` }}>
        <h3>Storage Recommendation / भंडारण सुझाव</h3>
        <p>Wait 5 days to reduce moisture content before storing. Hermetic bags recommended.</p>
      </div>

      <button style={{ marginTop: '2rem', background: tokens.colors.authority, color: tokens.colors.paper, padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer' }}>
        Share with Gram Panchayat / ग्राम पंचायत से साझा करें
      </button>
    </div>
  );
}
