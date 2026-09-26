/**
 * GET /api/advisory/crop?lat=&lon=&month=&soil_type=
 * Powers the Crop Profitability Advisor feature.
 * 
 * GET /api/advisory/mandi-prices?crop_name=&state=
 * Powers the Live Mandi Price Comparison feature.
 * 
 * These are thin wrappers that normalize the existing crop/market routes
 * to match the api_contract_reconciliation endpoint naming.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

const CropQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  month: z.coerce.number().min(1).max(12).optional(),
  soil_type: z.enum(['loamy', 'clayey', 'sandy', 'silty']).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = CropQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'lat, lon required', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lat, lon, month, soil_type } = parsed.data;
  const currentMonth = month ?? new Date().getMonth() + 1;
  const soilType = soil_type ?? 'loamy';

  // Delegate to /api/crops/recommend
  const internalUrl = new URL(`${url.origin}/api/crops/recommend`);
  internalUrl.searchParams.set('lat', lat.toString());
  internalUrl.searchParams.set('lon', lon.toString());
  internalUrl.searchParams.set('month', currentMonth.toString());
  internalUrl.searchParams.set('soil_type', soilType);

  try {
    const res = await fetch(internalUrl.toString(), { next: { revalidate: 3600 } } as any);
    if (!res.ok) throw new Error(`Internal route error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({
      ...data,
      meta: { ...(data.meta || {}), source: 'AetherWave Crop Profitability Engine' },
    });
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Crop advisor temporarily unavailable', retryable: true },
      { status: 503 },
    );
  }
}
