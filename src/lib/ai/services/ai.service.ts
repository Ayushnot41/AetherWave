import { agentWorkflow } from "../graph/workflow";

export async function runAetherWeavePipeline(input: {
    actionId: string;
    imageBase64: string;
    latitude: number;
    longitude: number;
}) {
    console.log("\n🚀 AETHERWEAVE PIPELINE STARTED");

    const result = await agentWorkflow.invoke({
        actionId: input.actionId,

        imageBase64: input.imageBase64,

        latitude: input.latitude,

        longitude: input.longitude,

        analysis: undefined,

        climate: undefined,

        health: undefined,

        livelihood: undefined,

        schemeMatches: undefined,

        errors: [],
    });

    console.log("\n🎯 PIPELINE COMPLETED");

    return result;
}