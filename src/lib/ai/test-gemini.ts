import { geminiAgent } from "./agents/gemini.agent";

import "dotenv/config";
import fs from "node:fs";

const imageBase64 = fs
    .readFileSync("test-data/field.jpg")
    .toString("base64");

async function main() {
    try {
        const result = await geminiAgent({
            actionId: "test-gemini",
            imageBase64,
            latitude: 22.6,
            longitude: 88.4,
        });

        console.log("\n======================");
        console.log("GEMINI TEST RESULT");
        console.log("======================");

        console.log(
            JSON.stringify(result, null, 2)
        );

    } catch (error) {
        console.error("❌ Gemini test failed");

        console.error(error);

        process.exit(1);
    }
}

main();