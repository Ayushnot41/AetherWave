# AetherWeave AI Subsystem Architecture

## 1. Overview
The AetherWeave AI subsystem is a modular, multi-agent pipeline designed to assess agricultural risk, environmental hazards, and farmer livelihood impact from simple field data. 

Instead of relying on a single, monolithic "black box" AI, the system uses **LangGraph** to orchestrate a sequence of 5 independent, highly specialized agents. This ensures that every calculation is transparent, testable, and strictly constrained to prevent hallucinations or false medical claims.

---

## 2. The Execution Pipeline (LangGraph)
The pipeline is a directed graph where the shared state is passed from one agent to the next. The orchestration sequence is strictly linear:

`START` ➔ **1. Gemini Vision** ➔ **2. Climate** ➔ **3. Health** ➔ **4. Livelihood** ➔ **5. Scheme Matching** ➔ `END`

### The Shared State (AgentState)
As the pipeline executes, the state accumulates data. By the time it reaches the end, the final API JSON object contains:
*   `actionId`, `latitude`, `longitude` (Initial Triggers)
*   `analysis` (From Gemini)
*   `climate` (From Climate)
*   `health` (From Health)
*   `livelihood` (From Livelihood)
*   `schemeMatches` (From Scheme Matching)

---

## 3. The 5 Models (Agents) in Detail

### Model 1: Gemini Vision Agent (`gemini.agent.ts`)
*   **Purpose:** Analyzes photos of the farmer's field/crops to determine physical stress.
*   **Inputs:** `imageBase64` (photo of the crop)
*   **Outputs:** 
    *   `cropStressLevel` (Number 0-10)
    *   `immediateRiskFactor` (String description)
    *   `recommendedMicroAction` (String recommendation)
    *   `confidence` (Number 0-1)
*   **How it Works:** It uses Google's `gemini-2.5-flash` model with a highly constrained prompt. It is strictly forbidden from inventing observations or making definitive disease diagnoses. It simply identifies visible stress (e.g., "yellowing leaves", "dry soil") and outputs structured JSON via Zod schema validation.

### Model 2: Climate Agent (`climate.agent.ts`)
*   **Purpose:** Fetches real-time environmental data for the farmer's location.
*   **Inputs:** `latitude`, `longitude`
*   **Outputs:**
    *   `temperature` (Celsius)
    *   `humidity` (Percentage)
*   **How it Works:** It makes an HTTP request to the Open-Meteo API using the provided coordinates. If the API fails, it catches the error gracefully. It is designed to be easily extensible for precipitation, UV index, or wind speed in the future.

### Model 3: Health Risk Agent (`health.agent.ts`)
*   **Purpose:** Calculates the environmental heat-exposure risk to the farmer working in the field.
*   **Inputs:** `temperature`, `humidity` (From the Climate Agent)
*   **Outputs:**
    *   `level` ("low" | "moderate" | "high" | "extreme")
    *   `heatIndex` (Calculated metric)
    *   `message` (Safety recommendation)
*   **How it Works:** It uses the deterministic NOAA Rothfusz regression equation to calculate the actual Heat Index (how hot it "feels"). Based on configurable thresholds (e.g., > 41°C is extreme), it categorizes the risk. It explicitly avoids making human medical or clinical diagnoses.

### Model 4: Livelihood Agent (`livelihood.agent.ts`)
*   **Purpose:** Estimates the potential economic crop loss and the resulting risk to the farmer's livelihood.
*   **Inputs:** 
    *   `cropStressLevel` (From Gemini)
    *   `temperature`, `humidity` (From Climate)
*   **Outputs:**
    *   `estimatedCropLossPercent` (0-100%)
    *   `livelihoodRisk` ("low" | "moderate" | "high" | "extreme")
    *   `reason` (String explanation)
*   **How it Works:** It uses a transparent, mathematical scoring logic. It takes a base loss percentage derived from Gemini's stress level (stress * 5). It then applies climate penalties: adding 15% for drought conditions (High Temp / Low Humidity) or 10% for fungal conditions (High Temp / High Humidity). It caps the result at 100% and categorizes the livelihood threat. *Note: This is currently deterministic math, making it easy to replace with a trained ML forecast model in the future.*

### Model 5: Scheme Matching Agent (`scheme.agent.ts`)
*   **Purpose:** Matches the farmer's current situation against a database of available government or local relief schemes.
*   **Inputs:** `analysis`, `climate`, `health`, `livelihood`, `latitude`, `longitude` (The entire accumulated state)
*   **Outputs:**
    *   `schemeMatches` (Array of matched policies, sorted by priority)
*   **How it Works:** It cross-references the accumulated state against a separate dataset of policies (`src/data/schemes.ts`). Every policy has a strict boolean `condition` (e.g., "Trigger if crop loss > 30%"). The agent evaluates all conditions, collects every matched policy, and sorts them by their predefined `basePriority`. 

---

## 4. Key Design Principles

1.  **Strict Isolation:** The AI subsystem has absolutely zero dependency on Blockchain, Solana, or the Frontend UI. It is an encapsulated service.
2.  **No Hallucinations:** By delegating math, logic, and policy matching to deterministic TypeScript functions (Models 2, 3, 4, 5), we eliminate the risk of the LLM (Model 1) hallucinating numbers or faking government schemes.
3.  **Future-Proof:** Because the agents are orchestrated as independent LangGraph nodes, a team member can easily swap out the deterministic Livelihood Agent for a PyTorch/TensorFlow ML model endpoint in the future without breaking the pipeline.
