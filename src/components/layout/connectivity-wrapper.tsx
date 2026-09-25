'use client';

import { useEffect, type ReactNode } from 'react';
import { OfflineBanner } from '@/components/ui/state-views';
import { useConnectivityStore } from '@/stores/connectivity-store';

interface ConnectivityWrapperProps {
  children: ReactNode;
}

export function ConnectivityWrapper({ children }: ConnectivityWrapperProps) {
  const { isOnline, initialize, cleanup } = useConnectivityStore();

  useEffect(() => {
    initialize();
    return cleanup;
  }, [initialize, cleanup]);

  return (
    <>
      {!isOnline && <OfflineBanner />}
      <main className="flex flex-col min-h-screen">
        {children}
      </main>
    </>
  );
}
