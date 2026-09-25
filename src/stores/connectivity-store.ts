/**
 * Connectivity Store
 *
 * Tracks network status using the online/offline events and the
 * Network Information API (navigator.connection) where available.
 * Components can gate expensive operations behind `isOnline` and
 * show degraded UIs when `isSlowConnection` is true.
 */

import { create } from 'zustand';

/**
 * NetworkInformation type definition.
 * The Network Information API is not yet in the standard lib types,
 * so we define the subset we use here.
 */
interface NetworkInformation extends EventTarget {
  readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
}

/** Thresholds for "slow" classification */
const SLOW_EFFECTIVE_TYPES = new Set(['slow-2g', '2g']);
const SLOW_RTT_THRESHOLD_MS = 1000;

function detectSlowConnection(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const connection = (
    navigator as unknown as { connection?: NetworkInformation }
  ).connection;

  if (!connection) return false;

  if (SLOW_EFFECTIVE_TYPES.has(connection.effectiveType)) return true;
  if (connection.rtt > SLOW_RTT_THRESHOLD_MS) return true;
  if (connection.saveData) return true;

  return false;
}

interface ConnectivityState {
  isOnline: boolean;
  isSlowConnection: boolean;
  lastOnlineAt: number | null;
}

interface ConnectivityActions {
  initialize: () => void;
  cleanup: () => void;
}

type ConnectivityStore = ConnectivityState & ConnectivityActions;

/** Stored handler references so we can remove them on cleanup. */
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;
let connectionChangeHandler: (() => void) | null = null;

export const useConnectivityStore = create<ConnectivityStore>()((set) => ({
  isOnline: true,
  isSlowConnection: false,
  lastOnlineAt: null,

  initialize: () => {
    if (typeof window === 'undefined') return;

    // Clean up any previous listeners before re-registering
    if (onlineHandler) window.removeEventListener('online', onlineHandler);
    if (offlineHandler) window.removeEventListener('offline', offlineHandler);

    onlineHandler = () => {
      set({
        isOnline: true,
        lastOnlineAt: Date.now(),
        isSlowConnection: detectSlowConnection(),
      });
    };

    offlineHandler = () => {
      set({ isOnline: false });
    };

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    // Listen for connection quality changes
    const connection = (
      navigator as unknown as { connection?: NetworkInformation }
    ).connection;

    if (connection) {
      if (connectionChangeHandler) {
        connection.removeEventListener('change', connectionChangeHandler);
      }

      connectionChangeHandler = () => {
        set({ isSlowConnection: detectSlowConnection() });
      };

      connection.addEventListener('change', connectionChangeHandler);
    }

    // Sync initial state
    set({
      isOnline: navigator.onLine,
      isSlowConnection: detectSlowConnection(),
      lastOnlineAt: navigator.onLine ? Date.now() : null,
    });
  },

  cleanup: () => {
    if (typeof window === 'undefined') return;

    if (onlineHandler) {
      window.removeEventListener('online', onlineHandler);
      onlineHandler = null;
    }

    if (offlineHandler) {
      window.removeEventListener('offline', offlineHandler);
      offlineHandler = null;
    }

    const connection = (
      navigator as unknown as { connection?: NetworkInformation }
    ).connection;

    if (connection && connectionChangeHandler) {
      connection.removeEventListener('change', connectionChangeHandler);
      connectionChangeHandler = null;
    }
  },
}));
