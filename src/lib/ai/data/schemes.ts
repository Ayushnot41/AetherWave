export interface LocalSchemePolicy {
    id: string;
    type: string;
    title: string;
    description: string;
    basePriority: number;
    condition: (state: any) => boolean;
}

/**
 * PROTOTYPE DATASET
 * This is a clearly labeled local policy/scheme dataset for prototype purposes.
 * These are NOT real government schemes and should not be represented as verified facts.
 */
export const PROTOTYPE_SCHEMES: LocalSchemePolicy[] = [
    {
        id: "mock-drought-relief-01",
        type: "financial_relief",
        title: "[PROTOTYPE] Emergency Drought Relief Fund",
        description: "Provides financial aid when drought poses high livelihood risk (temp >= 35C and extreme livelihood risk).",
        basePriority: 100,
        condition: (s) => s.climate.temperature >= 35 && s.livelihood.livelihoodRisk === "extreme"
    },
    {
        id: "mock-heat-health-02",
        type: "health_advisory",
        title: "[PROTOTYPE] Heatwave Health Action Plan",
        description: "Triggers community health warnings during extreme or high heat exposure.",
        basePriority: 80,
        condition: (s) => s.health.level === "extreme" || s.health.level === "high"
    },
    {
        id: "mock-crop-insurance-03",
        type: "insurance_claim",
        title: "[PROTOTYPE] Micro-Crop Insurance Trigger",
        description: "Initiates assessment for crop loss greater than 30%.",
        basePriority: 90,
        condition: (s) => s.livelihood.estimatedCropLossPercent > 30
    },
    {
        id: "mock-agri-advisory-04",
        type: "agricultural_advisory",
        title: "[PROTOTYPE] Targeted Agricultural Extension Services",
        description: "Dispatches extension workers for moderate to high crop stress.",
        basePriority: 50,
        condition: (s) => s.analysis.cropStressLevel >= 4 && s.analysis.cropStressLevel <= 8
    }
];
