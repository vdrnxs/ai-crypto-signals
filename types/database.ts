export interface HyperliquidCandle {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}

export interface Candle {
  id: number;
  symbol: string;
  interval: string;
  open_time: number;
  close_time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades_count: number;
  created_at: string;
}

export type CandleInterval =
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M';

export type CryptoSymbol = 'BTC' | 'ETH' | string;

export type CandleInsert = Omit<Candle, 'id' | 'created_at'>;

// Trading Signal Types
export type SignalType = 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';

export interface TradingSignal {
  id: number;
  symbol: string;
  interval: string;
  created_at: string;
  candles_timestamp: number;
  signal: SignalType;
  confidence: number;
  current_price: number | null;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  ai_reasoning: string | null;
  toon_data?: string | null;
  indicators_data?: Record<string, unknown> | null;
}

export interface TechnicalIndicators {
  id: number;
  signal_id: number;
  price: number;
  sma_21: number;
  sma_50: number;
  sma_100: number;
  ema_12: number;
  ema_21: number;
  ema_55: number;
  rsi_14: number;
  rsi_21: number;
  macd_line: number;
  macd_signal: number;
  macd_histogram: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  atr: number;
  psar_value: number;
  psar_trend: number;
  stoch_k: number;
  stoch_d: number;
  created_at: string;
}