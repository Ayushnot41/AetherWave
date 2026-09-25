import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** 
 * Format currency amount for display.
 * Defaults to USD for micro-grant amounts.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Truncate a Solana address for display.
 * Shows first 4 and last 4 characters.
 */
export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Check if the user prefers reduced motion.
 * Returns true if the user has set prefers-reduced-motion: reduce.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Generate a Solana Explorer URL for a transaction signature.
 */
export function solanaExplorerUrl(signature: string, cluster: 'mainnet-beta' | 'devnet' = 'devnet'): string {
  return `https://explorer.solana.com/tx/${encodeURIComponent(signature)}?cluster=${cluster}`;
}

/**
 * Safe JSON parse that returns null on failure instead of throwing.
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Delay utility for async operations.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if we're running in a secure context (HTTPS or localhost).
 * Required for camera, mic, geolocation, and Web Crypto APIs.
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext;
}
