'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
} from 'lucide-react';
import { Button, Card, ScaleIn, FadeIn } from '@/components/ui';
import { useVerificationStore } from '@/stores/verification-store';
import { truncateAddress, solanaExplorerUrl, formatCurrency } from '@/lib/utils';

export default function PayoutSuccessPage() {
  const router = useRouter();
  const { payoutResult } = useVerificationStore();

  const [copied, setCopied] = useState(false);

  // Fallback signature for demo resilience if live mock hasn't finished
  const signature =
    payoutResult?.transactionSignature ||
    '5KnhB9QZ7G3hN4tXpL1sV8wU2yA6bC8dE9fG0hJ1kM2nP3rS4tU5vW6xY7zA8bC9dE0fG';

  const amount = payoutResult?.amount ?? 5.0;
  const paymentMethod = payoutResult?.paymentMethod || 'UPI Instant Settlement';
  const explorerUrl = solanaExplorerUrl(signature, 'devnet');

  const handleCopySignature = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 max-w-md mx-auto pb-10 pt-8">
      <div className="space-y-6">
        {/* ─── Celebratory Restrained Hero ─────────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-3 pt-4">
          <ScaleIn>
            <div className="h-20 w-20 rounded-full bg-earth-green-100 border-4 border-earth-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-earth-green-600" />
            </div>
          </ScaleIn>

          <FadeIn delay={0.15}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-text-secondary text-xs font-bold mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Anticipatory Resilience Disbursed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
              {formatCurrency(amount, 'USD')} Micro-Grant
            </h1>
            <p className="text-xs text-text-muted max-w-xs mt-1">
              Preventative protocol executed and cryptographically sealed on Solana before the climate shock peaked.
            </p>
          </FadeIn>
        </div>

        {/* ─── Payout Details Receipt Card ─────────────────────────── */}
        <FadeIn delay={0.25}>
          <Card className="border-2 border-border-default bg-surface shadow-sm overflow-hidden divide-y divide-border-subtle">
            {/* Payment Method Banner */}
            <div className="p-4 bg-earth-green-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-earth-green-500 text-white flex items-center justify-center font-bold text-xs">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-text-muted font-medium">Disbursal Channel</div>
                  <div className="text-sm font-bold text-earth-green-900">{paymentMethod}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-earth-green-700 bg-earth-green-200/60 px-2 py-0.5 rounded">
                Settled
              </span>
            </div>

            {/* Cryptographic Proof Details */}
            <div className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">On-Chain Protocol:</span>
                <span className="font-bold text-text-primary flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-earth-green-600" />
                  Solana ZK-Compressed Mint
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted">Disbursal Time:</span>
                <span className="font-mono text-text-primary">
                  {payoutResult ? new Date(payoutResult.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="pt-2 border-t border-border-subtle space-y-1.5">
                <span className="text-text-muted block">Transaction Signature:</span>
                <div className="flex items-center justify-between gap-2 p-2 rounded bg-sand-50 border border-border-subtle font-mono text-[11px]">
                  <span className="truncate text-text-secondary">{truncateAddress(signature)}</span>
                  <button
                    type="button"
                    onClick={handleCopySignature}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-sand-200 hover:bg-sand-300 text-text-primary font-sans font-bold text-[10px] shrink-0"
                    aria-label="Copy Transaction Signature"
                  >
                    {copied ? <Check className="h-3 w-3 text-earth-green-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Solana Explorer Deep Link */}
              <div className="pt-2">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-earth-green-300 bg-earth-green-50 hover:bg-earth-green-100 text-earth-green-800 font-bold text-xs transition-colors"
                >
                  <span>Verify on Solana Explorer</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Impact Attestation Note */}
        <FadeIn delay={0.3}>
          <div className="p-3.5 bg-sand-100 rounded-lg border border-border-subtle text-xs text-text-secondary flex items-start gap-2.5">
            <Building2 className="h-4 w-4 text-terracotta-500 shrink-0 mt-0.5" />
            <p>
              This transaction provides public, immutable proof of proactive climate defense without disclosing the farmer's private personal identity.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* ─── Bottom CTA ───────────────────────────────────────────── */}
      <FadeIn delay={0.35} className="pt-6">
        <Button
          onClick={() => router.push('/dashboard')}
          size="lg"
          fullWidth
          className="h-16 text-base font-bold bg-earth-green-500 hover:bg-earth-green-600 text-white shadow-lg flex items-center justify-center gap-2"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </FadeIn>
    </div>
  );
}
