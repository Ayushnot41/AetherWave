import type { LivelihoodData, LivelihoodRiskLevel, GeminiAnalysis, ClimateData } from "../types/agent.types";

/**
 * Calculates a deterministic livelihood risk score based on
 * - crop stress from Gemini Vision (0-10)
 * - climate extremes (temperature & humidity)
 * 
 * Logic:
 * Base crop loss equals cropStressLevel * 5 (e.g. 5 stress = 25% loss).
 * Heat stress multiplier: If temp > 35C and humidity < 40%, add 15% due to drought risk.
 * If temp > 30C and humidity > 80%, add 10% due to fungal risk.
 * 
 * Output maxes at 100%.
 */
function calculateCropLoss(analysis: GeminiAnalysis, climate: ClimateData): number {
    let lossPercent = analysis.cropStressLevel * 5;

    // Drought/Extreme Heat stress
    if (climate.temperature >= 35 && climate.humidity <= 40) {
        lossPercent += 15;
    } 
    // Fungal/Humid Heat stress
    else if (climate.temperature >= 30 && climate.humidity >= 80) {
        lossPercent += 10;
    }

    // Ensure it doesn't exceed 100% or drop below 0%
    return Math.max(0, Math.min(100, lossPercent));
}

export async function livelihoodAgent(state: any) {
    console.log("\n💰 LIVELIHOOD AGENT STARTED");

    const analysis: GeminiAnalysis = state.analysis || {
        cropStressLevel: 4,
        immediateRiskFactor: "Ambient heat stress and soil moisture depletion.",
        recommendedMicroAction: "Apply vegetative soil cover and schedule morning irrigation.",
        confidence: 0.88,
    };
    const climate: ClimateData = state.climate || {
        temperature: 32.0,
        humidity: 55.0,
    };

    const estimatedCropLossPercent = calculateCropLoss(analysis, climate);

    let livelihoodRisk: LivelihoodRiskLevel;
    let reason: string;

    if (estimatedCropLossPercent >= 60) {
        livelihoodRisk = "extreme";
        reason = `Estimated crop loss is ${estimatedCropLossPercent}%, presenting an extreme economic risk to the farmer's livelihood.`;
    } else if (estimatedCropLossPercent >= 40) {
        livelihoodRisk = "high";
        reason = `Estimated crop loss is ${estimatedCropLossPercent}%, indicating high potential for income disruption.`;
    } else if (estimatedCropLossPercent >= 20) {
        livelihoodRisk = "moderate";
        reason = `Estimated crop loss is ${estimatedCropLossPercent}%, suggesting moderate livelihood impact.`;
    } else {
        livelihoodRisk = "low";
        reason = `Estimated crop loss is ${estimatedCropLossPercent}%, keeping livelihood risks manageable.`;
    }

    const livelihood: LivelihoodData = {
        estimatedCropLossPercent,
        livelihoodRisk,
        reason,
    };

    console.log("✅ Livelihood result");

    return { livelihood };
}
