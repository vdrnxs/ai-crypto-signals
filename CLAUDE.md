# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aurum generates AI-powered cryptocurrency trading signals. It fetches OHLCV candle data from Hyperliquid, calculates technical indicators, sends the data to Cerebras (zai-glm-4.7) for analysis, and stores/displays the resulting BUY/SELL/HOLD signal with confidence, entry/stop-loss/take-profit levels, and AI reasoning.

**This project no longer executes trades.** Order placement, position management, and the Hyperliquid SDK trading integration have been removed. Aurum is signal-generation and display only.

## Technology Stack

- **Framework**: Next.js 15 (App Router + React 19)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI**: Cerebras (`zai-glm-4.7` model, via `@cerebras/cerebras_cloud_sdk`)
- **Market data**: Hyperliquid public `/info` REST endpoint (candle snapshots only — no auth, no SDK)
- **Technical indicators**: `indicatorts` (pure TypeScript)
- **Data format**: TOON (`@toon-format/toon`) — compressed JSON sent to the LLM
- **Validation**: Zod
- **Package manager**: pnpm

## Development Commands

```bash
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Run production server

pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm type-check       # TypeScript validation (tsc --noEmit)
```

There is no test runner configured in this repo (no `test` script, no test files).

### Manually trigger signal analysis

```bash
curl -X POST http://localhost:3000/api/analyze-signals \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC", "interval": "4h", "limit": 100}'
```

### Test the pipeline without calling the AI

```bash
curl http://localhost:3000/api/test-pipeline
```
Fetches candles, computes indicators, builds the TOON payload, and returns a mock HOLD signal — useful for verifying Hyperliquid connectivity and indicator math without spending Cerebras credits.

## Architecture

### Signal generation flow

```
Cron (or manual POST) → /api/analyze-signals
  1. fetchCandles()        lib/api/hyperliquid.ts   — POST to Hyperliquid /info (candleSnapshot), Zod-validated
  2. upsert candles        Supabase "candles" table  (onConflict: symbol,interval,open_time)
  3. prepareAIPayload()    lib/api/toon.ts           — computes indicators + encodes TOON payload
  4. analyzeTradingSignal() lib/api/ai.ts            — Cerebras call, Zod-validated response
  5. insert signal          Supabase "btc_trading_signals" table
  6. insert indicators      Supabase "btc_indicators" table (FK: signal_id)
     → on failure, the signal row is deleted (rollback) to avoid orphaned signals
```

The route is protected by an `x-cron-secret` header checked against `CRON_SECRET` (only enforced if `CRON_SECRET` is set).

### Frontend data flow

- Server Components read signals via `lib/services/signals-service.ts` (`getLatestSignal`, `getSignalHistory`, `getSignalStats`), which queries Supabase through the browser-safe client (`lib/supabase/client.ts`, anon key, read-only under RLS).
- `lib/supabase/server.ts` uses the service role key and is for API routes only — never imported by client components.
- The dashboard route group `app/(dashboard)/` shares a sidebar layout (`components/dashboard/app-sidebar.tsx`) via Next.js route groups — the `(dashboard)` folder does not appear in the URL. `/` redirects to `/signals/bitcoin`.

### Technical indicators

`lib/api/indicators.ts` computes SMA (21/50/100), EMA (12/21/55), RSI (14/21), MACD (8/17/9), Bollinger Bands, ATR, Parabolic SAR, and Stochastic (14/3) from raw candles using `indicatorts`. `getLatestValues()` returns the most recent value of each. TP/SL in the AI prompt are derived from ATR multipliers (`ATR_CONFIG` in `lib/api/constants.ts`).

### Validation layers

1. **Request schema** (`app/api/analyze-signals/route.ts`) — Zod validates `symbol`/`interval`/`limit`.
2. **AI response schema** (`lib/api/ai.ts`, `TradingSignalSchema`) — HOLD signals allow `0` prices; BUY/SELL require positive values.
3. **Business logic** (`lib/api/ai.ts`, `validateSignalLogic()`) — enforces BUY: `stopLoss < entry < takeProfit`, SELL: the inverse, warns (does not reject) when R:R falls below `AI_CONFIG.MIN_RR_RATIO` or when SL/TP land on psychological round numbers.

### Configuration

- `lib/api/constants.ts` — backend-only: `AI_CONFIG` (model, temperature, max tokens, min R:R), `ATR_CONFIG` (SL/TP multipliers), `PRICE_VALIDATION`, `API_LIMITS` (candle count bounds), `SUPPORTED_INTERVALS`.
- `lib/constants.ts` — frontend-only: `RISK_MANAGEMENT` (used for R:R display/formatting in UI).
- Do not confuse the two files — same-ish name, different scope (comments at the top of each cross-reference the other).

### Logging

Use `createLogger('module-name')` from `lib/api/logger.ts` — never raw `console.*`. Level is controlled by `LOG_LEVEL` env var (`DEBUG`/`INFO`/`WARN`/`ERROR`, defaults to `INFO`).

## Environment Variables

```env
# Frontend (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Backend only
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CEREBRAS_API_KEY=
CRON_SECRET=            # optional; if unset, /api/analyze-signals is unauthenticated
LOG_LEVEL=INFO           # DEBUG | INFO | WARN | ERROR
```

Hyperliquid candle fetching hits a public unauthenticated endpoint — no Hyperliquid API keys or wallet credentials are needed anymore.

## Database

- `candles` — upserted OHLCV data, unique on `(symbol, interval, open_time)`.
- `btc_trading_signals` — one row per analysis run (signal, confidence, entry/SL/TP, AI reasoning).
- `btc_indicators` — one row per signal (`signal_id` FK), holds the full indicator snapshot at analysis time.
- Migration `supabase/migrations/20250107_add_signals_index.sql` adds a composite index on `btc_trading_signals(symbol, interval, created_at DESC)` for the frontend's latest/history/stats queries. Migrations are applied manually in the Supabase SQL editor.
- Frontend (anon key) is read-only under RLS; writes only happen server-side via the service role key.

## Code Style

- TypeScript strict mode, functional components with hooks, `@/` import alias.
- No emojis in code identifiers/comments.
- Structured logging only (`createLogger`), never `console.*` in `lib/`/`app/api/`.
- Zod-validate at every external boundary (Hyperliquid response, AI response, incoming API request).
