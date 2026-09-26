import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
    actionId: Annotation<string>(),

    imageBase64: Annotation<string>(),

    latitude: Annotation<number>(),

    longitude: Annotation<number>(),

    analysis: Annotation<any>(),

    climate: Annotation<any>(),

    health: Annotation<any>(),

    livelihood: Annotation<any>(),

    schemeMatches: Annotation<any>(),

    errors: Annotation<string[]>({
        reducer: (current: string[] = [], update: string[] = []) => [
            ...current,
            ...update,
        ],
        default: () => [],
    }),
});