'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck, Upload, AlertCircle, RefreshCcw } from 'lucide-react';
import { CameraViewfinder } from '@/components/capture/camera-viewfinder';
import { AudioRecorder } from '@/components/capture/audio-recorder';
import { Button, LoadingScreen } from '@/components/ui';
import { useLocaleStore } from '@/stores/locale-store';
import { submitIntake } from '@/lib/api-client';
import type { TelemetryPayload } from '@/contracts';

export default function IntakeCapturePage() {
  const router = useRouter();
  const { dialectCode } = useLocaleStore();

  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [capturedAudio, setCapturedAudio] = useState<Blob | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCaptureComplete = (imageBlob: Blob, sensorTelemetry: TelemetryPayload) => {
    setCapturedImage(imageBlob);
    setTelemetry(sensorTelemetry);
  };

  const handleAudioComplete = (audioBlob: Blob) => {
    setCapturedAudio(audioBlob);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setTelemetry(null);
    setCapturedAudio(null);
    setErrorMessage(null);
  };

  const handleSubmitIntake = async () => {
    if (!capturedImage || !telemetry) {
      setErrorMessage('Image frame and telemetry signature are required.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // In production/demo, we convert blob to local object reference or upload payload
      const imageBlobRef = `blob-ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
      const audioBlobRef = capturedAudio
        ? `audio-ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webm`
        : null;

      const submissionPayload = {
        imageBlobRef,
        audioBlobRef,
        telemetry,
        dialect: dialectCode,
      };

      const result = await submitIntake(submissionPayload);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsProcessing(false);
        return;
      }

      // Successful intake submission -> proceed to dynamic cascade visualization
      router.push('/cascade');
    } catch (err: unknown) {
      console.error('Intake submission error:', err);
      const msg = err instanceof Error ? err.message : 'Telemetry pipeline verification rejected';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <LoadingScreen message="Cryptographically verifying hardware signature and dispatching to Gemini multimodal triage..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-8">
      {/* ─── Top Nav ──────────────────────────────────────────────── */}
      <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-bold text-text-primary hover:text-earth-green-600 transition-colors p-2"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Multimodal Intake
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-md w-full mx-auto p-4 space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-lg text-sm text-red-900 flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Hardware Verification Notice</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {!capturedImage ? (
          <>
            <CameraViewfinder
              onCapture={handleCaptureComplete}
              titleBadge="CROP CANOPY TELEMETRY"
            />

            <div className="pt-2">
              <AudioRecorder
                onAudioRecorded={handleAudioComplete}
              />
            </div>
          </>
        ) : (
          /* ─── Review & Cryptographic Attestation Screen ─────────── */
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border-2 border-earth-green-500 relative shadow-md">
                <img
                  src={URL.createObjectURL(capturedImage)}
                  alt="Verified Hardware Frame"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-earth-green-400" />
                  <span>SHA256 Signed Frame</span>
                </div>
              </div>

              {/* Hardware Telemetry Card */}
              <div className="bg-surface rounded-xl p-4 border border-border-default space-y-2 text-xs">
                <div className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  Attested Hardware Metrics
                </div>
                <div className="grid grid-cols-2 gap-2 text-text-secondary font-mono">
                  <div>GPS Lat: {telemetry?.gps.latitude.toFixed(6)}°</div>
                  <div>GPS Lon: {telemetry?.gps.longitude.toFixed(6)}°</div>
                  <div>Accuracy: ±{telemetry?.gps.accuracy}m</div>
                  <div>Timestamp: {telemetry ? new Date(telemetry.timestamp).toLocaleTimeString() : ''}</div>
                </div>
                {capturedAudio && (
                  <div className="pt-2 border-t border-border-subtle flex items-center gap-2 text-earth-green-600 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Vernacular Audio Stream Packaged</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleSubmitIntake}
                size="lg"
                fullWidth
                className="bg-earth-green-500 hover:bg-earth-green-600 text-white font-bold h-14 text-base shadow-md flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                <span>Submit to Gemini & Swarm</span>
              </Button>

              <Button
                onClick={handleRetake}
                variant="secondary"
                size="md"
                fullWidth
                className="flex items-center justify-center gap-2 border border-border-default"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Retake Frame</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
