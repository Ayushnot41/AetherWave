import { GoogleGenAI } from '@google/genai';
import { GeminiAuditResultSchema, type GeminiAuditResult } from '@/contracts';

export class GeminiAuditParseError extends Error {
  readonly rawText: string;

  constructor(message: string, rawText: string) {
    super(message);
    this.name = 'GeminiAuditParseError';
    this.rawText = rawText;
  }
}

export class GeminiAuditRequestError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = 'GeminiAuditRequestError';
    this.retryable = retryable;
  }
}

function isTransientError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const errorStr = String(err).toLowerCase();
    const status =
      (err as { status?: number; statusCode?: number }).status ||
      (err as { statusCode?: number }).statusCode;

    if (typeof status === 'number') {
      if (status === 429 || (status >= 500 && status < 600)) return true;
      if (status === 401 || status === 403 || status === 400) return false;
    }

    if (
      errorStr.includes('rate limit') ||
      errorStr.includes('quota') ||
      errorStr.includes('429') ||
      errorStr.includes('503') ||
      errorStr.includes('500') ||
      errorStr.includes('timeout') ||
      errorStr.includes('econnreset') ||
      errorStr.includes('etimedout')
    ) {
      return true;
    }
  }
  return false;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiAuditRequestError(
      'GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in your environment.',
      false,
    );
  }
  return new GoogleGenAI({ apiKey });
}

function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    const raw = (err as { message: string }).message;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    } catch {
      // not JSON
    }
    return raw;
  }
  return err instanceof Error ? err.message : String(err);
}

const PROMPT = `You are an institutional agricultural audit vision model.
Context: This photograph was submitted by a smallholder farmer in India as proof of a preventative climate-resilience action (such as root-zone biomass mulching, crop canopy shade netting, or irrigation retention).

Analyze the submitted image and output ONLY a raw JSON object with this exact shape:
{
  "isCropImage": boolean,
  "cropStressLevel": number,
  "immediateRiskFactor": "string",
  "recommendedMicroAction": "string",
  "confidence": number
}

Rules:
1. isCropImage: Set to true if the image clearly depicts crops, field vegetation, soil beds, mulching, or farm conditions. Set to false if the image does not clearly show agricultural or crop content (e.g. human face, indoor room, laptop screen, generic object).
2. cropStressLevel: An integer or float from 0 to 10 where 0 represents healthy crop conditions and 10 represents total crop failure or severe desiccation. If not a crop image, set to 0.
3. immediateRiskFactor: Exactly one concise sentence naming the dominant visible risk (e.g., "Severe soil moisture depletion and heat-induced leaf curling visible on vegetative canopy."). If not a crop image, state "Submitted photo does not appear to show crop or field content."
4. recommendedMicroAction: Exactly one concise sentence prescribing a low-cost, concrete physical intervention (e.g., "Apply a 3-inch layer of organic dry straw mulch across root zone beds."). If not a crop image, state "Please capture a clear photo of your field or crops."
5. confidence: A number between 0.0 and 1.0 indicating your confidence in the assessment. Use a low confidence (< 0.5) if the image is ambiguous or not clearly agricultural.
6. Output raw JSON ONLY. No markdown code blocks, no backticks, no explanatory prose before or after.`;

/**
 * Audits a crop canopy photograph via Gemini Vision.
 * Server-side only — never call from client components.
 */
export async function auditCropImage(base64Jpeg: string): Promise<GeminiAuditResult> {
  const client = getGeminiClient();

  const callModel = async () => {
    return await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Jpeg,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: PROMPT,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });
  };

  let response;
  try {
    response = await callModel();
  } catch (err: unknown) {
    if (isTransientError(err)) {
      // Retry once after ~1.5s delay
      await new Promise((r) => setTimeout(r, 1500));
      try {
        response = await callModel();
      } catch (retryErr: unknown) {
        const msg = extractErrorMessage(retryErr);
        throw new GeminiAuditRequestError(msg, true);
      }
    } else {
      const msg = extractErrorMessage(err);
      throw new GeminiAuditRequestError(msg, true);
    }
  }

  const rawText = response.text || '';
  const cleaned = cleanJsonText(rawText);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (parseErr: unknown) {
    throw new GeminiAuditParseError(
      `Failed to parse Gemini response as JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
      rawText,
    );
  }

  const validated = GeminiAuditResultSchema.safeParse(parsedJson);
  if (!validated.success) {
    throw new GeminiAuditParseError(
      `Gemini response failed contract validation: ${validated.error.issues.map((i) => i.message).join('; ')}`,
      rawText,
    );
  }

  return validated.data;
}
