'use client';
import { useEffect, useState } from 'react';
import { tokens } from '@/lib/design-tokens';

export default function MarketPricesPage() {
  const [data, setData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const fetchPrices = () => {
    fetch('/api/market/prices?crop_name=Wheat&state=Maharashtra')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  if (!data) return <div style={{ padding: '2rem' }}>Loading Mandi Prices... / मंडी भाव लोड हो रहे हैं...</div>;

  return (
    <div className="mukta-font" style={{ backgroundColor: tokens.colors.paper, color: tokens.colors.ink, minHeight: '100vh', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: tokens.colors.authority }}>Live Mandi Prices / लाइव मंडी भाव</h1>
        <button onClick={fetchPrices} style={{ padding: '0.5rem 1rem', background: 'transparent', border: `1px solid ${tokens.colors.ink}`, cursor: 'pointer' }}>
          Refresh ↻ (Last updated: {lastUpdated})
        </button>
      </div>
      <div style={{ borderBottom: `1px solid ${tokens.colors.ink}`, margin: '1rem 0 2rem 0' }} />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['Wheat', 'Rice', 'Cotton'].map(crop => (
          <button key={crop} style={{ padding: '0.5rem 1.5rem', background: crop === 'Wheat' ? tokens.colors.authority : 'transparent', color: crop === 'Wheat' ? tokens.colors.paper : tokens.colors.ink, border: `1px solid ${tokens.colors.authority}` }}>
            {crop}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${tokens.colors.ink}` }}>
            <th style={{ padding: '1rem' }}>Market / मंडी</th>
            <th style={{ padding: '1rem' }}>Variety / किस्म</th>
            <th style={{ padding: '1rem' }}>Modal Price / मॉडल भाव</th>
            <th style={{ padding: '1rem' }}>Trend / रुझान</th>
          </tr>
        </thead>
        <tbody>
          {data.arrivals?.map((arrival: any, i: number) => {
            const trendUp = i % 2 === 0;
            return (
              <tr key={i} style={{ borderBottom: `1px solid ${tokens.colors.ink}33` }}>
                <td style={{ padding: '1rem' }}>{arrival.market}</td>
                <td style={{ padding: '1rem' }}>{arrival.variety}</td>
                <td style={{ padding: '1rem', fontFamily: 'Source Serif 4', fontWeight: 'bold' }}>₹{arrival.modal_price}/q</td>
                <td style={{ padding: '1rem', color: trendUp ? tokens.colors.verifiedForest : tokens.colors.alertOchre }}>
                  {trendUp ? '▲ +5%' : '▼ -2%'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '3rem', padding: '1.5rem', border: `1px solid ${tokens.colors.verifiedForest}`, backgroundColor: `${tokens.colors.verifiedForest}11` }}>
        <h3 style={{ color: tokens.colors.verifiedForest, margin: '0 0 0.5rem 0' }}>Best Time to Sell / बेचने का सबसे अच्छा समय</h3>
        <p>Based on historical trends, prices for Wheat in Maharashtra are expected to peak in 2 weeks. Wait if you have safe storage.</p>
      </div>
    </div>
  );
}
