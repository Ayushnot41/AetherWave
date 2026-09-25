import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  crop_name: z.string().min(1).max(50),
  quantity_kg: z.coerce.number().positive().max(100000),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

// Crop-specific safe storage parameters (ideal conditions)
const CROP_STORAGE_PARAMS: Record<string, {
  ideal_moisture_pct: number;
  ideal_temp_max: number;
  ideal_humidity_max: number;
  base_safe_days: number;
  value_per_kg_inr: number;
  pest_risk: 'Low' | 'Medium' | 'High';
  storage_methods: string[];
  storage_methods_hi: string[];
}> = {
  wheat: {
    ideal_moisture_pct: 12, ideal_temp_max: 30, ideal_humidity_max: 65,
    base_safe_days: 180, value_per_kg_inr: 23.75, pest_risk: 'Medium',
    storage_methods: ['Hermetic bags (Pro-Bag/ZeroFly)', 'PUSA bins', 'Grain silos with desiccants', 'Jute bags with neem leaves'],
    storage_methods_hi: ['हर्मेटिक बैग (प्रो-बैग/जीरोफ्लाई)', 'पूसा बिन', 'डेसिकेंट के साथ अनाज साइलो', 'नीम की पत्तियों के साथ जूट बैग'],
  },
  rice: {
    ideal_moisture_pct: 14, ideal_temp_max: 28, ideal_humidity_max: 70,
    base_safe_days: 90, value_per_kg_inr: 23.00, pest_risk: 'High',
    storage_methods: ['Hermetic bags', 'CAP storage (Cover and Plinth)', 'Metal bins with moisture barriers', 'Vacuum-sealed bags for small quantities'],
    storage_methods_hi: ['हर्मेटिक बैग', 'CAP स्टोरेज', 'नमी अवरोधक के साथ धातु बिन', 'छोटी मात्रा के लिए वैक्यूम बैग'],
  },
  cotton: {
    ideal_moisture_pct: 8, ideal_temp_max: 35, ideal_humidity_max: 55,
    base_safe_days: 240, value_per_kg_inr: 71.21, pest_risk: 'Low',
    storage_methods: ['Dry warehouse with ventilation', 'Compress into bales with hessian covers', 'Keep away from moisture sources'],
    storage_methods_hi: ['हवादार सूखे गोदाम', 'हेसियन कवर के साथ गांठें बनाएं', 'नमी के स्रोतों से दूर रखें'],
  },
  soybean: {
    ideal_moisture_pct: 12, ideal_temp_max: 28, ideal_humidity_max: 60,
    base_safe_days: 120, value_per_kg_inr: 48.92, pest_risk: 'Medium',
    storage_methods: ['Airtight hermetic bags', 'Cool dry warehouse', 'Regular turning to prevent hotspots', 'Silica gel sachets'],
    storage_methods_hi: ['वायुरोधी हर्मेटिक बैग', 'ठंडा सूखा गोदाम', 'गर्म जगह बचाने के लिए नियमित पलटाई', 'सिलिका जेल सैशे'],
  },
  groundnut: {
    ideal_moisture_pct: 8, ideal_temp_max: 25, ideal_humidity_max: 55,
    base_safe_days: 90, value_per_kg_inr: 67.83, pest_risk: 'High',
    storage_methods: ['Shell before storage', 'Hermetic bags are mandatory (aflatoxin risk)', 'Cool dry storage below 25°C', 'Never store with high-moisture grains'],
    storage_methods_hi: ['भंडारण से पहले छिलका हटाएं', 'हर्मेटिक बैग अनिवार्य (एफ्लाटॉक्सिन खतरा)', '25°C से कम ठंडी जगह', 'अधिक नमी वाले अनाज के साथ न रखें'],
  },
  onion: {
    ideal_moisture_pct: 0, ideal_temp_max: 30, ideal_humidity_max: 65,
    base_safe_days: 60, value_per_kg_inr: 28.00, pest_risk: 'High',
    storage_methods: ['Well-ventilated storage (kavali/pallang method)', 'Shade house with wire mesh floors', 'Never store in closed bags', 'Curing at 35-40°C before storage'],
    storage_methods_hi: ['अच्छी हवादार जगह (कावली/पल्लंग विधि)', 'तार जाली फर्श के साथ शेड हाउस', 'कभी बंद बैग में नहीं', 'भंडारण से पहले 35-40°C पर कुरिंग'],
  },
  default: {
    ideal_moisture_pct: 12, ideal_temp_max: 30, ideal_humidity_max: 65,
    base_safe_days: 90, value_per_kg_inr: 25.00, pest_risk: 'Medium',
    storage_methods: ['Keep dry and cool', 'Use airtight containers or hermetic bags', 'Check weekly for pests', 'Elevate on wooden pallets'],
    storage_methods_hi: ['सूखा और ठंडा रखें', 'वायुरोधी कंटेनर या हर्मेटिक बैग', 'हर हफ्ते कीटों की जांच', 'लकड़ी के पैलेट पर ऊंचा रखें'],
  },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.issues }, { status: 400 });
  }

  const { crop_name, quantity_kg, lat, lon } = parsed.data;
  const cropKey = crop_name.toLowerCase().trim();
  const cropParams = CROP_STORAGE_PARAMS[cropKey] ?? CROP_STORAGE_PARAMS.default;

  // Fetch 7-day forecast for humidity and temperature
  let forecast: { humidity: number[]; maxTemp: number[]; dates: string[] } = { humidity: [], maxTemp: [], dates: [] };
  let fetchError: string | null = null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&hourly=relativehumidity_2m&timezone=Asia/Kolkata&forecast_days=7`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      // Average hourly humidity per day
      const hourlyHumidity: number[] = data.hourly.relativehumidity_2m ?? [];
      const avgDailyHumidity = Array.from({ length: 7 }, (_, i) => {
        const slice = hourlyHumidity.slice(i * 24, (i + 1) * 24);
        return slice.length > 0 ? Math.round(slice.reduce((a: number, b: number) => a + b, 0) / slice.length) : 60;
      });
      forecast = {
        humidity: avgDailyHumidity,
        maxTemp: data.daily.temperature_2m_max ?? [],
        dates: data.daily.time ?? [],
      };
    }
  } catch (e) {
    fetchError = String(e);
  }

  const avgHumidity = forecast.humidity.length > 0
    ? forecast.humidity.reduce((a, b) => a + b, 0) / forecast.humidity.length
    : 60;
  const avgMaxTemp = forecast.maxTemp.length > 0
    ? forecast.maxTemp.reduce((a, b) => a + b, 0) / forecast.maxTemp.length
    : 30;

  // Compute safe storage days based on actual humidity and temperature
  const humidityPenalty = avgHumidity > cropParams.ideal_humidity_max
    ? Math.floor((avgHumidity - cropParams.ideal_humidity_max) / 5) * 7
    : 0;
  const tempPenalty = avgMaxTemp > cropParams.ideal_temp_max
    ? Math.floor((avgMaxTemp - cropParams.ideal_temp_max) / 3) * 5
    : 0;
  const storage_duration_safe_days = Math.max(7, cropParams.base_safe_days - humidityPenalty - tempPenalty);

  // Threat assessment
  const threats: { type: string; typeHi: string; severity: 'Low' | 'Medium' | 'High'; detail: string; detailHi: string }[] = [];

  if (avgHumidity > cropParams.ideal_humidity_max) {
    const level: 'Low' | 'Medium' | 'High' = avgHumidity > 80 ? 'High' : avgHumidity > 70 ? 'Medium' : 'Low';
    threats.push({
      type: 'High Humidity',
      typeHi: 'उच्च आर्द्रता',
      severity: level,
      detail: `Average humidity ${avgHumidity.toFixed(0)}% exceeds safe limit of ${cropParams.ideal_humidity_max}%. Fungal/mould risk is ${level.toLowerCase()}.`,
      detailHi: `औसत आर्द्रता ${avgHumidity.toFixed(0)}% — सुरक्षित सीमा ${cropParams.ideal_humidity_max}% से अधिक। फफूंद का खतरा ${level === 'High' ? 'अधिक' : 'मध्यम'} है।`,
    });
  }

  if (avgMaxTemp > cropParams.ideal_temp_max) {
    threats.push({
      type: 'High Temperature',
      typeHi: 'अत्यधिक तापमान',
      severity: avgMaxTemp > 38 ? 'High' : 'Medium',
      detail: `Average daily max ${avgMaxTemp.toFixed(1)}°C exceeds safe limit ${cropParams.ideal_temp_max}°C. Accelerates respiration and pest development.`,
      detailHi: `औसत अधिकतम तापमान ${avgMaxTemp.toFixed(1)}°C — सुरक्षित सीमा ${cropParams.ideal_temp_max}°C से अधिक। कीट और ऑक्सीकरण तेज होता है।`,
    });
  }

  threats.push({
    type: 'Pest Risk',
    typeHi: 'कीट का खतरा',
    severity: cropParams.pest_risk,
    detail: `${crop_name} has ${cropParams.pest_risk.toLowerCase()} baseline pest risk in home storage. Check weekly for weevils and rodent entry.`,
    detailHi: `${crop_name} का घरेलू भंडारण में कीट खतरा ${cropParams.pest_risk === 'High' ? 'अधिक' : cropParams.pest_risk === 'Medium' ? 'मध्यम' : 'कम'} है। हर हफ्ते घुन और चूहे की जांच करें।`,
  });

  // Financial risk
  const loss_pct_if_unprotected = threats.some((t) => t.severity === 'High') ? 0.25 : threats.some((t) => t.severity === 'Medium') ? 0.12 : 0.05;
  const estimated_value_at_risk_inr = Math.round(quantity_kg * cropParams.value_per_kg_inr * loss_pct_if_unprotected);

  return NextResponse.json({
    crop: crop_name,
    quantity_kg,
    storage_duration_safe_days,
    threats,
    storage_methods: cropParams.storage_methods,
    storage_methods_hi: cropParams.storage_methods_hi,
    financial: {
      estimated_value_inr: Math.round(quantity_kg * cropParams.value_per_kg_inr),
      estimated_value_at_risk_inr,
      loss_pct_if_unprotected: Math.round(loss_pct_if_unprotected * 100),
    },
    weather_context: {
      avg_humidity: Math.round(avgHumidity),
      avg_max_temp: Math.round(avgMaxTemp * 10) / 10,
      forecast_dates: forecast.dates,
      fetchError,
      source: 'Open-Meteo',
    },
  });
}
