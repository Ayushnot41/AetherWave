import type { GeminiAuditResult } from '@/contracts';

export interface GeminiAuditStateEntry {
  status: 'processing' | 'success' | 'failed';
  result?: GeminiAuditResult;
  failureReason?: string;
  retryable?: boolean;
  updatedAt?: string;
}

/**
 * Dev-session in-memory store attached to globalThis to survive HMR and bundle isolation.
 * Note: this is a dev/demo safeguard, not production distributed persistence.
 */
const globalStore = globalThis as unknown as {
  __geminiAuditState?: Record<string, GeminiAuditStateEntry>;
};

export const geminiAuditState: Record<string, GeminiAuditStateEntry> =
  globalStore.__geminiAuditState || (globalStore.__geminiAuditState = {});

const MAX_ENTRIES = 500;

export function setGeminiAuditEntry(id: string, entry: GeminiAuditStateEntry): void {
  // Basic size cap on geminiAuditState
  const keys = Object.keys(geminiAuditState);
  if (keys.length > MAX_ENTRIES) {
    const oldest = keys.slice(0, keys.length - MAX_ENTRIES);
    for (const k of oldest) {
      delete geminiAuditState[k];
    }
  }
  geminiAuditState[id] = { ...entry, updatedAt: new Date().toISOString() };
}

export function getGeminiAuditEntry(id: string): GeminiAuditStateEntry | undefined {
  return geminiAuditState[id];
}
