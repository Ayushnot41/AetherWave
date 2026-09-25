import { NextResponse } from 'next/server';
import { VerificationSubmissionSchema } from '@/contracts';
import {
  auditCropImage,
  GeminiAuditParseError,
  GeminiAuditRequestError,
} from '@/lib/gemini-client';
import { setGeminiAuditEntry } from '@/lib/verification-state';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VerificationSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid proof payload',
          retryable: false,
        },
        { status: 400 },
      );
    }

    const { proofImageBase64 } = parsed.data;
    const verificationId = `verif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Immediately set status to 'processing' before returning response
    setGeminiAuditEntry(verificationId, { status: 'processing' });

    // Call auditCropImage asynchronously without awaiting in the response path
    auditCropImage(proofImageBase64)
      .then((result) => {
        if (!result.isCropImage) {
          setGeminiAuditEntry(verificationId, {
            status: 'failed',
            result,
            failureReason: 'Submitted photo does not appear to show crop or field content.',
            retryable: false,
          });
        } else {
          setGeminiAuditEntry(verificationId, {
            status: 'success',
            result,
          });
        }
      })
      .catch((err: unknown) => {
        console.error(`Gemini crop audit failed for ${verificationId}:`, err);
        if (err instanceof GeminiAuditParseError) {
          setGeminiAuditEntry(verificationId, {
            status: 'failed',
            failureReason: err.message,
            retryable: false,
          });
        } else if (err instanceof GeminiAuditRequestError) {
          setGeminiAuditEntry(verificationId, {
            status: 'failed',
            failureReason: err.message,
            retryable: err.retryable,
          });
        } else {
          setGeminiAuditEntry(verificationId, {
            status: 'failed',
            failureReason: err instanceof Error ? err.message : 'Crop canopy audit failed',
            retryable: false,
          });
        }
      });

    return NextResponse.json({
      verificationId,
      status: 'queued',
      submittedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Verification submission failed',
        retryable: true,
      },
      { status: 500 },
    );
  }
}
