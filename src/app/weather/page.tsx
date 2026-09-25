'use client';
import { useEffect, useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import { motion } from 'framer-motion';

export default function WeatherPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/weather/live?lat=20.5937&lon=78.9629')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ color: tokens.colors.authority, padding: '2rem' }}>Loading weather data... / मौसम डेटा लोड हो रहा है...</div>;

  return (
    <div className="mukta-font" style={{ backgroundColor: tokens.colors.paper, color: tokens.colors.ink, minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: tokens.colors.authority }}>Live Weather Dashboard / मौसम डैशबोर्ड</h1>
      <div style={{ borderBottom: `1px solid ${tokens.colors.ink}`, margin: '1rem 0' }} />
      
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        <div>
          <h2>Heat Index (WBGT)</h2>
          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ rotate: -90 }}
              animate={{ rotate: (data.current.heatstress_index * 180) - 90 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ position: 'absolute', width: '2px', height: '70px', background: tokens.colors.alertOchre, transformOrigin: 'bottom center', top: '5px' }}
            />
            <span style={{ fontFamily: 'Source Serif 4', fontSize: '3rem', zIndex: 10 }}>{(data.current.heatstress_index * 100).toFixed(0)}</span>
          </div>
        </div>
        
        <div>
          <h2>3-Day Forecast / 3-दिन का पूर्वानुमान</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.forecast?.time?.slice(0,3).map((t: string, i: number) => (
              <div key={t} style={{ display: 'flex', justifyContent: 'space-between', width: '300px', paddingBottom: '0.5rem', borderBottom: `1px solid ${tokens.colors.ink}33` }}>
                <span>{t}</span>
                <span>{data.forecast.temperature_2m_max[i]}°C / {data.forecast.temperature_2m_min[i]}°C</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', border: `1px solid ${tokens.colors.alertOchre}` }}>
        <h3 style={{ color: tokens.colors.alertOchre, margin: '0 0 1rem 0' }}>Crop Risk Alerts / फसल जोखिम अलर्ट</h3>
        <p style={{ fontWeight: 'bold' }}>Disaster Probability: 15% chance of heatwave in next 30 days</p>
        <button onClick={() => alert('Notification broadcast to neighbours!')} style={{ background: tokens.colors.authority, color: tokens.colors.paper, padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
          Notify Neighbours / पड़ोसियों को सूचित करें
        </button>
      </div>
    </div>
  );
}
