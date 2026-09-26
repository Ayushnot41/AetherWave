import { schemeAgent } from "./agents/scheme.agent";

async function runTest(label: string, state: any) {
    console.log(`\n[ ${label} ]`);
    try {
        const result = await schemeAgent(state);
        console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error("❌ Error:", e.message);
    }
}

async function main() {
    console.log("======================");
    console.log("SCHEME AGENT TESTS");
    console.log("======================");

    const baseState = {
        latitude: 22.6, 
        longitude: 88.4,
        analysis: { cropStressLevel: 2 },
        climate: { temperature: 25, humidity: 50 },
        health: { level: "low" },
        livelihood: { estimatedCropLossPercent: 10, livelihoodRisk: "low" }
    };

    // 1. No Matches
    await runTest("No Matches (Normal Conditions)", baseState);

    // 2. Heatwave & Insurance Matches
    await runTest("Multiple Matches (Heatwave + High Loss)", {
        ...baseState,
        climate: { temperature: 38, humidity: 50 },
        health: { level: "high" },
        livelihood: { estimatedCropLossPercent: 45, livelihoodRisk: "high" }
    });

    // 3. All Matches Triggered (Drought + Extreme Risk)
    await runTest("All Matches Triggered", {
        ...baseState,
        analysis: { cropStressLevel: 8 },
        climate: { temperature: 40, humidity: 30 },
        health: { level: "extreme" },
        livelihood: { estimatedCropLossPercent: 65, livelihoodRisk: "extreme" }
    });

    // 4. Missing Data Validation
    await runTest("Missing Data Validation", {
        analysis: { cropStressLevel: 8 }
    });

    // 5. Invalid Location Validation
    await runTest("Invalid Location Validation", {
        ...baseState,
        latitude: "unknown", longitude: 88.4
    });
}

main();
