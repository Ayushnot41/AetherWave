/**
 * GET /api/risk/current?lat=&lon=&deviceId=
 *
 * Home dashboard backing endpoint.
 * Returns current risk level, heat index, and active alert count.
 * Used by dashboard's no-risk / elevated-risk / action-pending states.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchWeather, calculateDisasterProbabilities } from '@/lib/weather';

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  deviceId: z.string().min(1).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = QuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Invalid parameters', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lat, lon } = parsed.data;

  const weather = await fetchWeather(lat, lon);
  const disasters = calculateDisasterProbabilities(weather);

  // Determine overall risk level
  const maxRisk = Math.max(disasters.flood, disasters.heatwave, disasters.cyclone, disasters.hailstorm);
  const riskLevel = maxRisk >= 75 ? 'critical' : maxRisk >= 45 ? 'elevated' : 'none';

  // Active alert count (simplified)
  const activeAlerts = Object.values(disasters).filter(p => p >= 60).length;

  return NextResponse.json({
    riskLevel,
    heatIndex: weather.heatIndex,
    temperature: weather.temperature,
    condition: weather.condition,
    disasterProbabilities: disasters,
    activeAlertCount: activeAlerts,
    recommendation: riskLevel === 'critical'
      ? { action: 'immediate', message: 'Launch Telemetry Scan now — critical risk detected', cta: 'Launch Telemetry Scan' }
      : riskLevel === 'elevated'
      ? { action: 'monitor', message: 'Elevated risk — monitor conditions closely', cta: 'View Advisory' }
      : { action: 'normal', message: 'Normal conditions — schedule regular monitoring', cta: 'View Dashboard' },
    meta: {
      fetchedAt: new Date().toISOString(),
      isLive: weather.isLive,
      source: weather.isLive ? 'Open-Meteo (live)' : 'DEMO_MODE fixture',
    },
  });
}
