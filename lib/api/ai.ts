import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { AI_CONFIG, ATR_CONFIG, PRICE_VALIDATION, SYMBOL_METADATA, type SUPPORTED_SYMBOLS } from './constants';
import { createLogger } from './logger';
import { config } from '@/lib/config';

const log = createLogger('ai');

// Validate API key is configured
if (!config.openai.apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not configured');
}

// Initialize OpenAI client (singleton)
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Model occasionally returns confidence as a 0-1 fraction despite prompt instructions;
// normalize it back to the 0-100 scale the rest of the app (UI, DB) expects.
// 0 stays 0; anything in (0, 1] is treated as a fraction; anything above 1 is already 0-100.
function normalizeConfidence(val: number): number {
  if (val > 0 && val <= 1) {
    log.warn('Model returned confidence as a 0-1 fraction despite prompt instructions; normalizing', {
      original: val,
      normalized: val * 100,
    });
    return val * 100;
  }
  return val;
}

// Zod schema for runtime validation of AI responses
// HOLD signals can have 0 values for prices (no trade action)
const TradingSignalSchema = z.object({
  signal: z.enum(['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL']),
  confidence: z.number().min(0).max(100),
  entry_price: z.number().default(0),
  stop_loss: z.number().default(0),
  take_profit: z.number().default(0),
  reasoning: z.string().min(10, 'Reasoning must be at least 10 characters'),
}).refine((data) => {
  // For HOLD signals, prices can be 0
  if (data.signal === 'HOLD') {
    return true;
  }
  // For BUY/SELL signals, all prices must be positive
  return (data.entry_price ?? 0) > 0 && (data.stop_loss ?? 0) > 0 && (data.take_profit ?? 0) > 0;
}, {
  message: 'BUY/SELL signals must have positive entry_price, stop_loss, and take_profit',
});

function buildSystemPrompt(assetLabel: string): string {
  return `Eres un trader especializado en mercados financieros. Analiza el mercado de ${assetLabel} y genera una señal de trading en formato JSON.

IMPORTANTE: No inventes datos. El campo confidence es un entero de 0 a 100 (nunca un decimal entre 0 y 1, ej. usa 63 y no 0.63). Refleja no solo la dirección del mercado, sino la probabilidad de éxito de la operación teniendo en cuenta divergencias, indicadores inflados (sobrecompra/sobreventa), el r:r 2:1 (por cada 1 unidad de riesgo espero ganar 2 unidades de beneficio) y señales contradictorias.

Para HOLD: usa 0 para entry_price, stop_loss y take_profit.

Explica claramente la razón de tu decisiones de trading (entry price, tp y sl).

Incluye al final de tu respuesta una recomendación sobre qué hacer con una operación abierta (long o short).`;
}

export interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  confidence: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  reasoning: string;
}

export async function analyzeTradingSignal(
  toonData: string,
  symbol: (typeof SUPPORTED_SYMBOLS)[number] = 'BTC'
): Promise<TradingSignal> {
  log.info('Analyzing market data with OpenAI', { model: AI_CONFIG.MODEL, symbol });

  const assetLabel = SYMBOL_METADATA[symbol].assetLabel;

  let response;
  try {
    response = await openai.chat.completions.parse({
      model: AI_CONFIG.MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(assetLabel) },
        {
          role: 'user',
          content: `Market data:

${toonData}

Con los indicadores proporcionados, determina la dirección del mercado y especifica el mejor precio de entrada.
Tus reglas de salida son para TP atr x${ATR_CONFIG.MULTIPLIER_TP} y para SL atr x${ATR_CONFIG.MULTIPLIER_SL}. Ten en cuenta que trabajamos con un r:r 2:1, por lo que la operación debe mostrar una probabilidad razonable de alcanzar el TP según las condiciones actuales del mercado.
`
        },
      ],
      temperature: AI_CONFIG.TEMPERATURE,
      max_completion_tokens: AI_CONFIG.MAX_TOKENS,
      response_format: zodResponseFormat(TradingSignalSchema, 'trading_signal'),
    });
  } catch (error) {
    // zodResponseFormat re-validates the raw response against TradingSignalSchema
    // (including .refine()) inside the SDK call itself, so a schema/business-rule
    // failure throws a raw ZodError here rather than surfacing as parsed/refusal.
    log.error('OpenAI request failed or response failed schema validation', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`AI provider request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const choice = response.choices[0];
  const finishReason = choice?.finish_reason;

  if (finishReason === 'length') {
    log.error('Response truncated due to max_tokens limit before reaching final answer', { finishReason });
    throw new Error('AI response was truncated before producing a signal. Try again.');
  }

  const parsed = choice?.message?.parsed;

  if (!parsed) {
    log.error('Empty or unparseable response from OpenAI', {
      refusal: choice?.message?.refusal,
      finishReason,
    });
    throw new Error(choice?.message?.refusal || 'No response from AI provider');
  }

  log.debug('Parsed AI response', { signal: parsed.signal, confidence: parsed.confidence });

  // OpenAI strict structured outputs forces every schema field to be present in the
  // response, so the model always emits explicit entry/SL/TP values even for HOLD
  // (Zod's .default(0) never kicks in). Zero them out here regardless of what the
  // model sent, since a HOLD signal must never carry stray price levels.
  const isHold = parsed.signal === 'HOLD';

  const signal: TradingSignal = {
    ...parsed,
    confidence: normalizeConfidence(parsed.confidence),
    entry_price: isHold ? 0 : parsed.entry_price,
    stop_loss: isHold ? 0 : parsed.stop_loss,
    take_profit: isHold ? 0 : parsed.take_profit,
  };

  // Additional business logic validation
  validateSignalLogic(signal);

  log.info('Trading signal generated', {
    signal: signal.signal,
    confidence: signal.confidence,
    entry: signal.entry_price,
    stopLoss: signal.stop_loss,
    takeProfit: signal.take_profit,
  });

  return signal;
}

/**
 * Validates trading signal business logic (price relationships, R:R ratio, etc.)
 * Zod handles basic type validation, this handles domain-specific rules
 */
function validateSignalLogic(signal: TradingSignal): void {
  const isBuy = signal.signal === 'BUY' || signal.signal === 'STRONG_BUY';
  const isSell = signal.signal === 'SELL' || signal.signal === 'STRONG_SELL';
  const isHold = signal.signal === 'HOLD';

  // HOLD signals don't need price validation
  if (isHold) {
    return;
  }

  // Validate trade signals (BUY/SELL) have positive prices
  if (signal.entry_price <= 0) {
    throw new Error(`Invalid entry_price: ${signal.entry_price}`);
  }

  if (signal.stop_loss <= 0) {
    throw new Error(`Invalid stop_loss: ${signal.stop_loss}`);
  }

  if (signal.take_profit <= 0) {
    throw new Error(`Invalid take_profit: ${signal.take_profit}`);
  }

  // Validate price order logic
  if (isBuy && signal.stop_loss >= signal.entry_price) {
    throw new Error(`BUY signal: stop_loss (${signal.stop_loss}) must be below entry (${signal.entry_price})`);
  }

  if (isBuy && signal.take_profit <= signal.entry_price) {
    throw new Error(`BUY signal: take_profit (${signal.take_profit}) must be above entry (${signal.entry_price})`);
  }

  if (isSell && signal.stop_loss <= signal.entry_price) {
    throw new Error(`SELL signal: stop_loss (${signal.stop_loss}) must be above entry (${signal.entry_price})`);
  }

  if (isSell && signal.take_profit >= signal.entry_price) {
    throw new Error(`SELL signal: take_profit (${signal.take_profit}) must be below entry (${signal.entry_price})`);
  }

  // Validate R:R ratio (minimum 3:1 for swing trading)
  const risk = Math.abs(signal.entry_price - signal.stop_loss);
  const reward = Math.abs(signal.take_profit - signal.entry_price);
  const ratio = risk > 0 ? reward / risk : 0;

  if (ratio < AI_CONFIG.MIN_RR_RATIO) {
    log.warn('R:R ratio below target', {
      ratio: ratio.toFixed(2),
      target: AI_CONFIG.MIN_RR_RATIO,
      entry: signal.entry_price,
      stopLoss: signal.stop_loss,
      takeProfit: signal.take_profit,
    });
  }

  // Log round numbers warning (informational only)
  const isRoundNumber = (price: number) =>
    PRICE_VALIDATION.PSYCHOLOGICAL_LEVELS.some(level => price % level === 0);

  if (isRoundNumber(signal.stop_loss) || isRoundNumber(signal.take_profit)) {
    log.warn('Psychological levels detected', {
      stopLoss: signal.stop_loss,
      takeProfit: signal.take_profit,
      levels: PRICE_VALIDATION.PSYCHOLOGICAL_LEVELS,
    });
  }
}
