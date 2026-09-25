import { NextResponse } from 'next/server';

// In-memory poll counter map for demo simulation
const pollCounts: Record<string, number> = {};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const count = (pollCounts[id] || 0) + 1;
  pollCounts[id] = count;

  // Progressive simulation over poll intervals:
  // Poll 1: Gemini processing
  // Poll 2: Gemini success, Oracle processing
  // Poll 3: Oracle success, Solana minting
  // Poll 4+: All 4 succeeded, escrow released
  return NextResponse.json({
    verificationId: id,
    steps: {
      geminiValidation: {
        status: count >= 2 ? 'success' : 'processing',
        updatedAt: new Date().toISOString(),
      },
      oracleCheck: {
        status: count >= 3 ? 'success' : count >= 2 ? 'processing' : 'pending',
        updatedAt: new Date().toISOString(),
      },
      solanaMint: {
        status: count >= 4 ? 'success' : count >= 3 ? 'processing' : 'pending',
        updatedAt: new Date().toISOString(),
      },
      escrowUnlock: {
        status: count >= 4 ? 'success' : 'pending',
        updatedAt: new Date().toISOString(),
      },
    },
    overallStatus: count >= 4 ? 'success' : 'processing',
  });
}
