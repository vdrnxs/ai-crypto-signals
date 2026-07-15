-- Migration: Allow PAXG (Gold) as a valid symbol
-- Date: 2026-07-15
-- Purpose: btc_trading_signals.symbol has a CHECK constraint limiting it to 'BTC' only.
-- Widen it to include PAXG (and any future SUPPORTED_SYMBOLS from lib/api/constants.ts).

ALTER TABLE btc_trading_signals
  DROP CONSTRAINT IF EXISTS btc_trading_signals_symbol_check;

ALTER TABLE btc_trading_signals
  ADD CONSTRAINT btc_trading_signals_symbol_check
  CHECK (symbol IN ('BTC', 'PAXG'));

-- If `candles` has an equivalent symbol CHECK constraint, widen it the same way.
-- Uncomment and adjust the constraint name (check pg via \d candles or the
-- Supabase table editor's "Constraints" tab) if candle upserts for PAXG also fail:
-- ALTER TABLE candles DROP CONSTRAINT IF EXISTS candles_symbol_check;
-- ALTER TABLE candles ADD CONSTRAINT candles_symbol_check CHECK (symbol IN ('BTC', 'PAXG'));
