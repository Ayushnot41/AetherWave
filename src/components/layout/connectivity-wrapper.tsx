'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { OfflineBanner } from '@/components/ui/state-views';
import { useConnectivityStore } from '@/stores/connectivity-store';

interface ConnectivityWrapperProps {
  children: ReactNode;
}

export function ConnectivityWrapper({ children }: ConnectivityWrapperProps) {
  const { isOnline, initialize, cleanup } = useConnectivityStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
    return cleanup;
  }, [initialize, cleanup]);

  return (
    <>
      {mounted && !isOnline && <OfflineBanner />}
      <main className="flex flex-col min-h-screen">
        {children}
      </main>
    </>
  );
}
