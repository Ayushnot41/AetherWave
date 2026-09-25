import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return NextResponse.json({
    actionId: `act-${id}`,
    title: 'Biomass Root-Zone Ground Mulching',
    description: 'Apply a 3-inch layer of organic residue to shield root systems from extreme heat and retain ground moisture.',
    audioUrl: '/audio/mulching_directive_hi.mp3',
    imageUrl: null,
    eligibleAmount: 5.0,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  });
}
