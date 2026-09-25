'use client';

import { MapPin, Compass, Clock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import type { TelemetryPayload } from '@/contracts';
import { cn } from '@/lib/utils';

interface TelemetryChipProps {
  telemetry: TelemetryPayload | null;
  status: 'idle' | 'acquiring' | 'locked' | 'failed';
  signingStatus: 'idle' | 'signing' | 'signed' | 'failed';
  className?: string;
}

export function TelemetryChip({
  telemetry,
  status,
  signingStatus,
  className,
}: TelemetryChipProps) {
  const getGpsStatusDisplay = () => {
    switch (status) {
      case 'acquiring':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin text-amber-500" />,
          label: 'Acquiring GPS...',
          color: 'text-amber-300',
        };
      case 'locked':
        return {
          icon: <MapPin className="h-3 w-3 text-earth-green-400" />,
          label: telemetry
            ? `${telemetry.gps.latitude.toFixed(4)}°, ${telemetry.gps.longitude.toFixed(4)}° (±${Math.round(
                telemetry.gps.accuracy,
              )}m)`
            : 'GPS Locked',
          color: 'text-earth-green-300',
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-3 w-3 text-error" />,
          label: 'GPS Unavailable',
          color: 'text-red-400',
        };
      default:
        return {
          icon: <MapPin className="h-3 w-3 text-sand-400" />,
          label: 'GPS Inactive',
          color: 'text-sand-300',
        };
    }
  };

  const gpsDisplay = getGpsStatusDisplay();

  return (
    <div
      className={cn(
        'backdrop-blur-md bg-black/60 border border-white/20 text-white rounded-lg p-2.5 text-xs shadow-lg space-y-1.5 min-w-[200px]',
        className,
      )}
      role="status"
      aria-label="Live Hardware Telemetry"
    >
      {/* GPS Telemetry Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {gpsDisplay.icon}
          <span className={cn('font-mono font-medium text-[11px]', gpsDisplay.color)}>
            {gpsDisplay.label}
          </span>
        </div>
      </div>

      {/* Gyroscope / Sensor Vector */}
      <div className="flex items-center justify-between text-[10px] text-white/70 font-mono">
        <div className="flex items-center gap-1">
          <Compass className="h-2.5 w-2.5 text-sand-300" />
          <span>
            {telemetry?.gyroscope
              ? `α:${Math.round(telemetry.gyroscope.alpha)}° β:${Math.round(
                  telemetry.gyroscope.beta,
                )}°`
              : 'Sensors active'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5 text-sand-300" />
          <span>{telemetry ? new Date(telemetry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live'}</span>
        </div>
      </div>

      {/* WebCrypto Hardware Signing State */}
      <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px]">
        <span className="text-white/60">Hardware Signature:</span>
        <span
          className={cn(
            'font-bold flex items-center gap-1',
            signingStatus === 'signed'
              ? 'text-earth-green-400'
              : signingStatus === 'signing'
              ? 'text-amber-400'
              : signingStatus === 'failed'
              ? 'text-red-400'
              : 'text-sand-300',
          )}
        >
          {signingStatus === 'signed' && <ShieldCheck className="h-3 w-3" />}
          {signingStatus === 'signing' && <Loader2 className="h-3 w-3 animate-spin" />}
          {signingStatus === 'signed'
            ? 'WebCrypto Valid'
            : signingStatus === 'signing'
            ? 'Signing Frame...'
            : signingStatus === 'failed'
            ? 'Signing Denied'
            : 'Ready to Sign'}
        </span>
      </div>
    </div>
  );
}
