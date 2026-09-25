/**
 * Auth Store
 *
 * Manages authentication state with OTP-based passwordless login.
 * Persisted to localStorage so auth survives page refreshes and
 * provides offline user identity.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp } from '@/lib/api-client';
import type {
  DialectCode,
  AuthOtpVerifyResponse,
} from '@/contracts';

export interface AuthUser {
  id: string;
  phone: string;
  dialectCode: DialectCode;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  otpRequestId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  requestOtp: (phone: string, dialect: DialectCode) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  demoLogin: (dialect?: DialectCode) => void;
  logout: () => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  otpRequestId: null,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore>(
    (set, get) => ({
      ...initialState,

      requestOtp: async (phone: string, dialect: DialectCode) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiRequestOtp({ phone, dialect });

          if (!result.ok) {
            set({ isLoading: false, error: result.error.message });
            return;
          }

          set({
            isLoading: false,
            otpRequestId: result.data.requestId,
            user: {
              id: `usr-${Date.now().toString(36)}`,
              phone,
              dialectCode: dialect,
            },
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Failed to request OTP';
          set({ isLoading: false, error: message });
        }
      },

      verifyOtp: async (otp: string) => {
        const { otpRequestId, user } = get();
        // If for some reason otpRequestId was missing (e.g. testing), generate a fallback UUID
        const activeRequestId = otpRequestId ?? crypto.randomUUID();

        set({ isLoading: true, error: null });
        try {
          const result = await apiVerifyOtp({ requestId: activeRequestId, otp });

          if (!result.ok) {
            set({ isLoading: false, error: result.error.message });
            return;
          }

          const tokenResponse: AuthOtpVerifyResponse = result.data;

          set({
            isLoading: false,
            isAuthenticated: true,
            token: tokenResponse.accessToken,
            user: user ?? {
              id: `usr-${Date.now().toString(36)}`,
              phone: '+919876543210',
              dialectCode: 'hi-IN',
            },
            otpRequestId: null,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Failed to verify OTP';
          set({ isLoading: false, error: message });
        }
      },

      demoLogin: (dialect: DialectCode = 'hi-IN') => {
        set({
          isAuthenticated: true,
          token: `demo-token-${Date.now()}`,
          user: {
            id: 'demo-farmer-001',
            phone: '+919876543210',
            dialectCode: dialect,
          },
          error: null,
          isLoading: false,
          otpRequestId: null,
        });
      },

      logout: () => {
        set({ ...initialState });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'aetherweave-auth',
      partialize: (state: AuthStore) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
