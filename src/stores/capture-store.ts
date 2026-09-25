/**
 * Capture Store
 *
 * Manages camera/mic permissions, captured media blobs, and GPS/gyroscope
 * telemetry acquisition for the multimodal intake flow.
 */

import { create } from 'zustand';
import type { TelemetryPayload } from '@/contracts';

type PermissionState = 'prompt' | 'granted' | 'denied';
type TelemetryStatus = 'idle' | 'acquiring' | 'locked' | 'failed';
type SigningStatus = 'idle' | 'signing' | 'signed' | 'failed';

interface CaptureState {
  cameraPermission: PermissionState;
  micPermission: PermissionState;
  capturedImage: Blob | null;
  capturedAudio: Blob | null;
  telemetryStatus: TelemetryStatus;
  telemetry: TelemetryPayload | null;
  signingStatus: SigningStatus;
  isProcessing: boolean;
}

interface CaptureActions {
  requestCameraPermission: () => Promise<void>;
  requestMicPermission: () => Promise<void>;
  setCapturedImage: (blob: Blob | null) => void;
  setCapturedAudio: (blob: Blob | null) => void;
  startTelemetryAcquisition: () => Promise<void>;
  setSigningStatus: (status: SigningStatus) => void;
  setIsProcessing: (processing: boolean) => void;
  resetCapture: () => void;
}

type CaptureStore = CaptureState & CaptureActions;

const initialState: CaptureState = {
  cameraPermission: 'prompt',
  micPermission: 'prompt',
  capturedImage: null,
  capturedAudio: null,
  telemetryStatus: 'idle',
  telemetry: null,
  signingStatus: 'idle',
  isProcessing: false,
};

/**
 * Read the current device orientation synchronously via a one-shot listener.
 * Returns zeros if the sensor is unavailable (desktop / denied).
 */
function readDeviceOrientation(): Promise<{ alpha: number; beta: number; gamma: number }> {
  return new Promise((resolve) => {
    const fallback = { alpha: 0, beta: 0, gamma: 0 };

    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      resolve(fallback);
      return;
    }

    const timeout = window.setTimeout(() => {
      resolve(fallback);
    }, 2000);

    const handler = (event: DeviceOrientationEvent) => {
      window.clearTimeout(timeout);
      window.removeEventListener('deviceorientation', handler);
      resolve({
        alpha: event.alpha ?? 0,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      });
    };

    window.addEventListener('deviceorientation', handler, { once: true });
  });
}

/**
 * Generate a stable-ish device fingerprint for fraud detection.
 * Uses a combination of navigator properties hashed into a short ID.
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Simple FNV-1a 32-bit hash for a deterministic fingerprint
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export const useCaptureStore = create<CaptureStore>()((set) => ({
  ...initialState,

  requestCameraPermission: async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      set({ cameraPermission: 'denied' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Immediately stop tracks — we only needed permission
      stream.getTracks().forEach((track) => track.stop());
      set({ cameraPermission: 'granted' });
    } catch (err) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      set({ cameraPermission: isDenied ? 'denied' : 'denied' });
    }
  },

  requestMicPermission: async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      set({ micPermission: 'denied' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      set({ micPermission: 'granted' });
    } catch {
      set({ micPermission: 'denied' });
    }
  },

  setCapturedImage: (blob: Blob | null) => {
    set({ capturedImage: blob });
  },

  setCapturedAudio: (blob: Blob | null) => {
    set({ capturedAudio: blob });
  },

  startTelemetryAcquisition: async () => {
    set({ telemetryStatus: 'acquiring', telemetry: null });

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      set({ telemetryStatus: 'failed', telemetry: null });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        },
      );

      const gyroscope = await readDeviceOrientation();

      const telemetry: TelemetryPayload = {
        gps: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
        },
        gyroscope,
        timestamp: new Date().toISOString(),
        deviceId: getDeviceId(),
      };

      set({ telemetryStatus: 'locked', telemetry });
    } catch {
      set({ telemetryStatus: 'failed', telemetry: null });
    }
  },

  setSigningStatus: (status: SigningStatus) => {
    set({ signingStatus: status });
  },

  setIsProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },

  resetCapture: () => {
    set({ ...initialState });
  },
}));
