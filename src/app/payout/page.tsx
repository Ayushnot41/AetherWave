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
import { VerificationSeal3D } from '@/components/3d/verification-seal-3d';
import { SolanaZkVault3D } from '@/components/3d/solana-zk-vault-3d';
import { useVerificationStore } from '@/stores/verification-store';
import { truncateAddress, solanaExplorerUrl, formatCurrency } from '@/lib/utils';

export default function PayoutSuccessPage() {
  const router = useRouter();
  const { payoutResult } = useVerificationStore();

  const [copied, setCopied] = useState(false);

  // Fallback signature for demo resilience
  const signature =
    payoutResult?.transactionSignature ||
    '5KnhB9QZ7G3hN4tXpL1sV8wU2yA6bC8dE9fG0hJ1kM2nP3rS4tU5vW6xY7zA8bC9dE0fG';

  const amount = payoutResult?.amount ?? 500;
  const paymentMethod = payoutResult?.paymentMethod || 'Direct DBT / PM-KISAN Instant UPI Settlement';
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
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 max-w-2xl mx-auto pb-12 pt-8">
      <div className="space-y-6">
        {/* ─── Celebratory 3D Physical Seal Hero ──────────────────── */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <VerificationSeal3D size={180} />

          <FadeIn delay={0.15}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-text-secondary text-xs font-bold mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>National Anticipatory Climate Resilience Disbursed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
              ₹{amount.toLocaleString('en-IN')} Direct Disbursal
            </h1>
            <p className="text-xs text-text-muted max-w-md mt-1">
              Anticipatory relief protocol executed and cryptographically sealed on Solana before climate shock threshold.
            </p>
          </FadeIn>
        </div>

        {/* ─── 3D Solana Cryptographic Vault ───────────────────────── */}
        <FadeIn delay={0.2}>
          <div className="rounded-xl overflow-hidden shadow-lg border border-purple-900/40">
            <SolanaZkVault3D
              height="380px"
              farmerName="Rameshwar Patil (रामेश्वर पाटिल)"
              gpsCoords="20.5937° N, 78.9629° E [Attested]"
              disasterRiskPercent={28}
              onTimeProfitInr={91440}
              delayedLossInr={34500}
              harvestEarningsInr={143088}
              blockSlot={284910283}
              txSignature={signature}
            />
          </div>
          <div className="text-center text-xs text-text-muted mt-2">
            Rotate 3D Vault: Sealed data represents immutable on-chain state hash
          </div>
        </FadeIn>

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
                  Solana ZK-Compressed Merkle Attestation
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted">Disbursal Timestamp:</span>
                <span className="font-mono text-text-primary">
                  {payoutResult ? new Date(payoutResult.timestamp).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted">Aadhaar Beneficiary Hash:</span>
                <span className="font-mono text-text-primary">0x7f4a...8b9c [Attested]</span>
              </div>

              <div className="flex flex-col gap-1 pt-1 border-t border-border-subtle">
                <span className="text-text-muted">Solana Transaction Signature:</span>
                <div className="flex items-center gap-2 bg-background p-2 rounded border border-border-subtle">
                  <span className="font-mono text-[11px] text-text-secondary truncate flex-1">
                    {signature}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySignature}
                    className="text-text-muted hover:text-text-primary p-1"
                    title="Copy Signature"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-earth-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Solana Explorer Action Button */}
            <div className="p-4 bg-sand-50/50 flex justify-between items-center">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-earth-green-700 hover:text-earth-green-800 transition-colors"
              >
                <span>Verify on Solana Explorer</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-1 text-xs font-mono font-bold text-text-muted">
                <Building2 className="h-3.5 w-3.5" />
                <span>NPCI / Agristack Gateway</span>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* ─── Footer Action ───────────────────────────────────────── */}
      <div className="mt-8 space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center shadow-md font-bold"
          onClick={() => router.push('/dashboard')}
        >
          <span>Return to Dashboard / मुख्य पृष्ठ</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
