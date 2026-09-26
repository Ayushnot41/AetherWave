import { healthAgent } from "./agents/health.agent";

async function runTest(temperature: number, humidity: number) {
    console.log(`\nTesting Temp: ${temperature}°C, Humidity: ${humidity}%`);
    try {
        const result = await healthAgent({
            climate: { temperature, humidity }
        });
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

async function main() {
    console.log("======================");
    console.log("HEALTH AGENT TESTS");
    console.log("======================");

    // Test Low
    await runTest(20, 50);

    // Test Moderate
    await runTest(28, 60);

    // Test High
    await runTest(33, 70);

    // Test Extreme
    await runTest(40, 80);

    // Test Missing Data
    console.log("\nTesting Missing Data");
    try {
        await healthAgent({});
    } catch (e: any) {
        console.log("Successfully caught error:", e.message);
    }

    // Test Invalid Data
    console.log("\nTesting Invalid Data");
    try {
        await healthAgent({ climate: { temperature: "warm", humidity: 50 } });
    } catch (e: any) {
        console.log("Successfully caught error:", e.message);
    }
}

main();
