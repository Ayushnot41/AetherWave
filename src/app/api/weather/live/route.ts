import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid coordinates', details: parsed.error.issues }, { status: 400 });
  const { lat, lon } = parsed.data;
  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,windspeed_10m,precipitation,weathercode,relativehumidity_2m&timezone=Asia/Kolkata&forecast_days=3&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max`;
    const res = await fetch(apiUrl, { next: { revalidate: 1800 } } as any);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const data = await res.json();
    const temp = data.current.temperature_2m;
    const humidity = data.current.relativehumidity_2m;
    // WBGT approximation for heat stress
    const heatstress_index = Math.min(1, Math.max(0, (temp - 25) / 20 * 0.7 + (humidity - 40) / 60 * 0.3));
    return NextResponse.json({
      current: { ...data.current, heatstress_index },
      forecast: data.daily,
      meta: { lat, lon, units: data.current_units, timezone: data.timezone },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Weather fetch failed', message: String(err) }, { status: 502 });
  }
}
