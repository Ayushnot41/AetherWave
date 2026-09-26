/**
 * AetherWave — Backend Architecture Summary
 * 
 * This document records every non-obvious design decision made during the
 * Phase 0–11 backend build. Intended audience: judges, reviewers, and the team.
 */

# AetherWave Backend — Architecture Decisions & Phase Summary

## Phase 0: Repo Audit Fixes & Environment Scaffolding

### Fixes Applied
1. **`.env.example`** — Expanded from 4 vars to 13 vars. `DEMO_MODE=true` default means
   `cp .env.example .env.local && npm run dev` works with zero API keys.
2. **`DEMO_WALKTHROUGH.md`** — All USD amounts replaced with INR (₹500, sub-₹0.05).
   Added honest Demo-Scope Caveats table. Payout description corrected to UPI bank transfer.
3. **No PostgreSQL in hackathon scope** — `src/lib/store.ts` provides a drop-in in-memory
   store that has the exact same call interface as a real pg client would. Swap each function
   body with a SQL query and the behavior is identical.

---

## Phase 1: Auth & Security Perimeter

### OTP Flow Design
- Twilio Verify service is the production OTP backend. When `TWILIO_ACCOUNT_SID` is absent,
  DEMO_MODE OTP = `123456` (explicitly logged, never silently accepted in production).
- JWT tokens use `jose` (edge-runtime compatible) with HS256 + 4h expiry.
- Rate limiting: 1 OTP request per phone per 30 seconds (in-memory Map — sufficient for demo).

---

## Phase 2: Multimodal Triage

### OmniRoute vs. Direct Gemini
Per the directive's `llm_gateway.verification_task` clause:
- Text-only swarm agents → OmniRoute (`NEXT_PUBLIC_AI_GATEWAY_URL`)
- Multimodal image calls → same OmniRoute endpoint using OpenAI-compatible `image_url` type
- If OmniRoute strips image content, `confidence` in the response will be lower than ~0.85,
  causing the guardrail to block payout (correct behavior — never silently degrade to approval)
- Audio transcription falls back to a text note injected into the context prompt

---

## Phase 3: Weather & Advisory Intelligence

### Heat Index Formula
Uses the **NOAA Rothfusz regression** (not an LLM guess). Includes official adjustments for
low-humidity and high-humidity edge cases. Formula in `src/lib/weather.ts`.

### Mandi Prices (`/api/market/prices`)
The existing route already has a comprehensive mandi price database with 20+ crops and 30+ cities.
It falls back gracefully to representative data with `isLive: false` clearly set.

---

## Phase 4: Agent Swarm

### LangGraph.js → Sequential DAG
Instead of the full LangGraph.js library (adds 15MB+ to bundle), the swarm is implemented as
a typed sequential async DAG where each agent is a structured Gemini call. This keeps everything
in the same Node runtime, avoids a second language/service, and is functionally equivalent for
a 3-agent cascade.

The Climate agent output is passed as context to Health, and Climate+Health to Livelihood.
This is the cascade dependency the UI visualizes.

---

## Phase 5: Deterministic Policy Guardrail

### Design Principles
- **Pure function** — `evaluateGuardrail()` has no I/O, no async, no LLM calls
- **Injection-resistant** — 6 regex patterns detect and block prompt injection in Gemini output
- **All rules must pass** — no partial approval, no weighted scoring
- **Audit trail** — every rule result appended to `reasons[]` for database logging

### Rules
| Rule | Threshold |
|---|---|
| Gemini confidence | ≥ 0.85 |
| Local temperature | ≥ 40°C |
| Claim cooldown | 24 hours since last successful claim |
| GPS bounding box | Within India (6–37°N, 68–98°E) |
| Telemetry freshness | ≤ 15 minutes old |
| Prompt injection scan | No suspicious patterns in Gemini raw text |

---

## Phase 6: Solana ZK-Proof Minting

### Real vs. Demo Mint
- `SOLANA_FEE_PAYER_SECRET` present → Real Memo-program transaction on devnet
- Key absent or `DEMO_MODE=true` → DEMO_MODE fixture (`isLive: false` in response)
- **Anti-fakery**: `isLive: false` is always set on demo signatures. Explorer URL is formatted
  with the DEMO_ prefix so it cannot be clicked to a real tx.
- **No @lightprotocol packages** — Light Protocol ZK-compression is the production target.
  For hackathon scope, Memo program tx demonstrates real on-chain write at <₹0.05 cost.

---

## Phase 7: Escrow & UPI Payout

### Idempotency Implementation
- **Idempotency key** = `verificationId` (one payout per verification, enforced in store)
- First-write-wins: duplicate `createPayout()` calls are logged and ignored, never overwrite
- Device cooldown: 24h cooldown stored per `deviceId` after successful payout
- UPI integration: `DEMO_MODE` — payout is simulated with honest label and note explaining
  what real PSP onboarding requires

### Amount Invariant
₹500 is hardcoded as `500` (INR) in every code path. No USD amounts anywhere.

---

## Phase 8: Vernacular TTS

- ElevenLabs Multilingual v2 model
- All 10 Indian dialect codes mapped to voice IDs (fallback to Hindi voice for regional dialects)
- **Graceful degradation**: any ElevenLabs failure returns `{ success: false, fallback: true, text }` 
  so the UI always has content to show — never a broken state

---

## Phase 9: Government Disaster Alert Relay

### SSE vs. WebSockets
Raw WebSockets are not supported on Vercel serverless functions (no persistent connection).
Server-Sent Events (SSE) achieve the same real-time push with standard HTTP and full Vercel
compatibility. The README should note this substitution (see `realtime_for_disaster_alerts`).

### Alert Data
Representative sample alerts from IMD, CWC, and FAO labeled `"demoMode": true` in all responses.
Real integration would consume IMD's API, NDMA RSS feed, and INCOIS alerts.

---

## Phase 10: Resilience & Demo-Readiness

- `DEMO_MODE=true` (default) makes every endpoint return a fixture response
- Fixtures are injected at the `lib/` layer, not the route layer, so they're consistent
- Every external call (Open-Meteo, Gemini, ElevenLabs, Twilio, Solana RPC) has:
  - 10–25 second timeout via AbortController
  - Caught exception → DEMO_MODE fallback (never unhandled rejection)
  - `isLive: boolean` in response to distinguish fixture from live data

---

## Quality Gates Status

| Gate | Status |
|---|---|
| repo_audit_findings fixed | ✅ .env.example expanded, DEMO_WALKTHROUGH.md INR-corrected |
| Money paths idempotent | ✅ payouts.idempotencyKey, first-write-wins |
| LLM not trusted for auth | ✅ Guardrail is pure function, adversarial tests included |
| Keys in env vars only | ✅ src/lib/env.ts, never in client bundle |
| API contract matches frontend | ✅ Verified against src/contracts/api.ts |
| INR-consistent everywhere | ✅ ₹500 in all routes, DEMO_WALKTHROUGH.md fixed |
| No fabricated Solana sigs | ✅ isLive=false always set on demo signatures |
| tsc --noEmit clean | Run: npm run typecheck |
| Test coverage: guardrail | ✅ 20+ tests in src/__tests__/guardrail.test.ts |
| Test coverage: idempotency | ✅ 8 tests in src/__tests__/idempotency.test.ts |
| DEMO_MODE offline fallback | ✅ Every endpoint works with no network |
