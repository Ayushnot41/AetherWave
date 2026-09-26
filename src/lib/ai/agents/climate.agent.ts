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
        const temp = data?.current?.temperature_2m ?? 32;
        const hum = data?.current?.relative_humidity_2m ?? data?.current?.relativehumidity_2m ?? 55;

        const climate: ClimateData = {
            temperature: temp,
            humidity: hum,
        };

        console.log("✅ Climate result");
        return { climate };
    } catch (error) {
        console.warn("⚠️ Climate API fallback used:", error);
        return {
            climate: {
                temperature: 32.5,
                humidity: 58.0,
            }
        };
    }
}