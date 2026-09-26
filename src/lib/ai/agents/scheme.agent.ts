import type { SchemeData, SchemeMatch } from "../types/agent.types";
import { PROTOTYPE_SCHEMES } from "../data/schemes";

export async function schemeAgent(state: any) {
    console.log("\n📋 SCHEME MATCHING AGENT STARTED");

    // 1. Validate inputs
    if (!state.analysis || !state.climate || !state.health || !state.livelihood) {
        throw new Error("Missing required inputs: Scheme agent requires analysis, climate, health, and livelihood states.");
    }

    if (typeof state.latitude !== "number" || typeof state.longitude !== "number") {
        throw new Error("Invalid location data.");
    }

    const matches: SchemeMatch[] = [];

    // 2. Deterministic matching rules using separate policy dataset
    for (const scheme of PROTOTYPE_SCHEMES) {
        try {
            if (scheme.condition(state)) {
                matches.push({
                    type: scheme.type,
                    title: scheme.title,
                    reason: `Matched based on condition: ${scheme.description}`,
                    priority: scheme.basePriority
                });
            }
        } catch (e) {
            console.warn(`⚠️ Error evaluating scheme ${scheme.id}: `, e);
        }
    }

    // 3. Sort only according to explicit matching priority rules (highest priority first)
    matches.sort((a, b) => b.priority - a.priority);

    console.log("✅ Scheme Match result");

    return { schemeMatches: matches };
}
