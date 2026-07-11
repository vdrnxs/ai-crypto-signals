// Metadata for technical indicator KPIs shown on the signal card.
// All indicators are always calculated and stored server-side (lib/api/indicators.ts) —
// this only controls which KPI tiles are rendered client-side, and which ones
// require the Pro plan to be shown (cosmetic gating, no backend enforcement yet).

export const INDICATOR_KEYS = [
  'sma21',
  'sma50',
  'ema21',
  'psar',
  'rsi14',
  'rsi21',
  'macd',
  'stoch',
  'bollinger',
  'atr',
] as const;

export type IndicatorKey = (typeof INDICATOR_KEYS)[number];

interface IndicatorMeta {
  key: IndicatorKey;
  label: string;
  group: 'Tendencia' | 'Momentum' | 'Volatilidad';
  pro: boolean;
}

export const INDICATOR_METADATA: Record<IndicatorKey, IndicatorMeta> = {
  sma21: { key: 'sma21', label: 'SMA 21', group: 'Tendencia', pro: false },
  sma50: { key: 'sma50', label: 'SMA 50', group: 'Tendencia', pro: false },
  ema21: { key: 'ema21', label: 'EMA 21', group: 'Tendencia', pro: true },
  psar: { key: 'psar', label: 'PSAR', group: 'Tendencia', pro: true },
  rsi14: { key: 'rsi14', label: 'RSI 14', group: 'Momentum', pro: false },
  rsi21: { key: 'rsi21', label: 'RSI 21', group: 'Momentum', pro: true },
  macd: { key: 'macd', label: 'MACD Hist', group: 'Momentum', pro: true },
  stoch: { key: 'stoch', label: 'Stoch %K', group: 'Momentum', pro: true },
  bollinger: { key: 'bollinger', label: 'Bollinger', group: 'Volatilidad', pro: true },
  atr: { key: 'atr', label: 'ATR', group: 'Volatilidad', pro: true },
};

// Indicators visible by default on the Free plan
export const DEFAULT_VISIBLE_INDICATORS: IndicatorKey[] = INDICATOR_KEYS.filter(
  (key) => !INDICATOR_METADATA[key].pro
);
