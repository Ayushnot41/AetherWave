/**
 * GET /api/advisory/mandi-prices?crop_name=&state=
 * 
 * Thin wrapper to /api/market/prices with advisory context.
 * Powers the Live Mandi Price Comparison feature.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  crop_name: z.string().min(1).max(50),
  state: z.string().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const parsed = QuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'crop_name required', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { crop_name, state } = parsed.data;

  const internalUrl = new URL(`${url.origin}/api/market/prices`);
  internalUrl.searchParams.set('crop_name', crop_name);
  if (state) internalUrl.searchParams.set('state', state);

  try {
    const res = await fetch(internalUrl.toString(), { next: { revalidate: 900 } } as any); // 15min cache
    if (!res.ok) throw new Error(`Internal route error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({
      ...data,
      meta: { ...(data.meta || {}), source: 'Agmarknet/e-NAM commodity price feed (DEMO_MODE representative data)' },
    });
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Mandi price service temporarily unavailable', retryable: true },
      { status: 503 },
    );
  }
}
