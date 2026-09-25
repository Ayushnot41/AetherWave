import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return NextResponse.json({
    submissionId: id,
    overallRisk: 'elevated',
    nodes: {
      climate: {
        riskLevel: 'critical',
        summary: 'Heat index at 42.1°C with severe soil moisture deficit detected across regional coordinates.',
        confidence: 0.94,
      },
      health: {
        riskLevel: 'elevated',
        summary: 'Acute heat exhaustion danger for daytime agricultural labor without immediate mitigation.',
        confidence: 0.89,
      },
      livelihood: {
        riskLevel: 'critical',
        summary: 'Yield loss risk elevated to 22% due to canopy transpiration without ground mulch cover.',
        confidence: 0.96,
      },
    },
    analyzedAt: new Date().toISOString(),
  });
}
