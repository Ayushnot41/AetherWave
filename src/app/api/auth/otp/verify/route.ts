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

    const accessToken = `aether-jwt-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();

    return NextResponse.json({
      accessToken,
      expiresAt,
      token: accessToken,
      user: {
        id: `usr-${Math.random().toString(36).substring(2, 8)}`,
        phone: '+919876543210',
        dialectCode: 'hi-IN',
      },
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
