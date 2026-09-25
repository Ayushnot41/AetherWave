/**
 * Locale Store
 *
 * Manages the user's selected dialect for UI localisation and TTS.
 * Persisted to localStorage so the preference survives sessions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DialectCode } from '@/contracts';

interface Dialect {
  code: DialectCode;
  name: string;
  nativeName: string;
}

const AVAILABLE_DIALECTS: readonly Dialect[] = [
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'en-IN', name: 'English', nativeName: 'English' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
] as const;

interface LocaleState {
  dialectCode: DialectCode;
  availableDialects: readonly Dialect[];
}

interface LocaleActions {
  setDialect: (code: DialectCode) => void;
}

type LocaleStore = LocaleState & LocaleActions;

export const useLocaleStore = create<LocaleStore>()(
  persist<LocaleStore>(
    (set) => ({
      dialectCode: 'hi-IN',
      availableDialects: AVAILABLE_DIALECTS,

      setDialect: (code: DialectCode) => {
        const isValid = AVAILABLE_DIALECTS.some((d) => d.code === code);
        if (!isValid) return;
        set({ dialectCode: code });
      },
    }),
    {
      name: 'aetherweave-locale',
      partialize: (state: LocaleStore) => ({
        dialectCode: state.dialectCode,
      }),
    },
  ),
);
