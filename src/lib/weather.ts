/**
 * Open-Meteo weather integration — Phase 3
 *
 * Deterministic heat index calculation (NOAA Rothfusz regression).
 * No LLM calls in this module.
 */

import { env } from './env';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 10_000;

export interface WeatherData {
  temperature: number;       // °C current
  feelsLike: number;         // °C apparent
  humidity: number;          // %
  precipitationMm: number;   // mm last hour
  windSpeedKmh: number;
  heatIndex: number;         // °C calculated
  condition: string;
  isLive: boolean;
}

/** DEMO_MODE fixture for Indian heatwave conditions */
const DEMO_WEATHER: WeatherData = {
  temperature: 42.1,
  feelsLike: 45.3,
  humidity: 28,
  precipitationMm: 0,
  windSpeedKmh: 12,
  heatIndex: 48.7,
  condition: 'Extreme Heatwave (Loo)',
  isLive: false,
};

/**
 * NOAA Rothfusz Heat Index equation.
 * Returns heat index in °C.
 * Applicable when T ≥ 27°C and RH ≥ 40%.
 */
export function calculateHeatIndex(tempC: number, relHumidity: number): number {
  const T = tempC * 9 / 5 + 32; // Convert to °F for the Rothfusz formula
  const RH = relHumidity;

  const HI_F =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  // Adjustments for low humidity / high humidity edge cases
  let adjusted = HI_F;
  if (RH < 13 && T >= 80 && T <= 112) {
    adjusted -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (RH > 85 && T >= 80 && T <= 87) {
    adjusted += ((RH - 85) / 10) * ((87 - T) / 5);
  }

  return ((adjusted - 32) * 5) / 9; // Back to °C
}

function weatherCodeToCondition(wmoCode: number): string {
  if (wmoCode === 0) return 'Clear Sky';
  if (wmoCode <= 3) return 'Partly Cloudy';
  if (wmoCode <= 49) return 'Foggy';
  if (wmoCode <= 67) return 'Rain';
  if (wmoCode <= 77) return 'Snow';
  if (wmoCode <= 82) return 'Rain Showers';
  if (wmoCode <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  if (env.DEMO_MODE) {
    console.log('[DEMO_MODE] fetchWeather — returning fixture');
    return DEMO_WEATHER;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'precipitation',
        'wind_speed_10m',
        'weather_code',
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'Asia/Kolkata',
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`, {
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);

    const data = await res.json() as {
      current?: {
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        precipitation?: number;
        wind_speed_10m?: number;
        weather_code?: number;
      };
    };

    const c = data.current ?? {};
    const temp = c.temperature_2m ?? 35;
    const humidity = c.relative_humidity_2m ?? 40;

    return {
      temperature: temp,
      feelsLike: c.apparent_temperature ?? temp,
      humidity,
      precipitationMm: c.precipitation ?? 0,
      windSpeedKmh: c.wind_speed_10m ?? 0,
      heatIndex: calculateHeatIndex(temp, humidity),
      condition: weatherCodeToCondition(c.weather_code ?? 0),
      isLive: true,
    };
  } catch (err) {
    console.error('[Weather] fetchWeather failed — DEMO_MODE fallback:', err);
    return { ...DEMO_WEATHER, isLive: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 30-day disaster probability matrix — deterministic formula over weather data.
 * Not an LLM call.
 */
export function calculateDisasterProbabilities(weather: WeatherData) {
  const { temperature, humidity, precipitationMm, windSpeedKmh, heatIndex } = weather;

  // Flood: high precipitation + high humidity
  const floodRisk = Math.min(100, Math.round(
    (precipitationMm / 50) * 60 + (humidity / 100) * 40
  ));

  // Heatwave (Loo): high heat index
  const heatwaveRisk = Math.min(100, Math.round(
    heatIndex > 54 ? 95 :
    heatIndex > 48 ? 85 :
    heatIndex > 41 ? 65 :
    heatIndex > 35 ? 40 : 20
  ));

  // Cyclone: high wind + low pressure proxy (from wind speed)
  const cycloneRisk = Math.min(100, Math.round((windSpeedKmh / 200) * 100));

  // Hailstorm: thunderstorm conditions
  const hailRisk = Math.min(100, Math.round(
    humidity > 80 && temperature < 25 ? 45 : 
    humidity > 70 ? 25 : 10
  ));

  return {
    flood: floodRisk,
    heatwave: heatwaveRisk,
    cyclone: cycloneRisk,
    hailstorm: hailRisk,
  };
}
