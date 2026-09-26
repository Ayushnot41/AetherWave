export interface Location {
    latitude: number;
    longitude: number;
}

export interface GeminiAnalysis {
    cropStressLevel: number;
    immediateRiskFactor: string;
    recommendedMicroAction: string;
    confidence: number;
}

export interface ClimateData {
    temperature: number;
    humidity: number;
    precipitation?: number;
    windSpeed?: number;
    uvIndex?: number;
    forecast?: any;
}

export type HealthRiskLevel =
    | "low"
    | "moderate"
    | "high"
    | "extreme";

export interface HealthRisk {
    level: HealthRiskLevel;
    message: string;
    heatIndex?: number;
}

export type LivelihoodRiskLevel =
    | "low"
    | "moderate"
    | "high"
    | "extreme";

export interface LivelihoodData {
    estimatedCropLossPercent: number;
    livelihoodRisk: LivelihoodRiskLevel;
    reason: string;
}

export interface SchemeMatch {
    type: string;
    title: string;
    reason: string;
    priority: number;
}

export interface SchemeData {
    matches: SchemeMatch[];
}

export interface AgentState {
    actionId: string;

    imageBase64: string;

    location: Location;

    analysis?: GeminiAnalysis;

    climate?: ClimateData;

    health?: HealthRisk;

    livelihood?: any;

    scheme?: any;

    errors: string[];
}