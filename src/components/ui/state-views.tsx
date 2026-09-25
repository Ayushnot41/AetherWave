'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, WifiOff, Loader2, Inbox } from 'lucide-react';
import { Button } from './button';

/* ─── Offline Banner ─── */
interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold animate-pulse-subtle',
        className,
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You are offline. Some features may be limited.</span>
    </div>
  );
}

/* ─── Loading Spinner (full-screen) ─── */
interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ message = 'Loading…', className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh] gap-4',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="h-10 w-10 text-earth-green-500 animate-spin"
        aria-hidden="true"
      />
      <p className="text-text-secondary text-base">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}

/* ─── Error State ─── */
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[40vh] gap-4 px-6 text-center',
        className,
      )}
      role="alert"
    >
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-error" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <p className="text-text-secondary text-base max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

/* ─── Empty State ─── */
interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, message, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[40vh] gap-4 px-6 text-center',
        className,
      )}
    >
      {icon ?? (
        <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center">
          <Inbox className="h-8 w-8 text-text-muted" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <p className="text-text-secondary text-base max-w-sm">{message}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* ─── Offline State ─── */
interface OfflineStateProps {
  message?: string;
  className?: string;
}

export function OfflineState({
  message = 'This content is not available offline. Please reconnect to load.',
  className,
}: OfflineStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[40vh] gap-4 px-6 text-center',
        className,
      )}
      role="alert"
    >
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
        <WifiOff className="h-8 w-8 text-amber-600" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">No connection</h2>
      <p className="text-text-secondary text-base max-w-sm">{message}</p>
    </div>
  );
}
