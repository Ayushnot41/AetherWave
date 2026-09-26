import { livelihoodAgent } from "./agents/livelihood.agent";

async function runTest(label: string, cropStress: number, temp: number, humidity: number) {
    console.log(`\n[ ${label} ] - Stress: ${cropStress}/10, Temp: ${temp}°C, Hum: ${humidity}%`);
    try {
        const result = await livelihoodAgent({
            analysis: { cropStressLevel: cropStress },
            climate: { temperature: temp, humidity }
        });
        console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error("❌ Error:", e.message);
    }
}

async function main() {
    console.log("======================");
    console.log("LIVELIHOOD AGENT TESTS");
    console.log("======================");

    // 1. Low Risk, normal conditions
    await runTest("Low Risk (Normal)", 2, 25, 50);

    // 2. Moderate Risk, high stress
    await runTest("Moderate Risk", 5, 25, 50);

    // 3. High Risk, high stress + fungal conditions
    await runTest("High Risk (Fungal)", 7, 32, 85);

    // 4. Extreme Risk, severe stress + drought conditions
    await runTest("Extreme Risk (Drought)", 9, 38, 30);

    // 5. Cap at 100% test
    await runTest("Capped at 100%", 10, 40, 20);

    // 6. Missing Data Error
    console.log("\n[ Edge Case: Missing Data ]");
    try {
        await livelihoodAgent({ analysis: {} });
    } catch (e: any) {
        console.log("✅ Successfully caught error:", e.message);
    }

    // 7. Invalid Data Type Error
    console.log("\n[ Edge Case: Invalid Data Types ]");
    try {
        await livelihoodAgent({
            analysis: { cropStressLevel: "high" },
            climate: { temperature: 30, humidity: 50 }
        });
    } catch (e: any) {
        console.log("✅ Successfully caught error:", e.message);
    }
}

main();
