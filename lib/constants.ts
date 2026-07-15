/**
 * Frontend-only constants
 * For backend constants, see lib/api/constants.ts
 */
import { SUPPORTED_SYMBOLS } from '@/lib/api/constants';

// Maps the URL slug used under /dashboard/signals/[symbol] to the actual trading symbol,
// so routes stay human-readable (e.g. /signals/bitcoin) instead of exposing raw tickers.
export const SYMBOL_SLUGS: Record<string, (typeof SUPPORTED_SYMBOLS)[number]> = {
  bitcoin: 'BTC',
  gold: 'PAXG',
};

export const SYMBOL_TO_SLUG: Record<(typeof SUPPORTED_SYMBOLS)[number], string> = {
  BTC: 'bitcoin',
  PAXG: 'gold',
};

// Trading Risk Management (used in UI components and calculations)
export const RISK_MANAGEMENT = {
  MIN_RISK_USD: 1, // Minimum risk in USD to consider valid
  MAX_RR_RATIO: 100, // Maximum R:R ratio before considering data invalid
  FAVORABLE_RR_THRESHOLD: 2, // Minimum R:R to be considered "favorable"
} as const;

// Timeframes gated behind the Pro plan (UI-only lock, no billing/auth wired yet)
export const PRO_ONLY_INTERVALS = ['1h', '1d'] as const;