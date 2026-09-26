import { climateAgent } from "./agents/climate.agent";

async function main() {
    try {
        const result = await climateAgent({
            latitude: 22.6,
            longitude: 88.4,
        });

        console.log("\n======================");
        console.log("CLIMATE TEST RESULT");
        console.log("======================");

        console.log(
            JSON.stringify(result, null, 2)
        );

    } catch (error) {
        console.error("❌ Climate test failed");
        console.error(error);
        process.exit(1);
    }
}

main();