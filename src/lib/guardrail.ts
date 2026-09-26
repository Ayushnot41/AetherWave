/**
 * Deterministic Policy Guardrail — Phase 5
 *
 * PURE FUNCTION: No LLM calls, no network I/O, no side effects.
 * This is the zero-trust boundary. Nothing moves money without passing every rule.
 *
 * Rules (all must pass):
 *  1. Gemini confidence score > 0.85
 *  2. Local temperature >= 40°C (heatwave threshold)
 *  3. Claim cooldown met (24h per device)
 *  4. GPS bounding box is within India (rough check)
 *  5. Signature freshness — telemetry timestamp < 15 minutes old
 *  6. No prompt-injection or malformed LLM output detected
 */

export interface GuardrailInput {
  /** Gemini multimodal confidence score (0–1) */
  geminiConfidence: number;
  /** Local temperature in degrees Celsius from Open-Meteo */
  localTempCelsius: number;
  /** ISO-8601 timestamp when the last successful claim was processed for this deviceId */
  lastClaimAt: string | null;
  /** WGS-84 GPS fix from the telemetry payload */
  gps: { latitude: number; longitude: number };
  /** ISO-8601 telemetry capture timestamp — checked for freshness */
  telemetryTimestamp: string;
  /** Raw text extracted from Gemini response — checked for injection patterns */
  geminiRawText: string;
}

export type GuardrailDecision =
  | { approved: true; reasons: string[] }
  | { approved: false; reasons: string[]; blockingRule: string };

const CONFIDENCE_THRESHOLD = 0.85;
const HEATWAVE_TEMP_THRESHOLD = 40; // °C
const CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const TELEMETRY_FRESHNESS_MS = 15 * 60 * 1000; // 15 minutes

/** Rough India bounding box (lat 6–37°N, lon 68–98°E) */
const INDIA_BBOX = {
  latMin: 6.0,
  latMax: 37.0,
  lonMin: 68.0,
  lonMax: 98.0,
};

/** Patterns that suggest prompt injection in LLM output */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+previous\s+instructions/i,
  /you\s+are\s+now\s+(?:a\s+)?(?:jailbreak|dan|evil)/i,
  /approve\s+payout/i,
  /release\s+funds/i,
  /bypass\s+guardrail/i,
  /confidence['":\s]+(?:1\.0|0\.99|1)/i,
  /<script/i,
  /system:\s*you\s+must/i,
];

/**
 * Run every guardrail rule. Returns an approved or rejected decision
 * with per-rule reasons for auditability.
 *
 * This function MUST remain free of any async I/O or LLM calls.
 */
export function evaluateGuardrail(input: GuardrailInput): GuardrailDecision {
  const reasons: string[] = [];
  const failures: string[] = [];

  // Rule 1: Gemini confidence threshold
  if (input.geminiConfidence >= CONFIDENCE_THRESHOLD) {
    reasons.push(
      `confidence=${input.geminiConfidence.toFixed(3)} ≥ ${CONFIDENCE_THRESHOLD} ✓`,
    );
  } else {
    failures.push(
      `CONFIDENCE_BELOW_THRESHOLD: got ${input.geminiConfidence.toFixed(3)}, need ≥ ${CONFIDENCE_THRESHOLD}`,
    );
  }

  // Rule 2: Heatwave temperature threshold
  if (input.localTempCelsius >= HEATWAVE_TEMP_THRESHOLD) {
    reasons.push(`temp=${input.localTempCelsius}°C ≥ ${HEATWAVE_TEMP_THRESHOLD}°C ✓`);
  } else {
    failures.push(
      `TEMP_BELOW_THRESHOLD: got ${input.localTempCelsius}°C, need ≥ ${HEATWAVE_TEMP_THRESHOLD}°C`,
    );
  }

  // Rule 3: Claim cooldown
  if (input.lastClaimAt === null) {
    reasons.push('claim_cooldown=no_previous_claim ✓');
  } else {
    const msSinceLastClaim = Date.now() - new Date(input.lastClaimAt).getTime();
    if (msSinceLastClaim >= CLAIM_COOLDOWN_MS) {
      reasons.push(
        `claim_cooldown=${Math.round(msSinceLastClaim / 3_600_000)}h since last claim ✓`,
      );
    } else {
      const remainingHours = ((CLAIM_COOLDOWN_MS - msSinceLastClaim) / 3_600_000).toFixed(1);
      failures.push(`CLAIM_COOLDOWN_NOT_MET: ${remainingHours}h remaining`);
    }
  }

  // Rule 4: GPS within India bounding box
  const { latitude: lat, longitude: lon } = input.gps;
  if (
    lat >= INDIA_BBOX.latMin &&
    lat <= INDIA_BBOX.latMax &&
    lon >= INDIA_BBOX.lonMin &&
    lon <= INDIA_BBOX.lonMax
  ) {
    reasons.push(`gps=(${lat.toFixed(4)},${lon.toFixed(4)}) within India bounding box ✓`);
  } else {
    failures.push(
      `GPS_OUTSIDE_INDIA_BBOX: (${lat.toFixed(4)}, ${lon.toFixed(4)}) is outside India`,
    );
  }

  // Rule 5: Telemetry freshness
  const telemetryAge = Date.now() - new Date(input.telemetryTimestamp).getTime();
  if (telemetryAge >= 0 && telemetryAge <= TELEMETRY_FRESHNESS_MS) {
    reasons.push(`telemetry_age=${Math.round(telemetryAge / 1000)}s ≤ 900s ✓`);
  } else if (telemetryAge < 0) {
    failures.push(`TELEMETRY_FUTURE_TIMESTAMP: ${input.telemetryTimestamp} is in the future`);
  } else {
    failures.push(
      `TELEMETRY_STALE: age=${Math.round(telemetryAge / 60_000)}min, max=15min`,
    );
  }

  // Rule 6: Prompt injection detection in Gemini raw output
  const injectionDetected = INJECTION_PATTERNS.some((re) => re.test(input.geminiRawText));
  if (injectionDetected) {
    failures.push('PROMPT_INJECTION_DETECTED: Gemini output contains suspicious patterns');
  } else {
    reasons.push('prompt_injection_scan=clean ✓');
  }

  if (failures.length === 0) {
    return { approved: true, reasons };
  }

  return {
    approved: false,
    reasons: [...reasons, ...failures],
    blockingRule: failures[0] ?? 'UNKNOWN_RULE_FAILURE',
  };
}

/**
 * Unit-testable helpers exposed for testing individual rules.
 */
export const guardrailRules = {
  CONFIDENCE_THRESHOLD,
  HEATWAVE_TEMP_THRESHOLD,
  CLAIM_COOLDOWN_MS,
  TELEMETRY_FRESHNESS_MS,
  INDIA_BBOX,
  INJECTION_PATTERNS,
} as const;
