'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Button, Card, ProgressTracker, FadeIn, type Step } from '@/components/ui';
import { useVerificationStore } from '@/stores/verification-store';
import { cn } from '@/lib/utils';
import type { PipelineStepStatus } from '@/contracts';

export default function VerificationStatusPage() {
  const router = useRouter();
  const { status, verificationId, stopPolling, lastSubmission, retrySubmission } =
    useVerificationStore();

  const [hasNavigated, setHasNavigated] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geminiStep = status?.steps.geminiValidation;

  // Map backend pipeline stages to ProgressTracker steps
  const steps: Step[] = [
    {
      id: 'gemini',
      label:
        geminiStep?.status === 'success' && geminiStep.result
          ? `Gemini Audit: ${geminiStep.result.immediateRiskFactor}`
          : 'Gemini Multimodal Crop Canopy Audit',
      status: (geminiStep?.status as PipelineStepStatus) || 'processing',
      failureReason: geminiStep?.failureReason,
    },
    {
      id: 'oracle',
      label: 'Deterministic Policy & GPS Boundary Guardrail',
      status: (status?.steps.oracleCheck.status as PipelineStepStatus) || 'pending',
      failureReason: status?.steps.oracleCheck.failureReason,
    },
    {
      id: 'mint',
      label: 'Solana ZK-Compressed Impact Proof Mint',
      status: (status?.steps.solanaMint.status as PipelineStepStatus) || 'pending',
      failureReason: status?.steps.solanaMint.failureReason,
    },
    {
      id: 'escrow',
      label: 'Micro-Grant Escrow Authorization & Disbursal',
      status: (status?.steps.escrowUnlock.status as PipelineStepStatus) || 'pending',
      failureReason: status?.steps.escrowUnlock.failureReason,
    },
  ];

  const isComplete =
    status?.steps.geminiValidation.status === 'success' &&
    status?.steps.oracleCheck.status === 'success' &&
    status?.steps.solanaMint.status === 'success' &&
    status?.steps.escrowUnlock.status === 'success';

  const isFailed =
    status?.steps.geminiValidation.status === 'failed' ||
    status?.steps.oracleCheck.status === 'failed' ||
    status?.steps.solanaMint.status === 'failed' ||
    status?.steps.escrowUnlock.status === 'failed';

  const failedStep = steps.find((s) => s.status === 'failed');
  const isRetryable = Boolean(geminiStep?.status === 'failed' && geminiStep.retryable);
  const hasCapturedState = Boolean(lastSubmission?.proofImageBase64);

  const handleRetry = async () => {
    if (lastSubmission) {
      setIsRetrying(true);
      await retrySubmission();
      setIsRetrying(false);
    }
  };

  // Auto-advance to Payout Success when all 4 stages pass
  useEffect(() => {
    if (isComplete && !hasNavigated) {
      setHasNavigated(true);
      stopPolling();
      timeoutRef.current = setTimeout(() => {
        router.push('/payout');
      }, 2500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isComplete, hasNavigated, router, stopPolling]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface sticky top-0 z-30">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-bold text-text-primary hover:text-earth-green-600 transition-colors p-2"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-text-muted bg-sand-100 px-2.5 py-1 rounded-full border border-border-subtle">
          <span>TX: {verificationId ? verificationId.slice(0, 8) : 'syncing'}...</span>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto p-4 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            On-Chain Validation Pipeline
          </span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Proof Verification Live
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Gemini acts advisory only. Fund release strictly requires deterministic oracle policy signature.
          </p>
        </div>

        {/* ─── 4-Step Vertical Progress Tracker ─────────────────────── */}
        <FadeIn delay={0.1}>
          <Card className="border border-border-default bg-surface p-5 shadow-sm space-y-4">
            <ProgressTracker steps={steps} />

            {/* Real Gemini Vision Audit Output */}
            {geminiStep?.status === 'success' && geminiStep.result && (
              <div className="mt-4 p-4 rounded-xl bg-earth-green-50/80 border border-earth-green-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-earth-green-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-earth-green-600" />
                    Gemini Vision Crop Audit
                  </span>
                  <span className="text-[11px] font-semibold text-earth-green-700 bg-earth-green-100 px-2 py-0.5 rounded-full">
                    {Math.round(geminiStep.result.confidence * 100)}% confidence
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wide">
                    Dominant Visible Risk
                  </p>
                  <p className="text-xs text-text-primary mt-0.5 font-medium">
                    {geminiStep.result.immediateRiskFactor}
                  </p>
                </div>

                <div className="pt-2 border-t border-earth-green-200">
                  <p className="text-[11px] font-bold text-earth-green-900 uppercase tracking-wide">
                    Recommended Micro-Action
                  </p>
                  <p className="text-xs text-earth-green-800 mt-0.5 font-medium">
                    {geminiStep.result.recommendedMicroAction}
                  </p>
                </div>

                {geminiStep.result.cropStressLevel > 0 && (
                  <div className="text-[11px] text-text-muted">
                    Assessed Stress Level:{' '}
                    <span className="font-bold text-text-secondary">
                      {geminiStep.result.cropStressLevel}/10
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </FadeIn>

        {/* ─── Status Callouts ─────────────────────────────────────── */}
        {isComplete ? (
          <FadeIn delay={0.15}>
            <div className="p-4 rounded-xl bg-earth-green-50 border-2 border-earth-green-500 text-earth-green-900 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-earth-green-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">All Cryptographic Gates Cleared!</h4>
                <p className="text-xs text-earth-green-800">
                  ZK Proof minted on Solana. Disbursing ₹500 micro-relief grant...
                </p>
              </div>
            </div>
          </FadeIn>
        ) : isFailed ? (
          <FadeIn delay={0.15} className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-400 text-red-900 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-error shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Verification Check Failed</h4>
                <p className="text-xs text-red-800 mt-0.5">
                  {failedStep?.failureReason ||
                    'Physical proof does not match deterministic telemetry thresholds.'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {isRetryable && hasCapturedState && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="flex items-center justify-center gap-2 h-14"
                >
                  <RefreshCw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
                  <span>{isRetrying ? 'Retrying Verification...' : 'Try Again'}</span>
                </Button>
              )}

              <Button
                onClick={() => router.push('/verification/capture')}
                variant="secondary"
                size="lg"
                fullWidth
                className="flex items-center justify-center gap-2 border border-border-default h-14"
              >
                <Camera className="h-4 w-4" />
                <span>Retake Photo</span>
              </Button>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.15}>
            <div className="p-3.5 bg-sand-100 rounded-lg border border-border-subtle flex items-center gap-2.5 text-xs text-text-secondary">
              <Lock className="h-4 w-4 text-terracotta-500 shrink-0" />
              <span>
                Smart escrow holds ₹500 locked in multisig custody until all 4 verification barriers sign off.
              </span>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
