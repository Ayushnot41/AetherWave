'use client';

import { WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function OfflineFallbackPage() {
  const router = useRouter();

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-6">
      <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300">
        <WifiOff className="h-10 w-10 text-amber-700" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Offline Mode Engaged
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          AetherWeave is designed for intermittent rural connectivity. Previously cached advisory protocols and offline cryptographic signing remain operational.
        </p>
      </div>

      <div className="w-full space-y-3 pt-2">
        <Button
          onClick={handleRetry}
          variant="primary"
          size="lg"
          fullWidth
          className="bg-earth-green-500 hover:bg-earth-green-600 text-white font-bold h-14 flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Check Connection Again</span>
        </Button>

        <Button
          onClick={() => router.push('/dashboard')}
          variant="secondary"
          size="md"
          fullWidth
          className="flex items-center justify-center gap-2 border border-border-default"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go to Cached Dashboard</span>
        </Button>
      </div>
    </div>
  );
}
