'use client';

/**
 * Google Earth Engine & Sentinel-2 Satellite Multispectral Field Analysis Screen
 * Displays live NDVI, NDWI (canopy water content), drought risk, and satellite resolution.
 * Styled in institutional paper/authority/forest tokens with Mukta/Source Serif 4 fonts.
 */

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { tokens } from '@/lib/design-tokens';
import Link from 'next/link';

interface SatelliteData {
  satellite: string;
  coordinates: { lat: number; lon: number };
  timestamp: string;
  indices: {
    ndvi: number;
    ndwi: number;
    savi: number;
  };
  spectral_bands: {
    b4_red: number;
    b8_nir: number;
    b11_swir: number;
  };
  assessment: {
    healthStatus: string;
    healthStatusHi: string;
    recommendation: string;
    recommendationHi: string;
    drought_probability: number;
  };
  resolution_meters: number;
}

export default function SatellitePage() {
  const shouldReduceMotion = useReducedMotion();
  const [data, setData] = useState<SatelliteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 20.5937, lon: 78.9629 }); // Central India default

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => console.warn('Using default coordinates')
      );
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/satellite/ndvi?lat=${coords.lat}&lon=${coords.lon}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [coords]);

  if (loading || !data) {
    return (
      <div
        style={{
          backgroundColor: tokens.colors.paper,
          color: tokens.colors.ink,
          minHeight: '100vh',
          padding: tokens.spacing.xl,
          fontFamily: tokens.fonts.body,
        }}
      >
        <p style={{ color: tokens.colors.authority }}>
          Fetching Sentinel-2 Surface Reflectance via Google Earth Engine... / उपग्रह डेटा लोड हो रहा है...
        </p>
      </div>
    );
  }

  const ndviPct = Math.min(100, Math.max(0, Math.round(data.indices.ndvi * 100)));
  const ndwiPct = Math.min(100, Math.max(0, Math.round(data.indices.ndwi * 100)));

  return (
    <div
      style={{
        backgroundColor: tokens.colors.paper,
        color: tokens.colors.ink,
        minHeight: '100vh',
        fontFamily: tokens.fonts.body,
      }}
    >
      {/* Top status strip */}
      <div
        style={{
          background: tokens.colors.authority,
          color: tokens.colors.paper,
          padding: `${tokens.spacing.sm} ${tokens.spacing.xl}`,
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>🛰️ {data.satellite}</span>
        <span>Resolution: {data.resolution_meters}m/px</span>
        <span>Lat: {data.coordinates.lat.toFixed(4)}, Lon: {data.coordinates.lon.toFixed(4)}</span>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: tokens.spacing.xl }}>
        {/* Header */}
        <div style={{ borderBottom: `${tokens.borders.rule} ${tokens.colors.ink}`, paddingBottom: tokens.spacing.md, marginBottom: tokens.spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1
              style={{
                fontFamily: tokens.fonts.display,
                color: tokens.colors.authority,
                fontSize: '1.6rem',
                margin: 0,
              }}
            >
              Satellite Field Health / उपग्रह खेत स्वास्थ्य
            </h1>
            <Link
              href="/dashboard"
              style={{
                fontSize: '0.85rem',
                color: tokens.colors.authority,
                textDecoration: 'underline',
              }}
            >
              ← Dashboard / डैशबोर्ड
            </Link>
          </div>
          <p style={{ margin: `${tokens.spacing.xs} 0 0 0`, color: tokens.colors.slate, fontSize: '0.85rem' }}>
            Google Earth Engine multispectral vegetation and canopy water index analysis
          </p>
        </div>

        {/* 3D-styled Satellite Map / Spectral Viewport */}
        <div
          style={{
            position: 'relative',
            height: '240px',
            background: 'linear-gradient(135deg, #153350 0%, #1C2B36 100%)',
            border: `${tokens.borders.rule} ${tokens.colors.authority}`,
            marginBottom: tokens.spacing.xl,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: tokens.spacing.lg,
            color: '#FFFFFF',
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage: 'linear-gradient(#EEECE3 1px, transparent 1px), linear-gradient(90deg, #EEECE3 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              pointerEvents: 'none',
            }}
          />

          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
                Sentinel-2 Multispectral Surface Reflectance
              </span>
              <h2 style={{ fontFamily: tokens.fonts.display, margin: '0.2rem 0', fontSize: '1.4rem' }}>
                Field Sector {coords.lat.toFixed(2)}°N, {coords.lon.toFixed(2)}°E
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  background: data.assessment.healthStatus === 'Optimal' ? tokens.colors.verifiedForest : tokens.colors.alertOchre,
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'inline-block',
                }}
              >
                {data.assessment.healthStatus}
              </span>
            </div>
          </div>

          <div style={{ zIndex: 1, display: 'flex', gap: tokens.spacing.xl }}>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>NDVI INDEX</div>
              <div style={{ fontFamily: tokens.fonts.display, fontSize: '2rem', fontWeight: 'bold' }}>
                {data.indices.ndvi.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>CANOPY WATER (NDWI)</div>
              <div style={{ fontFamily: tokens.fonts.display, fontSize: '2rem', fontWeight: 'bold' }}>
                {data.indices.ndwi.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>DROUGHT RISK</div>
              <div style={{ fontFamily: tokens.fonts.display, fontSize: '2rem', fontWeight: 'bold', color: data.assessment.drought_probability > 50 ? '#FFAA55' : '#88FF99' }}>
                {data.assessment.drought_probability}%
              </div>
            </div>
          </div>
        </div>

        {/* Status in vernacular */}
        <div
          style={{
            padding: tokens.spacing.lg,
            borderLeft: `4px solid ${tokens.colors.authority}`,
            background: `${tokens.colors.authority}0A`,
            marginBottom: tokens.spacing.xl,
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: tokens.spacing.xs }}>
            {data.assessment.healthStatusHi}
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: tokens.colors.ink }}>
            {data.assessment.recommendationHi}
          </div>
          <div style={{ fontSize: '0.8rem', color: tokens.colors.slate, marginTop: tokens.spacing.xs }}>
            {data.assessment.recommendation}
          </div>
        </div>

        {/* Index Meters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: tokens.spacing.lg, marginBottom: tokens.spacing.xl }}>
          {/* NDVI */}
          <div style={{ border: `${tokens.borders.hairline} ${tokens.colors.ink}`, padding: tokens.spacing.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
              <span style={{ fontWeight: 600 }}>NDVI (Vegetation Vigour)</span>
              <span style={{ fontFamily: tokens.fonts.display }}>{data.indices.ndvi.toFixed(2)}</span>
            </div>
            <div style={{ height: '8px', background: `${tokens.colors.ink}22`, marginBottom: tokens.spacing.sm }}>
              <motion.div
                initial={shouldReduceMotion ? { width: `${ndviPct}%` } : { width: 0 }}
                animate={{ width: `${ndviPct}%` }}
                transition={tokens.motion.spring}
                style={{ height: '100%', background: tokens.colors.verifiedForest }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: tokens.colors.slate, margin: 0 }}>
              Higher score (&gt;0.5) represents healthy, green chlorophyll-rich foliage.
            </p>
          </div>

          {/* NDWI */}
          <div style={{ border: `${tokens.borders.hairline} ${tokens.colors.ink}`, padding: tokens.spacing.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
              <span style={{ fontWeight: 600 }}>NDWI (Canopy Moisture)</span>
              <span style={{ fontFamily: tokens.fonts.display }}>{data.indices.ndwi.toFixed(2)}</span>
            </div>
            <div style={{ height: '8px', background: `${tokens.colors.ink}22`, marginBottom: tokens.spacing.sm }}>
              <motion.div
                initial={shouldReduceMotion ? { width: `${ndwiPct}%` } : { width: 0 }}
                animate={{ width: `${ndwiPct}%` }}
                transition={tokens.motion.spring}
                style={{ height: '100%', background: tokens.colors.authority }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: tokens.colors.slate, margin: 0 }}>
              Water absorption band indicates leaf water content and moisture stress.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.md }}>
          <Link
            href="/crop-advisor"
            style={{
              padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
              background: tokens.colors.authority,
              color: tokens.colors.paper,
              textDecoration: 'none',
              fontWeight: 600,
              minHeight: tokens.touch.minTarget,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Check Profitable Crops / लाभदायक फसलें
          </Link>
          <Link
            href="/notify"
            style={{
              padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
              background: tokens.colors.alertOchre,
              color: tokens.colors.paper,
              textDecoration: 'none',
              fontWeight: 600,
              minHeight: tokens.touch.minTarget,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Send WhatsApp/SMS Alert / सूचना भेजें
          </Link>
        </div>
      </main>
    </div>
  );
}
