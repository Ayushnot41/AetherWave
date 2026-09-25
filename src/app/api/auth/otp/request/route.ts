import { NextResponse } from 'next/server';
import { AuthOtpRequestSchema } from '@/contracts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AuthOtpRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid phone or dialect',
          retryable: false,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      requestId: `otp-req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      expiresInSeconds: 300,
      phone: parsed.data.phone,
    });
  } catch {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Could not process OTP request',
        retryable: true,
      },
      { status: 500 },
    );
  }
}
