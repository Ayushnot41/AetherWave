/**
 * Risk Store
 *
 * Fetches and manages the swarm risk-analysis result and recommended
 * action for a given intake submission. Uses the api-client's named
 * functions which handle Zod validation, retries, and offline detection.
 */

import { create } from 'zustand';
import {
  getSwarmResult as apiGetSwarmResult,
  getRecommendedAction as apiGetRecommendedAction,
} from '@/lib/api-client';
import type { SwarmResult, RecommendedAction } from '@/contracts';

type ExpandableNode = 'climate' | 'health' | 'livelihood' | null;

interface RiskState {
  swarmResult: SwarmResult | null;
  recommendedAction: RecommendedAction | null;
  isLoadingSwarm: boolean;
  isLoadingAction: boolean;
  expandedNode: ExpandableNode;
  error: string | null;
}

interface RiskActions {
  fetchSwarmResult: (intakeId: string) => Promise<void>;
  fetchRecommendedAction: (intakeId: string) => Promise<void>;
  setExpandedNode: (node: ExpandableNode) => void;
  clearRisk: () => void;
}

type RiskStore = RiskState & RiskActions;

const initialState: RiskState = {
  swarmResult: null,
  recommendedAction: null,
  isLoadingSwarm: false,
  isLoadingAction: false,
  expandedNode: null,
  error: null,
};

export const useRiskStore = create<RiskStore>()((set) => ({
  ...initialState,

  fetchSwarmResult: async (intakeId: string) => {
    set({ isLoadingSwarm: true, error: null });
    try {
      const result = await apiGetSwarmResult(intakeId);

      if (!result.ok) {
        set({ isLoadingSwarm: false, error: result.error.message });
        return;
      }

      set({ isLoadingSwarm: false, swarmResult: result.data });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch swarm result';
      set({ isLoadingSwarm: false, error: message });
    }
  },

  fetchRecommendedAction: async (intakeId: string) => {
    set({ isLoadingAction: true, error: null });
    try {
      const result = await apiGetRecommendedAction(intakeId);

      if (!result.ok) {
        set({ isLoadingAction: false, error: result.error.message });
        return;
      }

      set({ isLoadingAction: false, recommendedAction: result.data });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch recommended action';
      set({ isLoadingAction: false, error: message });
    }
  },

  setExpandedNode: (node: 'climate' | 'health' | 'livelihood' | null) => {
    set({ expandedNode: node });
  },

  clearRisk: () => {
    set({ ...initialState });
  },
}));
