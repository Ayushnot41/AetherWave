import { NextResponse } from 'next/server';
import { AuthOtpVerifySchema } from '@/contracts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AuthOtpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid OTP',
          retryable: false,
        },
        { status: 400 },
      );
    }

    // For any valid 6-digit OTP in demo / sandbox
    return NextResponse.json({
      token: `aether-jwt-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      user: {
        id: `usr-${Math.random().toString(36).substring(2, 8)}`,
        phone: '+919876543210',
        dialectCode: 'hi-IN',
      },
      expiresInSeconds: 86400,
    });
  } catch {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Could not verify OTP token',
        retryable: true,
      },
      { status: 500 },
    );
  }
}
