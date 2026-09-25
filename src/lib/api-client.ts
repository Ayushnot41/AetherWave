import { z } from 'zod';

import {
  ApiErrorSchema,
  AuthOtpRequestSchema,
  AuthOtpResponseSchema,
  AuthOtpVerifySchema,
  AuthOtpVerifyResponseSchema,
  IntakeSubmissionSchema,
  IntakeSubmissionResponseSchema,
  SwarmResultSchema,
  RecommendedActionSchema,
  VerificationSubmissionSchema,
  VerificationSubmissionResponseSchema,
  VerificationStatusSchema,
  PayoutResultSchema,
} from '@/contracts';

import type {
  ApiError,
  AuthOtpRequest,
  AuthOtpResponse,
  AuthOtpVerify,
  AuthOtpVerifyResponse,
  IntakeSubmission,
  IntakeSubmissionResponse,
  SwarmResult,
  RecommendedAction,
  VerificationSubmission,
  VerificationSubmissionResponse,
  VerificationStatus,
  PayoutResult,
} from '@/contracts';

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL: string =
  (typeof process !== 'undefined'
    ? process.env['NEXT_PUBLIC_API_URL']
    : undefined) ?? '/api';

const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 30_000;
const INITIAL_BACKOFF_MS = 500;

// ---------------------------------------------------------------------------
// Offline error singleton
// ---------------------------------------------------------------------------

const OFFLINE_ERROR: ApiError = Object.freeze({
  code: 'NETWORK_OFFLINE',
  message: 'You appear to be offline. Please check your connection and try again.',
  retryable: true,
});

// ---------------------------------------------------------------------------
// Auth token retrieval
// ---------------------------------------------------------------------------

/**
 * Read the bearer token persisted by the Zustand auth store.
 * Returns `null` when running on the server or when no token exists.
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('aetherweave-auth');
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'state' in parsed
    ) {
      const state = (parsed as { state: { token?: string } }).state;
      return state.token ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

function createAbortSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function backoffMs(attempt: number): number {
  // Exponential: 500, 1000, 2000 + up to 25% jitter
  const base = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
  const jitter = base * 0.25 * Math.random();
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse an error body from the server, falling back to a generic error when
 * the response body doesn't match ApiErrorSchema.
 */
async function parseErrorBody(response: Response): Promise<ApiError> {
  try {
    const body: unknown = await response.json();
    const parsed = ApiErrorSchema.safeParse(body);
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // body wasn't JSON — fall through
  }

  return {
    code: `HTTP_${response.status}`,
    message: response.statusText || 'An unexpected error occurred',
    retryable: response.status >= 500 || response.status === 429,
  };
}

/**
 * Core fetch wrapper with retry, offline detection, timeout and Zod validation.
 */
async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  schema: z.ZodType<T>,
  body?: unknown,
): Promise<ApiResult<T>> {
  if (isOffline()) {
    return { ok: false, error: OFFLINE_ERROR };
  }

  let lastError: ApiError | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { signal, clear } = createAbortSignal(REQUEST_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const init: RequestInit = {
        method,
        headers,
        credentials: 'include', // sends httpOnly cookies
        signal,
      };

      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body);
      }

      const url = `${BASE_URL}${path}`;
      const response = await fetch(url, init);

      if (!response.ok) {
        const apiError = await parseErrorBody(response);
        lastError = apiError;

        if (apiError.retryable && attempt < MAX_RETRIES - 1) {
          await sleep(backoffMs(attempt));
          continue;
        }

        return { ok: false, error: apiError };
      }

      const json: unknown = await response.json();
      const parsed = schema.safeParse(json);

      if (!parsed.success) {
        return {
          ok: false,
          error: {
            code: 'RESPONSE_VALIDATION_FAILED',
            message: `Server response did not match expected schema: ${parsed.error.issues.map((i: z.ZodIssue) => i.message).join('; ')}`,
            retryable: false,
          },
        };
      }

      return { ok: true, data: parsed.data };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        lastError = {
          code: 'REQUEST_TIMEOUT',
          message: 'The request timed out. Please try again.',
          retryable: true,
        };
      } else if (err instanceof TypeError) {
        // Network failure (DNS, refused, etc.)
        lastError = {
          code: 'NETWORK_ERROR',
          message: 'Unable to reach the server. Please check your connection.',
          retryable: true,
        };
      } else {
        lastError = {
          code: 'UNKNOWN_ERROR',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
          retryable: false,
        };
      }

      if (lastError.retryable && attempt < MAX_RETRIES - 1) {
        await sleep(backoffMs(attempt));
        continue;
      }
    } finally {
      clear();
    }
  }

  return {
    ok: false,
    error: lastError ?? {
      code: 'UNKNOWN_ERROR',
      message: 'Request failed after multiple attempts',
      retryable: false,
    },
  };
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

/**
 * Request a one-time password sent to the user's phone.
 */
export function requestOtp(
  payload: AuthOtpRequest,
): Promise<ApiResult<AuthOtpResponse>> {
  const validated = AuthOtpRequestSchema.parse(payload);
  return request('POST', '/auth/otp/request', AuthOtpResponseSchema, validated);
}

/**
 * Verify a one-time password and receive an access token.
 */
export function verifyOtp(
  payload: AuthOtpVerify,
): Promise<ApiResult<AuthOtpVerifyResponse>> {
  const validated = AuthOtpVerifySchema.parse(payload);
  return request('POST', '/auth/otp/verify', AuthOtpVerifyResponseSchema, validated);
}

/**
 * Submit a multimodal intake capture (photo + audio + telemetry).
 */
export function submitIntake(
  payload: IntakeSubmission,
): Promise<ApiResult<IntakeSubmissionResponse>> {
  const validated = IntakeSubmissionSchema.parse(payload);
  return request('POST', '/intake/submit', IntakeSubmissionResponseSchema, validated);
}

/**
 * Retrieve the swarm risk-graph analysis result for a submission.
 */
export function getSwarmResult(
  submissionId: string,
): Promise<ApiResult<SwarmResult>> {
  return request('GET', `/swarm/result/${encodeURIComponent(submissionId)}`, SwarmResultSchema);
}

/**
 * Retrieve the recommended action for a given submission.
 */
export function getRecommendedAction(
  submissionId: string,
): Promise<ApiResult<RecommendedAction>> {
  return request(
    'GET',
    `/actions/recommended/${encodeURIComponent(submissionId)}`,
    RecommendedActionSchema,
  );
}

/**
 * Submit verification proof (photo + telemetry) for a recommended action.
 */
export function submitVerification(
  payload: VerificationSubmission,
): Promise<ApiResult<VerificationSubmissionResponse>> {
  const validated = VerificationSubmissionSchema.parse(payload);
  return request(
    'POST',
    '/verification/submit',
    VerificationSubmissionResponseSchema,
    validated,
  );
}

/**
 * Poll the 4-step verification pipeline status.
 */
export function getVerificationStatus(
  verificationId: string,
): Promise<ApiResult<VerificationStatus>> {
  return request(
    'GET',
    `/verification/status/${encodeURIComponent(verificationId)}`,
    VerificationStatusSchema,
  );
}

/**
 * Retrieve the payout result once verification succeeds.
 */
export function getPayoutResult(
  verificationId: string,
): Promise<ApiResult<PayoutResult>> {
  return request(
    'GET',
    `/payout/result/${encodeURIComponent(verificationId)}`,
    PayoutResultSchema,
  );
}

// ---------------------------------------------------------------------------
// Legacy compatibility – generic client
// ---------------------------------------------------------------------------

export const apiClient = {
  get<T>(path: string, schema: z.ZodType<T>): Promise<ApiResult<T>> {
    return request('GET', path, schema);
  },
  post<T>(path: string, schema: z.ZodType<T>, body?: unknown): Promise<ApiResult<T>> {
    return request('POST', path, schema, body);
  },
} as const;
