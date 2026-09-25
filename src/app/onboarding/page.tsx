'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/zod-resolver';
import { z } from 'zod';
import { Globe, Phone, ArrowRight, Shield } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { useAuthStore } from '@/stores/auth-store';
import { useLocaleStore } from '@/stores/locale-store';
import { useConnectivityStore } from '@/stores/connectivity-store';
import { Button, Input, OfflineState, FadeIn } from '@/components/ui';
import { colors, animation } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import type { DialectCode } from '@/contracts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6;
const OTP_RESEND_COOLDOWN_SECONDS = 30;

/**
 * Dialect options rendered as the primary first-action grid.
 * Sourced from the locale store's availableDialects but kept here
 * as a static map so the component doesn't depend on store hydration
 * for the initial render.
 */
const DIALECT_OPTIONS: ReadonlyArray<{
  code: DialectCode;
  nativeName: string;
  name: string;
}> = [
  { code: 'hi-IN', nativeName: 'हिन्दी', name: 'Hindi' },
  { code: 'en-IN', nativeName: 'English', name: 'English' },
  { code: 'mr-IN', nativeName: 'मराठी', name: 'Marathi' },
  { code: 'ta-IN', nativeName: 'தமிழ்', name: 'Tamil' },
  { code: 'te-IN', nativeName: 'తెలుగు', name: 'Telugu' },
  { code: 'kn-IN', nativeName: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'bn-IN', nativeName: 'বাংলা', name: 'Bengali' },
] as const;

// ---------------------------------------------------------------------------
// Zod schemas for form validation
// ---------------------------------------------------------------------------

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .transform((val) => {
      const clean = val.trim().replace(/[\s-]/g, '');
      if (/^\d{10}$/.test(clean)) return `+91${clean}`;
      if (/^91\d{10}$/.test(clean)) return `+${clean}`;
      return clean.startsWith('+') ? clean : `+${clean}`;
    })
    .pipe(
      z.string().regex(
        /^\+[1-9]\d{6,14}$/,
        'Enter a valid 10-digit mobile number (e.g. 9876543210)',
      ),
    ),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

const otpSchema = z.object({
  otp: z
    .string()
    .length(OTP_LENGTH, `OTP must be exactly ${OTP_LENGTH} digits`)
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

type OtpFormData = z.infer<typeof otpSchema>;

// ---------------------------------------------------------------------------
// Screen state machine
// ---------------------------------------------------------------------------

type OnboardingStep = 'initial' | 'otp-sent' | 'verifying' | 'error-offline';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // ── Stores ──────────────────────────────────────────────────────────
  const { isAuthenticated, isLoading, error, requestOtp, verifyOtp, demoLogin, clearError } =
    useAuthStore();
  const { dialectCode, setDialect } = useLocaleStore();
  const isOnline = useConnectivityStore((s: { isOnline: boolean }) => s.isOnline);

  // ── Local state ─────────────────────────────────────────────────────
  const [step, setStep] = useState<OnboardingStep>('initial');
  const [phoneValue, setPhoneValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── OTP digit refs for individual input boxes ───────────────────────
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ''),
  );

  // ── Phone form ──────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  // ── OTP form ────────────────────────────────────────────────────────
  const {
    setValue: setOtpValue,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // ── Redirect when authenticated ────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // ── Offline detection ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline && step !== 'error-offline') {
      setStep('error-offline');
    }
    if (isOnline && step === 'error-offline') {
      setStep('initial');
    }
  }, [isOnline, step]);

  // ── Countdown timer ────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(OTP_RESEND_COOLDOWN_SECONDS);

    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────

  const handleDialectSelect = useCallback(
    (code: DialectCode) => {
      setDialect(code);
      clearError();
    },
    [setDialect, clearError],
  );

  const handlePhoneSubmit = useCallback(
    async (data: PhoneFormData) => {
      if (!isOnline) {
        setStep('error-offline');
        return;
      }

      setPhoneValue(data.phone);
      await requestOtp(data.phone, dialectCode);

      /* If requestOtp set an error, stay on initial */
      const storeError = useAuthStore.getState().error;
      if (!storeError) {
        setStep('otp-sent');
        startCountdown();
        setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
      }
    },
    [isOnline, requestOtp, dialectCode, startCountdown],
  );

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      /* Allow only single digit */
      const digit = value.replace(/\D/g, '').slice(-1);

      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = digit;

        /* Sync combined value to react-hook-form */
        const combined = next.join('');
        setOtpValue('otp', combined, { shouldValidate: combined.length === OTP_LENGTH });

        return next;
      });

      /* Auto-focus next input */
      if (digit && index < OTP_LENGTH - 1) {
        otpInputRefs.current[index + 1]?.focus();
      }
    },
    [setOtpValue],
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits],
  );

  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (!pasted) return;

      const digits = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? '');
      setOtpDigits(digits);
      setOtpValue('otp', digits.join(''), { shouldValidate: true });

      /* Focus the last filled or first empty */
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      otpInputRefs.current[focusIndex]?.focus();
    },
    [setOtpValue],
  );

  const handleVerifyOtp = useCallback(
    async (data: OtpFormData) => {
      if (!isOnline) {
        setStep('error-offline');
        return;
      }

      setStep('verifying');
      await verifyOtp(data.otp);

      /* If verification failed, return to otp-sent */
      const storeState = useAuthStore.getState();
      if (!storeState.isAuthenticated) {
        setStep('otp-sent');
      }
    },
    [isOnline, verifyOtp],
  );

  const handleResendOtp = useCallback(async () => {
    if (!isOnline || countdown > 0) return;

    clearError();
    await requestOtp(phoneValue, dialectCode);

    const storeError = useAuthStore.getState().error;
    if (!storeError) {
      startCountdown();
      setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
    }
  }, [isOnline, countdown, clearError, requestOtp, phoneValue, dialectCode, startCountdown]);

  const handleBackToPhone = useCallback(() => {
    clearError();
    setStep('initial');
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(0);
  }, [clearError]);

  // ── Transition variants ─────────────────────────────────────────────
  const stepVariants = {
    initial: shouldReduceMotion
      ? {}
      : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: shouldReduceMotion
      ? {}
      : { opacity: 0, y: -12 },
  };

  const stepTransition = {
    duration: animation.duration.normal,
    ease: animation.easing.easeOut as unknown as number[],
  };

  // ── Offline state ──────────────────────────────────────────────────
  if (step === 'error-offline') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <OfflineState message="You need an internet connection to sign in. Please reconnect and try again." />
      </main>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 pb-8 pt-12 sm:pt-16">
      {/* ─── Logo / Wordmark ────────────────────────────────────────── */}
      <FadeIn className="mb-8 flex flex-col items-center gap-2">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.green[500] }}
          aria-hidden="true"
        >
          <Globe className="h-8 w-8 text-sand-50" />
        </div>
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: colors.text.primary }}
        >
          AetherWeave
        </h1>
        <p
          className="text-sm"
          style={{ color: colors.text.muted }}
        >
          Climate resilience for everyone
        </p>
      </FadeIn>

      {/* ─── Error banner (from auth store) ─────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 w-full max-w-sm overflow-hidden rounded-[var(--radius-md)] border-2 px-4 py-3"
            style={{
              borderColor: colors.error,
              backgroundColor: '#FEF2F2',
            }}
          >
            <p className="text-sm font-bold" style={{ color: colors.error }}>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Step content ───────────────────────────────────────────── */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 'initial' && (
            <motion.div
              key="initial"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
            >
              {/* Dialect picker */}
              <fieldset className="mb-8">
                <legend className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: colors.text.primary }}>
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  Choose your language
                </legend>
                <div
                  className="grid grid-cols-3 gap-3 sm:grid-cols-4"
                  role="radiogroup"
                  aria-label="Language selection"
                >
                  {DIALECT_OPTIONS.map((dialect) => {
                    const isSelected = dialectCode === dialect.code;
                    return (
                      <button
                        key={dialect.code}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${dialect.name} — ${dialect.nativeName}`}
                        onClick={() => handleDialectSelect(dialect.code)}
                        className={cn(
                          'flex min-h-[64px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border-2 p-3',
                          'transition-colors duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-green-300 focus-visible:ring-offset-2',
                          'cursor-pointer',
                          isSelected
                            ? 'border-earth-green-500 bg-earth-green-500/10'
                            : 'border-border-default bg-surface hover:bg-sand-100',
                        )}
                      >
                        <span
                          className="text-lg font-bold leading-tight"
                          style={{
                            color: isSelected
                              ? colors.green[500]
                              : colors.text.primary,
                          }}
                        >
                          {dialect.nativeName}
                        </span>
                        <span
                          className="text-xs"
                          style={{
                            color: isSelected
                              ? colors.green[600]
                              : colors.text.muted,
                          }}
                        >
                          {dialect.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Phone input */}
              <form
                onSubmit={handleSubmit(handlePhoneSubmit)}
                noValidate
                className="flex flex-col gap-4"
              >
                <Input
                  label="Phone number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+919876543210"
                  error={phoneErrors.phone?.message}
                  helperText="We'll send a one-time verification code"
                  {...register('phone')}
                />
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="gap-2"
                  style={{ backgroundColor: colors.amber[500] }}
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Send verification code
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>

                {/* Instant 1-Click Demo Bypass */}
                <button
                  type="button"
                  onClick={() => demoLogin(dialectCode)}
                  className="mt-2 w-full py-3 px-4 text-xs font-bold rounded-[var(--radius-md)] border border-authority/40 bg-authority/5 text-authority hover:bg-authority/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚡</span>
                  <span>Instant Demo Access / सीधा डेमो लॉगिन (1-Click)</span>
                </button>
              </form>

              {/* Trust signal */}
              <FadeIn delay={0.4} className="mt-6 flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" style={{ color: colors.green[500] }} aria-hidden="true" />
                <span className="text-xs" style={{ color: colors.text.muted }}>
                  Your data is encrypted and never shared
                </span>
              </FadeIn>
            </motion.div>
          )}

          {(step === 'otp-sent' || step === 'verifying') && (
            <motion.div
              key="otp"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
            >
              <div className="mb-6 text-center">
                <h2
                  className="text-xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Enter verification code
                </h2>
                <p className="mt-1 text-sm" style={{ color: colors.text.muted }}>
                  Sent to{' '}
                  <span className="font-bold" style={{ color: colors.text.secondary }}>
                    {phoneValue}
                  </span>
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-authority/10 border border-authority/30 text-xs font-semibold text-authority">
                  <span>ℹ️ Demo OTP: enter <strong>123456</strong> or any 6 digits</span>
                  <button
                    type="button"
                    onClick={() => {
                      const demoDigits = ['1', '2', '3', '4', '5', '6'];
                      setOtpDigits(demoDigits);
                      setOtpValue('otp', '123456', { shouldValidate: true });
                    }}
                    className="underline hover:text-authority cursor-pointer ml-1 font-bold"
                  >
                    (Autofill / स्वतः भरें)
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleOtpSubmit(handleVerifyOtp)}
                noValidate
                className="flex flex-col items-center gap-6"
              >
                {/* OTP digit inputs */}
                <div
                  className="flex gap-2 sm:gap-3"
                  role="group"
                  aria-label="One-time password"
                >
                  {Array.from({ length: OTP_LENGTH }, (_, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpInputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                      value={otpDigits[i]}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleOtpChange(i, e.target.value)
                      }
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                        handleOtpKeyDown(i, e)
                      }
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      disabled={step === 'verifying'}
                      className={cn(
                        'h-14 w-11 rounded-[var(--radius-md)] border-2 text-center text-xl font-bold sm:h-16 sm:w-14',
                        'transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-earth-green-300 focus:ring-offset-1',
                        'disabled:opacity-50',
                        otpDigits[i]
                          ? 'border-earth-green-500 bg-earth-green-500/5'
                          : 'border-border-default bg-surface',
                      )}
                      style={{ color: colors.text.primary }}
                    />
                  ))}
                </div>

                {/* OTP validation error */}
                {otpErrors.otp?.message && (
                  <p className="text-sm font-bold" style={{ color: colors.error }} role="alert">
                    {otpErrors.otp.message}
                  </p>
                )}

                {/* Verify button */}
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={step === 'verifying' || isLoading}
                  disabled={step === 'verifying' || isLoading}
                  className="gap-2"
                >
                  <Shield className="h-5 w-5" aria-hidden="true" />
                  {step === 'verifying' ? 'Verifying…' : 'Verify code'}
                </Button>

                {/* Resend & back */}
                <div className="flex w-full flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isLoading}
                    className={cn(
                      'min-h-[44px] px-4 py-2 text-sm font-bold rounded-[var(--radius-md)]',
                      'transition-colors duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-green-300 focus-visible:ring-offset-2',
                      countdown > 0 || isLoading
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-sand-100',
                    )}
                    style={{ color: colors.green[500] }}
                    aria-label={
                      countdown > 0
                        ? `Resend code available in ${countdown} seconds`
                        : 'Resend verification code'
                    }
                  >
                    {countdown > 0
                      ? `Resend code in ${countdown}s`
                      : 'Resend code'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className={cn(
                      'min-h-[44px] px-4 py-2 text-sm rounded-[var(--radius-md)]',
                      'transition-colors duration-200 cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-green-300 focus-visible:ring-offset-2',
                      'hover:bg-sand-100',
                    )}
                    style={{ color: colors.text.muted }}
                  >
                    Use a different number
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
