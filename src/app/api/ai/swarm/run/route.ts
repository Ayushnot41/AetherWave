import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runAetherWeavePipeline } from '@/lib/ai/services/ai.service';

const SwarmRunSchema = z.object({
  actionId: z.string().default('intake-default'),
  imageBase64: z.string().optional().default(''),
  latitude: z.number().default(22.5),
  longitude: z.number().default(77.5),
});

/**
 * AetherWeave Multi-Agent LangGraph Swarm Execution Endpoint
 * Orchestrates 5 specialized backend agents:
 * 1. Gemini Vision Agent (Canopy stress & action recommendation)
 * 2. Climate Agent (Open-Meteo real-time temperature & humidity)
 * 3. Health Risk Agent (NOAA Rothfusz heat index & worker safety)
 * 4. Livelihood Agent (Deterministic loss % & economic impact)
 * 5. Scheme Matching Agent (PM-Kisan, PMFBY & state relief policies)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = SwarmRunSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid swarm parameters', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { actionId, imageBase64, latitude, longitude } = parsed.data;

    // Execute the LangGraph pipeline
    const result = await runAetherWeavePipeline({
      actionId,
      imageBase64,
      latitude,
      longitude,
    });

    return NextResponse.json({
      success: true,
      executionId: `swarm-${Date.now()}`,
      pipeline: 'LangGraph 5-Agent Directed Graph',
      state: result,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('LangGraph Swarm execution error:', error);
    return NextResponse.json(
      {
        error: 'Multi-agent pipeline failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
