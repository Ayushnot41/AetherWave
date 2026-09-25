import type { HealthRisk, HealthRiskLevel } from "../types/agent.types";

export interface HealthThresholds {
    extreme: number;
    high: number;
    moderate: number;
}

const DEFAULT_THRESHOLDS: HealthThresholds = {
    extreme: 41,
    high: 32,
    moderate: 27,
};

function calculateSimpleHeatIndex(temperature: number, humidity: number): number {
    // Convert Celsius to Fahrenheit
    const T = (temperature * 9) / 5 + 32;
    const R = humidity;

    // Standard NOAA Rothfusz regression
    const heatIndexF =
        -42.379 +
        2.04901523 * T +
        10.14333127 * R -
        0.22475541 * T * R -
        0.00683783 * T * T -
        0.05481717 * R * R +
        0.00122874 * T * T * R +
        0.00085282 * T * R * R -
        0.00000199 * T * T * R * R;

    // Convert back to Celsius
    return ((heatIndexF - 32) * 5) / 9;
}

export async function healthAgent(state: any, thresholds: HealthThresholds = DEFAULT_THRESHOLDS) {
    console.log("\n❤️ HEALTH AGENT STARTED");

    if (!state.climate) {
        throw new Error("Missing climate data: Health agent requires climate state.");
    }

    const { temperature, humidity } = state.climate;

    if (typeof temperature !== "number" || typeof humidity !== "number") {
        throw new Error("Invalid climate data: temperature and humidity must be numbers.");
    }

    const heatIndex = calculateSimpleHeatIndex(temperature, humidity);

    let level: HealthRiskLevel;
    let message: string;

    if (heatIndex >= thresholds.extreme) {
        level = "extreme";
        message = "Extreme environmental heat exposure. Significant risk of heat-related illness.";
    } else if (heatIndex >= thresholds.high) {
        level = "high";
        message = "High environmental heat exposure. Hydration and shade are highly recommended.";
    } else if (heatIndex >= thresholds.moderate) {
        level = "moderate";
        message = "Moderate environmental heat exposure. Monitor exertion levels.";
    } else {
        level = "low";
        message = "Low environmental heat exposure based on current conditions.";
    }

    const health: HealthRisk = {
        level,
        message,
        heatIndex,
    };

    console.log("✅ Health result");

    return { health };
}
