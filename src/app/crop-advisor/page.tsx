'use client';
import { useEffect, useState } from 'react';
import { tokens } from '@/lib/design-tokens';
import { motion } from 'framer-motion';

export default function CropAdvisorPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/crops/recommend?lat=20.5&lon=78.9&month=' + (new Date().getMonth() + 1) + '&soil_type=loamy')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '2rem' }}>Loading Crop Recommendations... / फसल सुझाव लोड हो रहे हैं...</div>;

  return (
    <div className="mukta-font" style={{ backgroundColor: tokens.colors.paper, color: tokens.colors.ink, minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: tokens.colors.authority }}>Crop Profitability Advisor / फसल लाभ सलाहकार</h1>
      <div style={{ borderBottom: `1px solid ${tokens.colors.ink}`, margin: '1rem 0 2rem 0' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.recommendations?.map((crop: any, i: number) => (
          <motion.div 
            key={crop.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: `1px solid ${tokens.colors.ink}` }}
          >
            <div style={{ width: '200px' }}>
              <h3 style={{ margin: 0 }}>{crop.vernacular_name}</h3>
              <small>{crop.name}</small>
            </div>
            
            <div style={{ flex: 1, margin: '0 2rem' }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Profit Score</div>
              <div style={{ height: '8px', width: '100%', background: `${tokens.colors.ink}33` }}>
                <div style={{ height: '100%', width: `${crop.profit_score * 100}%`, background: tokens.colors.authority }} />
              </div>
            </div>

            <div style={{ width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ 
                padding: '0.2rem 0.5rem', 
                fontSize: '0.8rem',
                color: tokens.colors.paper,
                background: crop.risk_score > 0.5 ? tokens.colors.alertOchre : tokens.colors.verifiedForest 
              }}>
                {crop.risk_score > 0.5 ? 'High Risk' : 'Low Risk'}
              </span>
            </div>

            <button style={{ padding: '0.5rem 1rem', background: tokens.colors.authority, color: tokens.colors.paper, border: 'none', cursor: 'pointer' }}>
              Select / चुनें
            </button>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: `${tokens.colors.authority}11` }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Current Market Context</h3>
        <p>Fetching real-time mandi data for top recommended crops...</p>
      </div>
    </div>
  );
}
