/**
 * In-memory store for demo/development mode.
 *
 * Replaces a PostgreSQL database when DB_CONNECTION_STRING is not set.
 * All data is lost on server restart — this is intentional for demo use.
 *
 * In production, swap every function here with pg/postgres.js queries
 * using the same interface.
 */

import { env } from './env.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VerificationRecord {
  verificationId: string;
  actionId: string;
  deviceId: string;
  proofImageBlobRef: string;
  telemetry: {
    gps: { latitude: number; longitude: number; accuracy: number; altitude: number | null };
    gyroscope: { alpha: number; beta: number; gamma: number };
    timestamp: string;
    deviceId: string;
  };
  status: 'pending' | 'gemini_validating' | 'oracle_checking' | 'minting' | 'escrow_unlocking' | 'approved' | 'rejected';
  geminiConfidence?: number;
  geminiRawText?: string;
  localTempCelsius?: number;
  guardrailApproved?: boolean;
  guardrailReasons?: string[];
  guardrailBlockingRule?: string;
  solanaMintSignature?: string;
  solanaMintIsLive?: boolean;
  solanaExplorerUrl?: string;
  escrowSignature?: string;
  escrowIsLive?: boolean;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRecord {
  idempotencyKey: string; // = verificationId (one payout per verification)
  verificationId: string;
  deviceId: string;
  amountInr: number; // always 500
  transactionSignature: string;
  explorerUrl: string;
  paymentMethod: 'upi' | 'bank_transfer' | 'mobile_wallet' | 'solana_wallet';
  isLive: boolean;
  createdAt: string;
}

export interface DeviceCooldownRecord {
  deviceId: string;
  lastClaimAt: string;
}

// ---------------------------------------------------------------------------
// In-memory store (DEMO_MODE)
// ---------------------------------------------------------------------------

const verifications = new Map<string, VerificationRecord>();
const payouts = new Map<string, PayoutRecord>();
const deviceCooldowns = new Map<string, DeviceCooldownRecord>();
const otpRequests = new Map<string, { phone: string; otp: string; expiresAt: string; dialect: string }>();

// ---------------------------------------------------------------------------
// OTP store
// ---------------------------------------------------------------------------

export function storeOtpRequest(params: {
  requestId: string;
  phone: string;
  otp: string;
  expiresAt: string;
  dialect: string;
}): void {
  otpRequests.set(params.requestId, {
    phone: params.phone,
    otp: params.otp,
    expiresAt: params.expiresAt,
    dialect: params.dialect,
  });
}

export function getOtpRequest(requestId: string) {
  return otpRequests.get(requestId) ?? null;
}

export function deleteOtpRequest(requestId: string): void {
  otpRequests.delete(requestId);
}

// ---------------------------------------------------------------------------
// Verification store
// ---------------------------------------------------------------------------

export function createVerification(record: VerificationRecord): void {
  verifications.set(record.verificationId, record);
}

export function getVerification(verificationId: string): VerificationRecord | null {
  return verifications.get(verificationId) ?? null;
}

export function updateVerification(
  verificationId: string,
  patch: Partial<VerificationRecord>,
): void {
  const existing = verifications.get(verificationId);
  if (!existing) {
    if (env.NODE_ENV !== 'test') {
      console.warn(`[store] updateVerification: ${verificationId} not found`);
    }
    return;
  }
  verifications.set(verificationId, {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Payout store (idempotency enforced here)
// ---------------------------------------------------------------------------

export function getPayoutByIdempotencyKey(key: string): PayoutRecord | null {
  return payouts.get(key) ?? null;
}

export function createPayout(record: PayoutRecord): void {
  if (payouts.has(record.idempotencyKey)) {
    // Already paid — idempotency: silently ignore duplicate
    console.warn(`[store] Duplicate payout attempt for idempotencyKey=${record.idempotencyKey} — ignored`);
    return;
  }
  payouts.set(record.idempotencyKey, record);
}

export function getPayoutByVerificationId(verificationId: string): PayoutRecord | null {
  for (const p of payouts.values()) {
    if (p.verificationId === verificationId) return p;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Device cooldown
// ---------------------------------------------------------------------------

export function getDeviceCooldown(deviceId: string): DeviceCooldownRecord | null {
  return deviceCooldowns.get(deviceId) ?? null;
}

export function setDeviceCooldown(deviceId: string, lastClaimAt: string): void {
  deviceCooldowns.set(deviceId, { deviceId, lastClaimAt });
}
