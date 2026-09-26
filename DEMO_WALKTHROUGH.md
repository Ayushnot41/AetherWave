# AetherWeave — 3-Minute Live Hackathon Demo Walkthrough

**Tagline:** Privacy-preserving multi-agent swarm for anticipatory climate-health-livelihood resilience, with on-chain impact verification.

---

## ⏱ Demo Timeline (180 Seconds Total)

| Minute | Screen / State | Demo Action | Judge Track Alignment |
|---|---|---|---|
| **0:00 – 0:30** | `onboarding-auth` | Rural farmer signs in with phone + OTP. Selects **हिन्दी (Hindi)** dialect from high-contrast touch grid. | **GovTech / Inclusive AI** |
| **0:30 – 0:50** | `home-dashboard` | Shows live micro-climate status, 42.1°C heat index warning, and single primary CTA: **"Launch Telemetry Scan"**. Government Disaster Alert Relay shows IMD Orange alert via Server-Sent Events. | **AI Systems / Public Health** |
| **0:50 – 1:20** | `intake-capture` | Live camera viewfinder with rule-of-thirds grid, real-time GPS coordinates, gyroscope vector, and dialect voice note attachment. Client-side SHA-256 attestation. | **Cybersecurity / Hardware Telemetry** |
| **1:20 – 1:50** | `cascade-visualization` | Animated directed graph: **Climate (Heatwave)** ➔ **Health (Dehydration)** ➔ **Livelihood (Yield Loss)**. Expandable vernacular reasoning nodes from LangGraph.js swarm. | **Multi-Agent Swarm (LangGraph)** |
| **1:50 – 2:15** | `recommended-action` | Clear action card: **Ground Mulching**. Native ElevenLabs vernacular voice player gives audio instructions. **"₹500 अनुदान पात्र"** (₹500 Grant Eligible) badge. | **Vernacular AI / UX Accessibility** |
| **2:15 – 2:35** | `verification-capture` | Farmer captures photo proof of completed mulching. Hardware WebCrypto signature locks timestamp, GPS fix, and frame hash into proof payload. | **Hardware Attestation / Cybersecurity** |
| **2:35 – 2:50** | `verification-status` | 4-step vertical progress tracker: Gemini Multimodal Audit ➔ Deterministic Oracle Guardrail ➔ Solana ZK-Compressed Mint ➔ Smart Escrow Disbursal. | **Web3 / Solana Light Protocol** |
| **2:50 – 3:00** | `payout-success` | **₹500 अनुदान** disbursed via UPI to farmer's registered bank account. SMS notification via Twilio. Tappable Solana Explorer deep link showing on-chain ZK proof (sub-₹0.05 mint cost). | **Fintech / Financial Inclusion** |

---

## 🔑 Key Talking Points for Judges

### 1. Not Google Lens (Hardware Telemetry Defense)
> *"Classification is not proof. AetherWeave binds every camera frame to hardware-level GPS, gyroscope orientation, and device telemetry via WebCrypto SHA-256 attestation before any data leaves the phone. Spoofed camera rolls are cryptographically rejected."*

### 2. Not a Gemini Wrapper (Deterministic Oracle Guardrails)
> *"Gemini's multimodal evaluation is strictly advisory. A deterministic, rule-based policy engine authorises the fund release only when environmental thresholds (≥40°C heat index), GPS boundaries (within India bounding box), and cryptographic attestation are all satisfied. An LLM never unilaterally unlocks fund custody."*

### 3. Sub-₹0.05 On-Chain Verifiability (Solana ZK Compression)
> *"Using Light Protocol on Solana, minting proof of climate action costs less than ₹0.05 per farmer. Funders and international climate facilities gain real-time, audit-grade verification of physical resilience without employing expensive manual field auditors."*

### 4. Zero-Friction Vernacular Accessibility
> *"Designed for low-literacy rural environments: 64px touch targets, earth-tone palette visible in harsh sunlight (WCAG 2.1 AA), and voice-first interaction with ElevenLabs synthesized dialect instruction in Hindi, Marathi, Telugu, and 8 more Indian languages."*

---

## 📱 Offline Capability Test
1. Disconnect Wi-Fi / engage Airplane Mode.
2. Notice the instant top warning: **"Offline Mode Engaged — Displaying Cached Snapshot"**.
3. Telemetry capture and local WebCrypto signing remain functional; proofs queue in IndexedDB/cache for background synchronization upon reconnection.

---

## ⚠️ Demo-Scope Caveats (Honest & Transparent)

The following features operate in **DEMO_MODE** during the hackathon demo — this is explicitly labeled in the codebase and API responses:

| Feature | Demo Status | Production Path |
|---|---|---|
| **UPI Payout** | ₹500 transfer simulated (labeled DEMO_MODE in API response) | Requires Razorpay / PayU merchant onboarding + KYC |
| **Twilio OTP** | Demo OTP = `123456` when keys absent | Live when `TWILIO_VERIFY_SERVICE_SID` configured |
| **Solana Mint** | Real Memo-program tx on devnet when `SOLANA_FEE_PAYER_SECRET` set; labeled fixture otherwise | Light Protocol ZK-compressed token mint |
| **Satellite NDVI** | Deterministic lat/lon estimate (labeled DEMO_MODE) | Google Earth Engine REST API + ISRO MOSDAC |
| **Disaster Alerts** | Representative IMD/CWC/FAO alerts (labeled DEMO_MODE) | IMD API + NDMA RSS feed integration |
| **ElevenLabs TTS** | Text fallback returned when API key absent | Live Hindi/regional audio when key configured |

**Anti-fakery guarantee:** Every DEMO_MODE fixture is visibly labeled in API responses (`"demoMode": true`, `"isLive": false`). No fabricated Solana Explorer links. No hardcoded "success" disguised as real.
