import { NextResponse } from 'next/server';
import { AuthOtpRequestSchema } from '@/contracts';
import { OtpService } from '@/lib/services/otp-service';

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

    const { requestId, expiresAt, demoOtp, sentViaFast2Sms } = await OtpService.requestOtp(
      parsed.data.phone,
      parsed.data.dialect,
    );

    return NextResponse.json({
      requestId,
      expiresAt,
      retryAfterSeconds: 30,
      phone: parsed.data.phone,
      demoOtp,
      sentViaFast2Sms,
      message: sentViaFast2Sms
        ? `OTP dispatched to ${parsed.data.phone} via Fast2SMS gateway`
        : `Demonstration OTP generated for instant login: ${demoOtp}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Could not process OTP request';
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
