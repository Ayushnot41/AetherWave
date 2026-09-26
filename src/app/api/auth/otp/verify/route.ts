import { NextResponse } from 'next/server';
import { AuthOtpVerifySchema } from '@/contracts';
import { OtpService } from '@/lib/services/otp-service';

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

    const { requestId, otp } = parsed.data;
    const verification = OtpService.verifyOtp(requestId, otp);

    if (!verification.valid) {
      return NextResponse.json(
        {
          code: 'AUTH_FAILED',
          message: verification.message || 'Invalid or expired OTP',
          retryable: true,
        },
        { status: 401 },
      );
    }

    const accessToken = `aether-jwt-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();
    const phone = verification.phone ? `+91${verification.phone}` : '+919876543210';

    return NextResponse.json({
      accessToken,
      expiresAt,
      token: accessToken,
      user: {
        id: `usr-${phone.replace(/\D/g, '')}`,
        phone,
        dialectCode: 'hi-IN',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Could not verify OTP token';
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message,
        retryable: true,
      },
      { status: 500 },
    );
  }
}
