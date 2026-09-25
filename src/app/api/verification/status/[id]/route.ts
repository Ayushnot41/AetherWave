import { NextResponse } from 'next/server';
import { getGeminiAuditEntry } from '@/lib/verification-state';
import type { GeminiPipelineStep } from '@/contracts';

// In-memory poll counter map for demo simulation (untouched for oracleCheck, solanaMint, escrowUnlock)
const pollCounts: Record<string, number> = {};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const count = (pollCounts[id] || 0) + 1;
  pollCounts[id] = count;

  // Real Gemini crop canopy audit status lookup
  const audit = getGeminiAuditEntry(id);

  let geminiValidation: GeminiPipelineStep;
  if (!audit || audit.status === 'processing') {
    geminiValidation = {
      status: 'processing',
    };
  } else if (audit.status === 'success') {
    geminiValidation = {
      status: 'success',
      result: audit.result,
    };
  } else {
    // status === 'failed'
    const failureReason =
      audit.result && !audit.result.isCropImage
        ? 'Submitted photo does not appear to show crop or field content.'
        : audit.failureReason || 'Verification check failed';

    geminiValidation = {
      status: 'failed',
      failureReason,
      retryable: audit.retryable,
    };
  }

  // Progressive simulation over poll intervals (untouched):
  // Poll 1: Gemini processing
  // Poll 2: Gemini success, Oracle processing
  // Poll 3: Oracle success, Solana minting
  // Poll 4+: All 4 succeeded, escrow released
  return NextResponse.json({
    verificationId: id,
    steps: {
      geminiValidation,
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
    updatedAt: new Date().toISOString(),
  });
}
