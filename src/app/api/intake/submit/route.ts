import { NextResponse } from 'next/server';
import { IntakeSubmissionSchema } from '@/contracts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = IntakeSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid intake telemetry payload',
          retryable: false,
        },
        { status: 400 },
      );
    }

    const submissionId = `intake-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    return NextResponse.json({
      submissionId,
      status: 'accepted',
      estimatedProcessingSeconds: 3,
      receivedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Intake submission pipeline failure',
        retryable: true,
      },
      { status: 500 },
    );
  }
}
