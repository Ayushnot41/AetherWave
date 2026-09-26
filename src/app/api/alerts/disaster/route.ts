/**
 * GET /api/alerts/disaster (Server-Sent Events)
 *
 * Government Disaster Alert Relay — real-time state-level emergency warnings.
 *
 * Architecture note: Raw WebSockets don't run on Vercel serverless functions.
 * This endpoint uses Server-Sent Events (SSE) which is compatible with
 * Next.js streaming responses on Vercel Edge runtime.
 *
 * Data source: Representative sample alerts (labeled DEMO_MODE).
 * In production: integrate with India Meteorological Department (IMD) API,
 * NDMA (National Disaster Management Authority) RSS feed, or INCOIS alerts.
 */

import { env } from '@/lib/env';

const DEMO_ALERTS = [
  {
    id: 'alert-001',
    severity: 'extreme',
    type: 'heatwave',
    title: 'अत्यधिक गर्मी की लहर चेतावनी — Extreme Heatwave Warning',
    description: 'IMD Orange Alert: Temperature forecast 44–47°C. Avoid outdoor work 11am–4pm. Keep livestock sheltered. Apply mulch immediately.',
    descriptionHi: 'IMD नारंगी चेतावनी: तापमान 44–47°C पूर्वानुमान। 11am–4pm के बीच बाहरी काम से बचें।',
    state: 'Rajasthan',
    district: 'Barmer',
    issuedAt: new Date().toISOString(),
    source: 'IMD (DEMO_MODE representative alert)',
    demoMode: true,
  },
  {
    id: 'alert-002',
    severity: 'high',
    type: 'flood',
    title: 'नदी बाढ़ चेतावनी — River Flood Advisory',
    description: 'CWC Advisory: Luni River at Danger Level. Move livestock to high ground. Harvest standing crops immediately.',
    descriptionHi: 'CWC सलाह: लूनी नदी खतरे के स्तर पर है। पशुओं को ऊंचे स्थान पर ले जाएं।',
    state: 'Rajasthan',
    district: 'Barmer',
    issuedAt: new Date(Date.now() - 3600_000).toISOString(),
    source: 'CWC (DEMO_MODE representative alert)',
    demoMode: true,
  },
  {
    id: 'alert-003',
    severity: 'medium',
    type: 'pest',
    title: 'टिड्डी दल चेतावनी — Locust Swarm Alert',
    description: 'FAO/DLAM warning: Desert locust swarms reported 120km NW. Monitor crop boundaries. Report sightings to district agriculture officer.',
    descriptionHi: 'FAO/DLAM चेतावनी: रेगिस्तानी टिड्डियों की झुंड 120 किमी NW में रिपोर्ट की गई।',
    state: 'Rajasthan',
    district: 'Jaisalmer',
    issuedAt: new Date(Date.now() - 7200_000).toISOString(),
    source: 'FAO/DLAM (DEMO_MODE representative alert)',
    demoMode: true,
  },
];

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connected = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString(), demoMode: env.DEMO_MODE || true })}\n\n`;
      controller.enqueue(encoder.encode(connected));

      // Send current alerts immediately
      for (const alert of DEMO_ALERTS) {
        const msg = `data: ${JSON.stringify({ event: 'alert', ...alert })}\n\n`;
        controller.enqueue(encoder.encode(msg));
      }

      // Keep-alive heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          const ping = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      // Simulate a new alert after 45 seconds for demo effect
      const demoAlert = setTimeout(() => {
        try {
          const newAlert = {
            type: 'alert',
            id: `alert-live-${Date.now()}`,
            severity: 'high',
            alertType: 'thunderstorm',
            title: 'वज्रपात चेतावनी — Thunderstorm Warning',
            description: 'IMD Red Alert: Severe thunderstorm with lightning expected in 2 hours. Disconnect electrical equipment. Stay indoors.',
            state: 'Rajasthan',
            issuedAt: new Date().toISOString(),
            source: 'IMD (DEMO_MODE simulated incoming alert)',
            demoMode: true,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(newAlert)}\n\n`));
        } catch {
          // Stream closed
        }
      }, 45_000);

      // Cleanup on stream close
      return () => {
        clearInterval(heartbeat);
        clearTimeout(demoAlert);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'Access-Control-Allow-Origin': '*',
    },
  });
}
