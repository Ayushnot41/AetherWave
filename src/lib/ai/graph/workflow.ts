import { StateGraph, START, END } from "@langchain/langgraph";

import { AgentState } from "./state";

import { geminiAgent } from "../agents/gemini.agent";
import { climateAgent } from "../agents/climate.agent";
import { healthAgent } from "../agents/health.agent";
import { livelihoodAgent } from "../agents/livelihood.agent";
import { schemeAgent } from "../agents/scheme.agent";

const workflow = new StateGraph(AgentState)
  .addNode("geminiNode", geminiAgent)
  .addNode("climateNode", climateAgent)
  .addNode("healthNode", healthAgent)
  .addNode("livelihoodNode", livelihoodAgent)
  .addNode("schemeNode", schemeAgent)
  .addEdge(START, "geminiNode")
  .addEdge("geminiNode", "climateNode")
  .addEdge("climateNode", "healthNode")
  .addEdge("healthNode", "livelihoodNode")
  .addEdge("livelihoodNode", "schemeNode")
  .addEdge("schemeNode", END);

export const agentWorkflow = workflow.compile();
