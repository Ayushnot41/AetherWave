import { z } from "zod";
import type { ClimateData } from "../types/agent.types";

const openMeteoSchema = z.object({
    current: z.object({
        temperature_2m: z.number(),
        relative_humidity_2m: z.number(),
    }),
});

export async function climateAgent(state: any) {
    console.log("\n🌦️ CLIMATE AGENT STARTED");

    const { latitude, longitude } = state;

    if (latitude === undefined || longitude === undefined) {
        throw new Error("Invalid coordinates: latitude and longitude are required.");
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error("Invalid coordinates: out of valid range.");
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Open-Meteo API failed with status ${response.status}`);
        }

        const data = await response.json();
        const parsed = openMeteoSchema.parse(data);

        const climate: ClimateData = {
            temperature: parsed.current.temperature_2m,
            humidity: parsed.current.relative_humidity_2m,
        };

        console.log("✅ Climate result");
        return { climate };
    } catch (error) {
        console.error("❌ Climate API failure:", error);
        throw error;
    }
}