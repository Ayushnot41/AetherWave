'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingScreen } from '@/components/ui';

/**
 * Root page — redirects authenticated users to /dashboard,
 * unauthenticated users to /onboarding.
 *
 * Uses a hydration guard: Zustand persist rehydrates from localStorage
 * after mount, so we wait one tick before reading `isAuthenticated`.
 */
export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s: { isAuthenticated: boolean }) => s.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    /**
     * Zustand's persist middleware fires `onRehydrateStorage` synchronously
     * after the first render. Deferring our read to the next micro-task
     * ensures we don't redirect based on the initial (empty) state.
     */
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    /* If rehydration already completed before mount (fast path): */
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [isHydrated, isAuthenticated, router]);

  return <LoadingScreen message="Starting AetherWeave…" />;
}
