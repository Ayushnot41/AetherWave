/**
 * Unit tests for store idempotency — Phase 7
 *
 * Verifies that duplicate payout attempts never result in double-pay.
 * Run: npx tsx src/__tests__/idempotency.test.ts
 */

import {
  createPayout,
  getPayoutByIdempotencyKey,
  setDeviceCooldown,
  getDeviceCooldown,
  type PayoutRecord,
} from '../lib/store.ts';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null) throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
    },
    not: {
      toBeNull() {
        if (actual === null) throw new Error('Expected non-null value');
      },
    },
  };
}

console.log('\n💰 AetherWave Escrow Idempotency — Unit Tests\n');

console.log('Suite 1: Payout Idempotency');

const verificationId = `test-verif-${Date.now()}`;
const payoutRecord: PayoutRecord = {
  idempotencyKey: verificationId,
  verificationId,
  deviceId: 'test-device-001',
  amountInr: 500, // Always ₹500
  transactionSignature: 'DEMO_SIG_001',
  explorerUrl: 'https://explorer.solana.com/tx/DEMO_SIG_001?cluster=devnet',
  paymentMethod: 'upi',
  isLive: false,
  createdAt: new Date().toISOString(),
};

test('payout can be created once', () => {
  createPayout(payoutRecord);
  const retrieved = getPayoutByIdempotencyKey(verificationId);
  expect(retrieved?.verificationId).toBe(verificationId);
});

test('duplicate payout creation is silently ignored (no double-pay)', () => {
  const duplicateRecord: PayoutRecord = {
    ...payoutRecord,
    transactionSignature: 'DUPLICATE_SIG_SHOULD_NOT_SAVE',
    createdAt: new Date(Date.now() + 1000).toISOString(),
  };

  // Should not throw, should not overwrite
  createPayout(duplicateRecord);

  const retrieved = getPayoutByIdempotencyKey(verificationId);
  expect(retrieved?.transactionSignature).toBe('DEMO_SIG_001'); // Original signature preserved
});

test('amount is always ₹500 (never 0, never USD amount)', () => {
  const retrieved = getPayoutByIdempotencyKey(verificationId);
  if (!retrieved) throw new Error('Payout not found');
  if (retrieved.amountInr !== 500) {
    throw new Error(`Expected ₹500, got ₹${retrieved.amountInr}`);
  }
  if ((retrieved.amountInr as number) === 5 || (retrieved.amountInr as number) === 500.00 * 0.012) {
    throw new Error('Amount appears to be in USD — must be INR ₹500');
  }
});

test('different verification IDs get separate payout records', () => {
  const secondId = `test-verif-second-${Date.now()}`;
  const secondPayout: PayoutRecord = {
    ...payoutRecord,
    idempotencyKey: secondId,
    verificationId: secondId,
    transactionSignature: 'DEMO_SIG_002',
  };

  createPayout(secondPayout);

  const first = getPayoutByIdempotencyKey(verificationId);
  const second = getPayoutByIdempotencyKey(secondId);

  expect(first?.transactionSignature).toBe('DEMO_SIG_001');
  expect(second?.transactionSignature).toBe('DEMO_SIG_002');
});

console.log('\nSuite 2: Device Cooldown Idempotency');

const deviceId = `test-device-${Date.now()}`;

test('device has no cooldown initially', () => {
  const cooldown = getDeviceCooldown(deviceId);
  expect(cooldown).toBeNull();
});

test('cooldown is set after first claim', () => {
  const now = new Date().toISOString();
  setDeviceCooldown(deviceId, now);
  const cooldown = getDeviceCooldown(deviceId);
  expect(cooldown).not.toBeNull();
  if (!cooldown) throw new Error('Cooldown not set');
  expect(cooldown.lastClaimAt).toBe(now);
});

test('cooldown can be updated (renewal after 24h)', () => {
  const updated = new Date(Date.now() + 25 * 3600_000).toISOString();
  setDeviceCooldown(deviceId, updated);
  const cooldown = getDeviceCooldown(deviceId);
  if (!cooldown) throw new Error('Cooldown not found');
  expect(cooldown.lastClaimAt).toBe(updated);
});

console.log('\nSuite 3: Concurrent Duplicate Simulation');

test('simulated concurrent duplicate payouts both resolve to same record', () => {
  const concurrentId = `concurrent-test-${Date.now()}`;
  const basePayout: PayoutRecord = {
    idempotencyKey: concurrentId,
    verificationId: concurrentId,
    deviceId: 'concurrent-device',
    amountInr: 500,
    transactionSignature: 'CONCURRENT_SIG_FIRST',
    explorerUrl: 'https://explorer.solana.com/tx/CONCURRENT_SIG_FIRST?cluster=devnet',
    paymentMethod: 'upi',
    isLive: false,
    createdAt: new Date().toISOString(),
  };

  // Simulate concurrent calls
  createPayout(basePayout);
  createPayout({ ...basePayout, transactionSignature: 'CONCURRENT_SIG_SECOND' });
  createPayout({ ...basePayout, transactionSignature: 'CONCURRENT_SIG_THIRD' });

  const result = getPayoutByIdempotencyKey(concurrentId);
  if (!result) throw new Error('Payout record missing');

  // First write wins — subsequent ignored
  if (result.transactionSignature !== 'CONCURRENT_SIG_FIRST') {
    throw new Error(
      `DOUBLE-PAY RISK: Expected CONCURRENT_SIG_FIRST but got ${result.transactionSignature}`,
    );
  }
});

// ── Results ───────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

if (failed > 0) {
  console.error('\n❌ IDEMPOTENCY TESTS FAILED — DOUBLE-PAY RISK — DO NOT DEPLOY');
  process.exit(1);
} else {
  console.log('\n✅ All idempotency tests passed — escrow is replay-safe');
  process.exit(0);
}
