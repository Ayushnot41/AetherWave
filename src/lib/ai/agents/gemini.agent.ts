import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { GeminiAnalysis } from "../types/agent.types";

const geminiSchema = z.object({
    cropStressLevel: z.number().min(0).max(10),
    immediateRiskFactor: z.string(),
    recommendedMicroAction: z.string(),
    confidence: z.number().min(0).max(1),
});

export async function geminiAgent(state: any) {
    console.log("\n🧠 GEMINI AGENT STARTED");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSyPlaceholder' });

    const prompt = `
You are the crop observation component of AetherWeave.
Analyze the provided agricultural field image.
Return ONLY JSON matching the schema.
Determine:
1. Crop stress level from 0 to 10.
2. The most visible immediate risk factor.
3. One practical micro-action that a farmer could consider.
4. Your confidence from 0 to 1.
6. Do not invent observations.
7. Do not claim medical diagnosis.
8. Do not claim certainty about plant diseases.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: state.imageBase64,
                        },
                    },
                ],
            },
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    cropStressLevel: { type: "number" },
                    immediateRiskFactor: { type: "string" },
                    recommendedMicroAction: { type: "string" },
                    confidence: { type: "number" },
                },
                required: ["cropStressLevel", "immediateRiskFactor", "recommendedMicroAction", "confidence"],
            },
        },
    });

    if (!response.text) {
        throw new Error("Gemini returned empty response");
    }

    const parsed = geminiSchema.parse(JSON.parse(response.text));

    const analysis: GeminiAnalysis = parsed;

    console.log("✅ Gemini result");

    return { analysis };
}