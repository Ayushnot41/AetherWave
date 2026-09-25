import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  month: z.coerce.number().min(1).max(12),
  soil_type: z.enum(['loamy', 'clayey', 'sandy', 'silty']),
});

const CROP_DB = [
  { name: 'Rice', vernacular_name: 'Chawal / चावल', seasons: [6,7,8,9,10], soils: ['clayey', 'loamy'], risk_score: 0.8, water_requirement: 'High', market_demand: 'High' },
  { name: 'Wheat', vernacular_name: 'Gehun / गेहूं', seasons: [11,12,1,2,3], soils: ['loamy', 'clayey'], risk_score: 0.3, water_requirement: 'Medium', market_demand: 'High' },
  { name: 'Cotton', vernacular_name: 'Kapas / कपास', seasons: [5,6,7,8,9,10], soils: ['clayey', 'loamy'], risk_score: 0.6, water_requirement: 'Medium', market_demand: 'High' },
  { name: 'Sugarcane', vernacular_name: 'Ganna / गन्ना', seasons: [1,2,3,4,5,6,7,8,9,10,11,12], soils: ['loamy', 'clayey'], risk_score: 0.4, water_requirement: 'High', market_demand: 'High' },
  { name: 'Maize', vernacular_name: 'Makka / मक्का', seasons: [6,7,8,9], soils: ['loamy', 'sandy'], risk_score: 0.5, water_requirement: 'Medium', market_demand: 'Medium' },
  { name: 'Soybean', vernacular_name: 'Soyabean / सोयाबीन', seasons: [6,7,8,9,10], soils: ['loamy', 'clayey'], risk_score: 0.5, water_requirement: 'Medium', market_demand: 'High' },
  { name: 'Groundnut', vernacular_name: 'Mungfali / मूंगफली', seasons: [6,7,8,9], soils: ['sandy', 'loamy'], risk_score: 0.4, water_requirement: 'Low', market_demand: 'High' },
  { name: 'Mustard', vernacular_name: 'Sarson / सरसों', seasons: [10,11,12,1,2], soils: ['loamy', 'sandy'], risk_score: 0.2, water_requirement: 'Low', market_demand: 'High' },
  { name: 'Chickpea', vernacular_name: 'Chana / चना', seasons: [10,11,12,1,2,3], soils: ['loamy', 'sandy'], risk_score: 0.3, water_requirement: 'Low', market_demand: 'Medium' },
  { name: 'Lentil', vernacular_name: 'Masoor / मसूर', seasons: [10,11,12,1,2], soils: ['loamy', 'sandy'], risk_score: 0.2, water_requirement: 'Low', market_demand: 'Medium' },
  { name: 'Tomato', vernacular_name: 'Tamatar / टमाटर', seasons: [1,2,3,4,5,6,7,8,9,10,11,12], soils: ['loamy', 'sandy'], risk_score: 0.7, water_requirement: 'Medium', market_demand: 'High' },
  { name: 'Onion', vernacular_name: 'Pyaaz / प्याज़', seasons: [1,2,3,4,5,6,7,8,9,10,11,12], soils: ['loamy', 'sandy'], risk_score: 0.6, water_requirement: 'Low', market_demand: 'High' },
  { name: 'Potato', vernacular_name: 'Aloo / आलू', seasons: [10,11,12,1,2], soils: ['loamy', 'sandy'], risk_score: 0.5, water_requirement: 'Medium', market_demand: 'High' },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.issues }, { status: 400 });
  const { month, soil_type } = parsed.data;

  let candidates = CROP_DB.filter(c => c.seasons.includes(month) && c.soils.includes(soil_type));
  if (candidates.length === 0) candidates = CROP_DB.filter(c => c.seasons.includes(month));

  const recommendations = candidates.map(c => {
    const profit_score = Math.min(1, Math.max(0, (c.market_demand === 'High' ? 0.8 : 0.5) - c.risk_score * 0.2 + (month % 3) * 0.05));
    return { ...c, profit_score };
  }).sort((a, b) => b.profit_score - a.profit_score).slice(0, 3);

  return NextResponse.json({ recommendations, meta: parsed.data });
}
