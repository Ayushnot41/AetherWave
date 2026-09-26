import { NextResponse } from 'next/server';
import { AuthOtpRequestSchema } from '@/contracts';
import { OtpService } from '@/lib/services/otp-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = String(body.phone || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a valid 10-digit Indian mobile number',
          retryable: false,
        },
        { status: 400 },
      );
    }

    const dialect = body.dialect || 'hi-IN';
    const e164Phone = `+91${cleanPhone}`;

    const { requestId, expiresAt, demoOtp, sentViaFast2Sms } = await OtpService.requestOtp(
      e164Phone,
      dialect,
    );

    return NextResponse.json({
      requestId,
      expiresAt,
      retryAfterSeconds: 30,
      phone: e164Phone,
      demoOtp,
      sentViaFast2Sms,
      message: sentViaFast2Sms
        ? `OTP dispatched to ${e164Phone} via Fast2SMS gateway`
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
