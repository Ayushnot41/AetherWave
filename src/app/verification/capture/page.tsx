'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Upload, AlertCircle, RefreshCcw } from 'lucide-react';
import { CameraViewfinder } from '@/components/capture/camera-viewfinder';
import { Button, LoadingScreen } from '@/components/ui';
import { useVerificationStore } from '@/stores/verification-store';
import { submitVerification } from '@/lib/api-client';
import type { TelemetryPayload } from '@/contracts';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function VerificationCapturePage() {
  const router = useRouter();
  const { startPolling, setLastSubmission } = useVerificationStore();

  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCaptureComplete = (imageBlob: Blob, sensorTelemetry: TelemetryPayload) => {
    setCapturedImage(imageBlob);
    setTelemetry(sensorTelemetry);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setTelemetry(null);
    setErrorMessage(null);
  };

  const handleSubmitProof = async () => {
    if (!capturedImage || !telemetry) {
      setErrorMessage('Verification proof photo and hardware telemetry are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const proofImageBase64 = await blobToBase64(capturedImage);
      const proofImageBlobRef = `proof-blob-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

      const payload = {
        actionId: 'act-402',
        proofImageBlobRef,
        proofImageBase64,
        telemetry,
      };
      setLastSubmission(payload);

      const result = await submitVerification(payload);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsSubmitting(false);
        return;
      }

      // Start live 4-stage pipeline polling
      startPolling(result.data.verificationId);

      // Navigate to live status tracker
      router.push('/verification/status');
    } catch (err: unknown) {
      console.error('Verification submission failed:', err);
      const msg = err instanceof Error ? err.message : 'Cryptographic proof submission failed';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <LoadingScreen message="Attesting cryptographic hardware signature and queuing for on-chain verification pipeline..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-8">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-bold text-text-primary hover:text-earth-green-600 transition-colors p-2"
          aria-label="Back to Action"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Action</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-earth-green-700 bg-earth-green-50 px-2.5 py-1 rounded-full border border-earth-green-300">
          Hardware Proof Capture
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-md w-full mx-auto p-4 space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-lg text-sm text-red-900 flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Proof Attestation Failed</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {!capturedImage ? (
          <CameraViewfinder
            onCapture={handleCaptureComplete}
            titleBadge="PROOF OF COMPLETED ACTION"
          />
        ) : (
          /* ─── Proof Review & Hardware Signing Attestation ──────── */
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border-2 border-amber-500 relative shadow-md">
                <img
                  src={URL.createObjectURL(capturedImage)}
                  alt="Completed Action Proof"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>Hardware Signed Proof #402</span>
                </div>
              </div>

              {/* Hardware Telemetry Card */}
              <div className="bg-surface rounded-xl p-4 border border-border-default space-y-2 text-xs">
                <div className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Cryptographic Telemetry Package</span>
                  <span className="text-earth-green-600 font-bold">Ready</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-text-secondary font-mono">
                  <div>GPS Lat: {telemetry?.gps.latitude.toFixed(6)}°</div>
                  <div>GPS Lon: {telemetry?.gps.longitude.toFixed(6)}°</div>
                  <div>Accuracy: ±{telemetry?.gps.accuracy}m</div>
                  <div>Device: {telemetry?.deviceId}</div>
                </div>
                <div className="pt-2 border-t border-border-subtle text-[11px] text-text-muted">
                  Deterministic policy engine will cross-reference this GPS fix with satellite temperature anomalies.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleSubmitProof}
                size="lg"
                fullWidth
                className="bg-earth-green-500 hover:bg-earth-green-600 text-white font-bold h-14 text-base shadow-md flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                <span>Submit Proof to Oracle</span>
              </Button>

              <Button
                onClick={handleRetake}
                variant="secondary"
                size="md"
                fullWidth
                className="flex items-center justify-center gap-2 border border-border-default"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Retake Proof Frame</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
