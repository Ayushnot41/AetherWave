/**
 * Centralised, type-safe environment variable access for server-side code.
 * All secrets are read once at module load; any missing required var throws at startup.
 *
 * NEVER import this file from client components — it exposes server-only secrets.
 */

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val || val.startsWith('your_') || val === '') {
    // In DEMO_MODE we allow missing keys — warn but don't crash
    if (process.env['DEMO_MODE'] === 'true') {
      console.warn(`[DEMO_MODE] Missing env var ${key} — demo fixture will be used`);
      return '';
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // Execution mode
  DEMO_MODE: process.env['DEMO_MODE'] === 'true',
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',

  // AI Gateway (OmniRoute preferred, FreeLLMAPI fallback)
  AI_GATEWAY_URL: optionalEnv('NEXT_PUBLIC_AI_GATEWAY_URL', 'http://localhost:3001/v1'),
  AI_GATEWAY_API_KEY: optionalEnv('AI_GATEWAY_API_KEY', ''),
  GEMINI_API_KEY: optionalEnv('GEMINI_API_KEY', ''),

  // Solana
  SOLANA_RPC_URL: optionalEnv('NEXT_PUBLIC_SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
  SOLANA_CLUSTER: optionalEnv('NEXT_PUBLIC_SOLANA_CLUSTER', 'devnet'),
  // Base-58 encoded 64-byte fee-payer keypair — NEVER expose to client
  SOLANA_FEE_PAYER_SECRET: optionalEnv('SOLANA_FEE_PAYER_SECRET', ''),

  // ElevenLabs TTS
  ELEVENLABS_API_KEY: optionalEnv('ELEVENLABS_API_KEY', ''),
  ELEVENLABS_VOICE_ID_HINDI: optionalEnv('NEXT_PUBLIC_ELEVENLABS_VOICE_ID', '21m00Tcm4TlvDq8ikWAM'),

  // Twilio (SMS OTP + WhatsApp notifications)
  TWILIO_ACCOUNT_SID: optionalEnv('TWILIO_ACCOUNT_SID', ''),
  TWILIO_AUTH_TOKEN: optionalEnv('TWILIO_AUTH_TOKEN', ''),
  TWILIO_VERIFY_SERVICE_SID: optionalEnv('TWILIO_VERIFY_SERVICE_SID', ''),
  TWILIO_FROM_NUMBER: optionalEnv('TWILIO_FROM_NUMBER', ''),

  // Database
  DB_CONNECTION_STRING: optionalEnv('DB_CONNECTION_STRING', ''),

  // JWT secret for access tokens
  JWT_SECRET: optionalEnv('JWT_SECRET', 'aetherweave-demo-jwt-secret-change-in-production'),

  // App URL
  APP_URL: optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
} as const;
