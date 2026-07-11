"use client"

import { TechnicalIndicators } from "@/types/database"
import { cn } from "@/lib/utils"
import { IndicatorKey, INDICATOR_METADATA, INDICATOR_KEYS } from "@/lib/indicators-metadata"

interface IndicatorsGridProps {
  indicators: TechnicalIndicators
  visibleIndicators: IndicatorKey[]
}

type Reading = "bullish" | "bearish" | "neutral"

interface IndicatorKpi {
  key: IndicatorKey
  value: string
  reading: Reading
}

const readingClasses: Record<Reading, string> = {
  bullish: "border-green-500/30 bg-green-500/10 text-green-500",
  bearish: "border-red-500/30 bg-red-500/10 text-red-500",
  neutral: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
}

function fmt(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function priceVsLevel(price: number, level: number): Reading {
  if (price > level) return "bullish"
  if (price < level) return "bearish"
  return "neutral"
}

function buildKpis(ind: TechnicalIndicators): Record<IndicatorKey, IndicatorKpi> {
  const rsi14Reading: Reading = ind.rsi_14 > 70 ? "bearish" : ind.rsi_14 < 30 ? "bullish" : "neutral"
  const rsi21Reading: Reading = ind.rsi_21 > 70 ? "bearish" : ind.rsi_21 < 30 ? "bullish" : "neutral"
  const macdReading: Reading = ind.macd_histogram > 0 ? "bullish" : ind.macd_histogram < 0 ? "bearish" : "neutral"
  const stochReading: Reading = ind.stoch_k > 80 ? "bearish" : ind.stoch_k < 20 ? "bullish" : "neutral"
  const bbReading: Reading =
    ind.price >= ind.bb_upper ? "bearish" : ind.price <= ind.bb_lower ? "bullish" : "neutral"
  const psarReading: Reading = ind.psar_trend > 0 ? "bullish" : ind.psar_trend < 0 ? "bearish" : "neutral"

  return {
    sma21: { key: "sma21", value: fmt(ind.sma_21), reading: priceVsLevel(ind.price, ind.sma_21) },
    sma50: { key: "sma50", value: fmt(ind.sma_50), reading: priceVsLevel(ind.price, ind.sma_50) },
    ema21: { key: "ema21", value: fmt(ind.ema_21), reading: priceVsLevel(ind.price, ind.ema_21) },
    psar: { key: "psar", value: fmt(ind.psar_value), reading: psarReading },
    rsi14: { key: "rsi14", value: fmt(ind.rsi_14, 1), reading: rsi14Reading },
    rsi21: { key: "rsi21", value: fmt(ind.rsi_21, 1), reading: rsi21Reading },
    macd: { key: "macd", value: fmt(ind.macd_histogram), reading: macdReading },
    stoch: { key: "stoch", value: fmt(ind.stoch_k, 1), reading: stochReading },
    bollinger: { key: "bollinger", value: `${fmt(ind.bb_lower, 0)} – ${fmt(ind.bb_upper, 0)}`, reading: bbReading },
    atr: { key: "atr", value: fmt(ind.atr), reading: "neutral" },
  }
}

export function IndicatorsGrid({ indicators, visibleIndicators }: IndicatorsGridProps) {
  const kpis = buildKpis(indicators)
  const visibleSet = new Set(visibleIndicators)

  const groups = ["Tendencia", "Momentum", "Volatilidad"] as const
  const groupedKeys = groups.map((group) => ({
    group,
    keys: INDICATOR_KEYS.filter((key) => INDICATOR_METADATA[key].group === group && visibleSet.has(key)),
  })).filter((g) => g.keys.length > 0)

  if (groupedKeys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay indicadores seleccionados. Ajusta esto en Settings.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {groupedKeys.map(({ group, keys }) => (
        <div key={group} className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {keys.map((key) => {
              const kpi = kpis[key]
              return (
                <div
                  key={key}
                  className={cn("rounded-lg border px-3 py-2", readingClasses[kpi.reading])}
                >
                  <div className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                    {INDICATOR_METADATA[key].label}
                  </div>
                  <div className="font-mono text-sm font-bold tabular-nums">{kpi.value}</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
