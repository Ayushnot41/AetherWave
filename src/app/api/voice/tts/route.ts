import { NextResponse } from 'next/server';

/**
 * AetherWave // ElevenLabs Vernacular Voice API Route
 * Generates natural, sweet female voice synthesis in Hindi, Bengali, Marathi, and English
 * Default Voice: Sarah (EXAVITQu4vr4xnSDxMaL) - Gentle, sweet, soothing young woman
 * Model: eleven_multilingual_v2
 * 
 * Includes 6000ms AbortController timeout and graceful fallback to ensure zero 500 errors.
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
        { fallback: true, mode: 'webspeech', info: 'ELEVENLABS_API_KEY not set on server' },
        { status: 200 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Call ElevenLabs Text-to-Speech API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        signal: controller.signal,
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
      clearTimeout(timeoutId);

      if (response.ok) {
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
      }

      console.warn('ElevenLabs API returned non-200:', response.status);
    } catch (netErr) {
      console.warn('ElevenLabs connection timeout or network issue:', netErr);
    }

    // Graceful fallback to client-side Web Speech synthesis (Sweet Female Hindi)
    return NextResponse.json({
      fallback: true,
      mode: 'webspeech',
      character: 'sweet-female-hindi',
      pitch: 1.1,
      rate: 0.95,
      text,
    }, { status: 200 });

  } catch (error) {
    console.error('Voice TTS route error:', error);
    return NextResponse.json({
      fallback: true,
      mode: 'webspeech',
      message: 'Fallback triggered',
    }, { status: 200 });
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
      { fallback: true, mode: 'webspeech', info: 'ELEVENLABS_API_KEY not configured on server' },
      { status: 200 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      signal: controller.signal,
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
    clearTimeout(timeoutId);

    if (response.ok) {
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
    }
  } catch (error) {
    console.warn('Voice TTS GET timeout or network issue:', error);
  }

  return NextResponse.json({
    fallback: true,
    mode: 'webspeech',
    character: 'sweet-female-hindi',
    pitch: 1.1,
    rate: 0.95,
    text,
  }, { status: 200 });
}
