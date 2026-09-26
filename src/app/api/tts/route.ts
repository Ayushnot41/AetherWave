/**
 * POST /api/tts
 *
 * Generates vernacular audio for recommended actions via ElevenLabs.
 * Returns structured text fallback on failure — frontend's audio-failed-show-text-fallback state.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
  dialect: z.enum(['hi-IN', 'en-IN', 'mr-IN', 'ta-IN', 'te-IN', 'kn-IN', 'bn-IN', 'gu-IN', 'pa-IN', 'ml-IN']),
  voiceId: z.string().optional(),
});

// Map dialect codes to ElevenLabs voice IDs
const VOICE_MAP: Record<string, string> = {
  'hi-IN': env.ELEVENLABS_VOICE_ID_HINDI,
  'en-IN': '21m00Tcm4TlvDq8ikWAM',
  'mr-IN': env.ELEVENLABS_VOICE_ID_HINDI, // Fallback to Hindi voice
  'ta-IN': env.ELEVENLABS_VOICE_ID_HINDI,
  'te-IN': env.ELEVENLABS_VOICE_ID_HINDI,
  'kn-IN': env.ELEVENLABS_VOICE_ID_HINDI,
  'bn-IN': env.ELEVENLABS_VOICE_ID_HINDI,
  'gu-IN': env.ELEVENLABS_VOICE_ID_HINDI,
  'pa-IN': env.ELEVENLABS_VOICE_ID_HINDI,
  'ml-IN': env.ELEVENLABS_VOICE_ID_HINDI,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid TTS request', retryable: false },
        { status: 400 },
      );
    }

    const { text, dialect, voiceId } = parsed.data;

    if (env.DEMO_MODE || !env.ELEVENLABS_API_KEY) {
      // DEMO_MODE: return text fallback immediately
      return NextResponse.json({
        success: false,
        fallback: true,
        text,
        dialect,
        reason: env.DEMO_MODE ? 'DEMO_MODE active' : 'ElevenLabs API key not configured',
      });
    }

    const selectedVoice = voiceId || VOICE_MAP[dialect] || env.ELEVENLABS_VOICE_ID_HINDI;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    try {
      const ttsRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.6, similarity_boost: 0.8 },
          }),
          signal: controller.signal,
        },
      );

      if (!ttsRes.ok) {
        throw new Error(`ElevenLabs HTTP ${ttsRes.status}`);
      }

      const audioBuffer = await ttsRes.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      return NextResponse.json({
        success: true,
        fallback: false,
        audioBase64: base64Audio,
        mimeType: 'audio/mpeg',
        dialect,
        voiceId: selectedVoice,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.error('[TTS] ElevenLabs failed — text fallback:', err);
    // Graceful degradation: always return text so UI can show fallback
    const body = await req.json().catch(() => ({})) as { text?: string; dialect?: string };
    return NextResponse.json({
      success: false,
      fallback: true,
      text: body.text ?? '',
      dialect: body.dialect ?? 'hi-IN',
      reason: err instanceof Error ? err.message : 'TTS service unavailable',
    });
  }
}
