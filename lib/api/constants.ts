/**
 * Backend API constants
 * For frontend constants, see lib/constants.ts
 */

// AI Configuration (Cerebras z.ai-glm-4.7)
export const AI_CONFIG = {
  TEMPERATURE: 1,
  MAX_TOKENS: 10000,
  MIN_RR_RATIO: 3.0,
  MODEL: 'zai-glm-4.7',
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