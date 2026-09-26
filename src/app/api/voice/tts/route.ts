import { NextResponse } from 'next/server';

/**
 * AetherWave // ElevenLabs Vernacular Voice API Route
 * Generates natural, sweet female voice synthesis in Hindi, Bengali, Marathi, and English
 * Default Voice: Sarah (EXAVITQu4vr4xnSDxMaL) - Gentle, sweet, soothing young woman
 * Model: eleven_multilingual_v2
 */

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Sarah (Sweet Female)
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = (body.text || '').trim();
    const voiceId = body.voiceId || DEFAULT_VOICE_ID;
    const modelId = body.modelId || DEFAULT_MODEL_ID;

    if (!text) {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY is not configured on server', fallback: true },
        { status: 503 }
      );
    }

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.78,
          style: 0.20,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs TTS API error:', response.status, errText);
      return NextResponse.json(
        { error: 'ElevenLabs synthesis failed', status: response.status, details: errText, fallback: true },
        { status: response.status }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioArrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
        'X-Voice-Provider': 'elevenlabs',
        'X-Voice-Character': 'sweet-female-hindi',
      },
    });
  } catch (error) {
    console.error('Voice TTS route error:', error);
    return NextResponse.json(
      { error: 'Internal server error during speech synthesis', fallback: true },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get('text') || '').trim();
  const voiceId = searchParams.get('voiceId') || DEFAULT_VOICE_ID;
  const modelId = searchParams.get('modelId') || DEFAULT_MODEL_ID;

  if (!text) {
    return NextResponse.json({ error: 'Text query parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ELEVENLABS_API_KEY is not configured on server', fallback: true },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.78,
          style: 0.20,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: 'ElevenLabs synthesis failed', status: response.status, details: errText, fallback: true },
        { status: response.status }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioArrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
        'X-Voice-Provider': 'elevenlabs',
        'X-Voice-Character': 'sweet-female-hindi',
      },
    });
  } catch (error) {
    console.error('Voice TTS GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error during speech synthesis', fallback: true },
      { status: 500 }
    );
  }
}
