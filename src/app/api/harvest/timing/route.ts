import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  crop_name: z.string().min(1).max(50),
  sowing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

// Crop growth duration in days (sowing → harvest)
const CROP_DURATION_DAYS: Record<string, { min: number; max: number }> = {
  rice: { min: 110, max: 150 },
  wheat: { min: 120, max: 160 },
  cotton: { min: 150, max: 200 },
  sugarcane: { min: 300, max: 365 },
  maize: { min: 80, max: 100 },
  soybean: { min: 90, max: 120 },
  groundnut: { min: 110, max: 140 },
  mustard: { min: 110, max: 140 },
  chickpea: { min: 100, max: 130 },
  lentil: { min: 100, max: 130 },
  tomato: { min: 70, max: 100 },
  onion: { min: 120, max: 150 },
  potato: { min: 80, max: 120 },
};

// WMO weather code → human-readable threat
function decodeWeatherCode(code: number): { label: string; labelHi: string; severity: 'Low' | 'Medium' | 'High' } {
  if (code >= 95) return { label: 'Thunderstorm', labelHi: 'आंधी-तूफान', severity: 'High' };
  if (code >= 80) return { label: 'Heavy Rain Showers', labelHi: 'भारी वर्षा', severity: 'High' };
  if (code >= 61) return { label: 'Rain', labelHi: 'बारिश', severity: 'Medium' };
  if (code >= 51) return { label: 'Drizzle', labelHi: 'बूंदाबांदी', severity: 'Low' };
  if (code >= 45) return { label: 'Fog', labelHi: 'कोहरा', severity: 'Low' };
  return { label: 'Clear / Partly Cloudy', labelHi: 'साफ़ मौसम', severity: 'Low' };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.issues }, { status: 400 });
  }

  const { crop_name, sowing_date, lat, lon } = parsed.data;
  const cropKey = crop_name.toLowerCase().trim();
  const duration = CROP_DURATION_DAYS[cropKey] ?? { min: 100, max: 130 };

  // Compute harvest window
  const sowing = new Date(sowing_date);
  const windowStart = new Date(sowing);
  windowStart.setDate(sowing.getDate() + duration.min);
  const windowEnd = new Date(sowing);
  windowEnd.setDate(sowing.getDate() + duration.max);
  const today = new Date();
  const daysFromToday = Math.ceil((windowStart.getTime() - today.getTime()) / 86400000);

  // Fetch 7-day weather forecast from Open-Meteo
  let weatherForecast: { date: string; maxTemp: number; precip: number; code: number }[] = [];
  let fetchError: string | null = null;
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=7`;
    const res = await fetch(weatherUrl, { next: { revalidate: 3600 } } as any);
    if (res.ok) {
      const data = await res.json();
      weatherForecast = (data.daily.time as string[]).map((t: string, i: number) => ({
        date: t,
        maxTemp: data.daily.temperature_2m_max[i],
        precip: data.daily.precipitation_sum[i],
        code: data.daily.weathercode[i],
      }));
    }
  } catch (e) {
    fetchError = String(e);
  }

  // Compute threats based on forecast during harvest window
  const harvestWindowDays = weatherForecast.filter((d) => {
    const dt = new Date(d.date);
    return dt >= windowStart && dt <= windowEnd;
  });
  const allForecastDays = weatherForecast.length > 0 ? weatherForecast : [];

  // Risk factors
  const heavyRainDays = allForecastDays.filter((d) => d.code >= 61 || d.precip > 10);
  const extremeHeatDays = allForecastDays.filter((d) => d.maxTemp > 40);
  const stormDays = allForecastDays.filter((d) => d.code >= 95);

  const climateThreats: { threat: string; threatHi: string; severity: 'Low' | 'Medium' | 'High'; mitigation: string; mitigationHi: string }[] = [];

  if (stormDays.length > 0) {
    climateThreats.push({
      threat: `Thunderstorm forecast on ${stormDays.map((d) => d.date).join(', ')}`,
      threatHi: `आंधी का पूर्वानुमान: ${stormDays.map((d) => d.date).join(', ')}`,
      severity: 'High',
      mitigation: 'Harvest immediately if crop is mature. Secure cut crop under tarpaulins.',
      mitigationHi: 'यदि फसल पकी हो तो तुरंत काटें। कटी हुई फसल तिरपाल से ढकें।',
    });
  }

  if (heavyRainDays.length > 0) {
    climateThreats.push({
      threat: `Heavy rain expected on ${heavyRainDays.length} day(s)`,
      threatHi: `${heavyRainDays.length} दिन भारी वर्षा की संभावना`,
      severity: heavyRainDays.length >= 3 ? 'High' : 'Medium',
      mitigation: 'Allow 2-3 dry days after rain before harvesting to reduce grain moisture.',
      mitigationHi: 'बारिश के बाद 2-3 दिन सूखने दें, तब कटाई करें।',
    });
  }

  if (extremeHeatDays.length > 0) {
    climateThreats.push({
      threat: `Extreme heat (>40°C) on ${extremeHeatDays.length} day(s)`,
      threatHi: `${extremeHeatDays.length} दिन अत्यधिक गर्मी (>40°C)`,
      severity: 'Medium',
      mitigation: 'Harvest early morning (6–10 AM) to avoid heat stress and grain shattering.',
      mitigationHi: 'सुबह 6–10 बजे कटाई करें — धूप से दाना झड़ने से बचाएं।',
    });
  }

  if (climateThreats.length === 0) {
    climateThreats.push({
      threat: 'No significant climate threats in forecast window',
      threatHi: 'पूर्वानुमान में कोई बड़ा खतरा नहीं',
      severity: 'Low',
      mitigation: 'Conditions are favorable for harvest when crop reaches maturity.',
      mitigationHi: 'फसल के पकने पर कटाई की स्थिति अनुकूल है।',
    });
  }

  // Compute loss risk: higher if harvest window is close and heavy rain forecast
  const precipRisk = Math.min(1, heavyRainDays.length / 4);
  const timingRisk = daysFromToday < 0 ? 0.6 : daysFromToday < 7 ? 0.3 : 0.1;
  const current_loss_risk = Math.min(1, Math.round((precipRisk * 0.6 + timingRisk * 0.4) * 100) / 100);

  const recommended_action = daysFromToday < 0
    ? 'Crop is past optimal harvest window — harvest immediately to minimize losses.'
    : daysFromToday <= 7
    ? `Harvest window opens in ${daysFromToday} day(s). Monitor daily for rain.`
    : `Wait ${daysFromToday} days before harvest. Crop is still maturing.`;

  return NextResponse.json({
    crop: crop_name,
    sowing_date,
    optimal_harvest_window: {
      start: windowStart.toISOString().split('T')[0],
      end: windowEnd.toISOString().split('T')[0],
      days_from_today: daysFromToday,
    },
    current_loss_risk,
    recommended_action,
    recommended_action_hi: daysFromToday < 0
      ? 'फसल की कटाई का उचित समय निकल गया है — तुरंत काटें।'
      : daysFromToday <= 7
      ? `${daysFromToday} दिनों में कटाई का समय आएगा। रोज़ मौसम देखें।`
      : `${daysFromToday} दिन रुकें — फसल अभी पक रही है।`,
    climate_threats: climateThreats,
    weather_forecast: allForecastDays,
    meta: { lat, lon, fetchError, source: 'Open-Meteo' },
  });
}
