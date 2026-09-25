import { NextResponse } from 'next/server';
import { VerificationSubmissionSchema } from '@/contracts';

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

    const verificationId = `verif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      verificationId,
      status: 'pending',
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
