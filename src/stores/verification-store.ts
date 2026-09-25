/**
 * Verification Store
 *
 * Manages the verification proof-submission lifecycle, including
 * server-side polling for pipeline step status and eventual payout.
 * Polling runs every 3 s until a terminal state is reached.
 */

import { create } from 'zustand';
import {
  submitVerification as apiSubmitVerification,
  getVerificationStatus as apiGetVerificationStatus,
  getPayoutResult as apiGetPayoutResult,
} from '@/lib/api-client';
import type {
  VerificationStatus,
  VerificationSubmission,
  PayoutResult,
  PipelineStepStatus,
} from '@/contracts';

const POLLING_INTERVAL_MS = 3000;

/** A verification is terminal when every pipeline step has resolved. */
function isTerminal(status: VerificationStatus): boolean {
  const steps = status.steps;
  const terminalStatuses: PipelineStepStatus[] = ['success', 'failed'];

  return (
    terminalStatuses.includes(steps.geminiValidation.status) &&
    terminalStatuses.includes(steps.oracleCheck.status) &&
    terminalStatuses.includes(steps.solanaMint.status) &&
    terminalStatuses.includes(steps.escrowUnlock.status)
  );
}

/** Check if any step has failed. */
function hasFailed(status: VerificationStatus): boolean {
  const steps = status.steps;
  return (
    steps.geminiValidation.status === 'failed' ||
    steps.oracleCheck.status === 'failed' ||
    steps.solanaMint.status === 'failed' ||
    steps.escrowUnlock.status === 'failed'
  );
}

interface VerificationState {
  verificationId: string | null;
  status: VerificationStatus | null;
  payoutResult: PayoutResult | null;
  isPolling: boolean;
  isSubmitting: boolean;
  error: string | null;
}

interface VerificationActions {
  submitVerification: (data: VerificationSubmission) => Promise<void>;
  startPolling: (verificationId: string) => void;
  stopPolling: () => void;
  clearVerification: () => void;
}

type VerificationStore = VerificationState & VerificationActions;

const initialState: VerificationState = {
  verificationId: null,
  status: null,
  payoutResult: null,
  isPolling: false,
  isSubmitting: false,
  error: null,
};

/** Handle for the active polling interval. */
let pollingHandle: ReturnType<typeof setInterval> | null = null;

export const useVerificationStore = create<VerificationStore>()((set, get) => ({
  ...initialState,

  submitVerification: async (data: VerificationSubmission) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await apiSubmitVerification(data);

      if (!result.ok) {
        set({ isSubmitting: false, error: result.error.message });
        return;
      }

      set({
        isSubmitting: false,
        verificationId: result.data.verificationId,
      });

      // Auto-start polling after successful submission
      get().startPolling(result.data.verificationId);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit verification';
      set({ isSubmitting: false, error: message });
    }
  },

  startPolling: (verificationId: string) => {
    // Clean up any existing polling
    if (pollingHandle !== null) {
      clearInterval(pollingHandle);
      pollingHandle = null;
    }

    set({ isPolling: true, verificationId, error: null });

    const poll = async () => {
      try {
        const result = await apiGetVerificationStatus(verificationId);

        if (!result.ok) {
          set({ error: result.error.message });
          return;
        }

        set({ status: result.data, error: null });

        // Check terminal state
        if (isTerminal(result.data)) {
          get().stopPolling();

          // If fully successful, fetch payout
          if (!hasFailed(result.data)) {
            try {
              const payoutResult = await apiGetPayoutResult(verificationId);

              if (payoutResult.ok) {
                set({ payoutResult: payoutResult.data });
              }
            } catch {
              // Payout fetch failure is non-critical — status is still terminal
            }
          }
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to check verification status';
        set({ error: message });
      }
    };

    // Perform an immediate poll, then start the interval
    void poll();
    pollingHandle = setInterval(() => void poll(), POLLING_INTERVAL_MS);
  },

  stopPolling: () => {
    if (pollingHandle !== null) {
      clearInterval(pollingHandle);
      pollingHandle = null;
    }
    set({ isPolling: false });
  },

  clearVerification: () => {
    if (pollingHandle !== null) {
      clearInterval(pollingHandle);
      pollingHandle = null;
    }
    set({ ...initialState });
  },
}));
