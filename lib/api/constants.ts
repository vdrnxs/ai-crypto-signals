/**
 * Backend API constants
 * For frontend constants, see lib/constants.ts
 */

// AI Configuration (OpenAI)
export const AI_CONFIG = {
  TEMPERATURE: 0.3,
  MAX_TOKENS: 1500,
  MIN_RR_RATIO: 3.0,
  MODEL: 'gpt-4.1',
} as const;

// ATR Multipliers for price calculation (used by AI)
export const ATR_CONFIG = {
  MULTIPLIER_SL: 1.75, // Stop Loss = ATR × 1.5
  MULTIPLIER_TP: 3.5, // Take Profit = ATR × 3.5
} as const;

// Price Validation
export const PRICE_VALIDATION = {
  PSYCHOLOGICAL_LEVELS: [1000, 5000], // Round numbers to check
  MIN_PRICE: 0, // Minimum valid price
} as const;

// API Validation
export const API_LIMITS = {
  MIN_CANDLES: 50,
  MAX_CANDLES: 500,
  DEFAULT_CANDLES: 100,
} as const;

// Supported Intervals
export const SUPPORTED_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

// Supported Symbols
// `symbol` doubles as the Hyperliquid `coin` sent to candleSnapshot - they must match exactly.
export const SUPPORTED_SYMBOLS = ['BTC', 'PAXG'] as const;

export const SYMBOL_METADATA: Record<(typeof SUPPORTED_SYMBOLS)[number], { label: string; assetLabel: string }> = {
  BTC: { label: 'Bitcoin', assetLabel: 'BTCUSD' },
  PAXG: { label: 'Gold', assetLabel: 'PAXGUSD' },
};