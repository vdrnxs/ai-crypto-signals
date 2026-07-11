"use client"

import { useEffect, useState } from "react"
import { TradingSignal, TechnicalIndicators } from "@/types/database"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDateTime } from "@/lib/utils/formatters"
import { TrendingUp, TrendingDown, Minus, Clock, ChevronDown, Sparkles, Gauge } from "lucide-react"
import { TokenBTC, TokenETH, TokenSOL } from "@web3icons/react"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/lib/hooks/use-count-up"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { IndicatorsGrid } from "@/components/signals/indicators-grid"
import { getIndicatorsForSignal } from "@/lib/services/signals-service"
import { useSignalPreferences } from "@/lib/hooks/use-signal-preferences"

interface SignalCardProps {
  signal: TradingSignal
}

export function SignalCard({ signal }: SignalCardProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const [indicatorsOpen, setIndicatorsOpen] = useState(false)
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null)
  const { preferences } = useSignalPreferences()

  useEffect(() => {
    let cancelled = false
    getIndicatorsForSignal(signal.id).then((data) => {
      if (!cancelled) setIndicators(data)
    })
    return () => {
      cancelled = true
    }
  }, [signal.id])
  const isHold = signal.signal === 'HOLD'
  const isBuy = signal.signal === 'BUY' || signal.signal === 'STRONG_BUY'
  const isSell = signal.signal === 'SELL' || signal.signal === 'STRONG_SELL'

  // Calculate percentages and R:R ratio
  const entryPrice = signal.entry_price || 0
  const tpPrice = signal.take_profit || 0
  const slPrice = signal.stop_loss || 0

  const animatedEntry = useCountUp(entryPrice)
  const animatedTp = useCountUp(tpPrice)
  const animatedSl = useCountUp(slPrice)

  // For LONG: TP > EP, SL < EP (positive TP%, negative SL%)
  // For SHORT: TP < EP, SL > EP (negative TP%, positive SL%)
  const tpPercentage = entryPrice > 0 ? ((tpPrice - entryPrice) / entryPrice) * 100 : 0
  const slPercentage = entryPrice > 0 ? ((slPrice - entryPrice) / entryPrice) * 100 : 0

  const riskAmount = Math.abs(entryPrice - slPrice)
  const rewardAmount = Math.abs(tpPrice - entryPrice)
  const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0

  // Token icon mapping
  const tokenIcons: Record<string, typeof TokenBTC> = {
    'BTC': TokenBTC,
    'ETH': TokenETH,
    'SOL': TokenSOL,
  }

  const TokenIcon = tokenIcons[signal.symbol] || TokenBTC // Fallback to BTC if unknown

  const signalConfig = {
    BUY: {
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      icon: TrendingUp,
      label: 'Buy',
      variant: 'success' as const
    },
    STRONG_BUY: {
      color: 'text-green-600',
      bg: 'bg-green-600/10',
      icon: TrendingUp,
      label: 'Strong Buy',
      variant: 'success' as const
    },
    SELL: {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      icon: TrendingDown,
      label: 'Sell',
      variant: 'danger' as const
    },
    STRONG_SELL: {
      color: 'text-red-600',
      bg: 'bg-red-600/10',
      icon: TrendingDown,
      label: 'Strong Sell',
      variant: 'danger' as const
    },
    HOLD: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      icon: Minus,
      label: 'Hold',
      variant: 'outline' as const
    },
  }

  const config = signalConfig[signal.signal]
  const Icon = config.icon

  const ringClass = isBuy
    ? "ring-1 ring-inset ring-green-500/25"
    : isSell
      ? "ring-1 ring-inset ring-red-500/25"
      : "ring-1 ring-inset ring-yellow-500/25"

  const confidenceBarClass = isBuy ? "bg-green-500" : isSell ? "bg-red-500" : "bg-yellow-500"

  return (
    <Card className={cn("overflow-hidden shadow-xl", ringClass)}>
      <CardHeader className="border-b pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-muted p-3">
              <TokenIcon size={28} variant="branded" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-bold tracking-tight">
                  {signal.symbol}
                </h3>
                <Badge variant={config.variant} className={cn("gap-1 text-xs font-bold", config.color)}>
                  <Icon className="size-3" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>{formatDateTime(signal.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Confidence Chart */}
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <div className="text-xs font-medium text-muted-foreground">Confianza</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full transition-all", confidenceBarClass)}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums">{signal.confidence.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-4">
          {/* Price Levels - Trading Terminal Style */}
          {!isHold && (
            <div className={cn(
              "relative overflow-hidden rounded-xl border-2 border-border p-4 sm:p-6",
              isBuy ? "bg-gradient-to-r from-red-500/5 via-primary/5 to-green-500/5" : "bg-gradient-to-r from-green-500/5 via-primary/5 to-red-500/5"
            )}>
              <div className="grid grid-cols-1 divide-y divide-border/50 md:grid-cols-3 md:gap-6 md:divide-y-0">
                {/* LEFT SIDE - Context aware (SL for LONG, TP for SHORT) */}
                {isBuy ? (
                  <div className="relative py-4 text-center first:pt-0 md:py-0 md:text-left">
                    <div className="mb-3 flex items-center justify-center md:justify-start">
                      <div className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-600">
                        SL
                      </div>
                    </div>
                    <div className="font-mono text-3xl font-bold tracking-tight text-red-600 tabular-nums sm:text-4xl">
                      {formatPrice(animatedSl)}
                    </div>
                    <div className="mt-2 text-lg font-bold text-red-600">
                      {slPercentage.toFixed(2)}%
                    </div>
                  </div>
                ) : (
                  <div className="relative py-4 text-center first:pt-0 md:py-0 md:text-left">
                    <div className="mb-3 flex items-center justify-center md:justify-start">
                      <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-600">
                        TP
                      </div>
                    </div>
                    <div className="font-mono text-3xl font-bold tracking-tight text-green-600 tabular-nums sm:text-4xl">
                      {formatPrice(animatedTp)}
                    </div>
                    <div className="mt-2 text-lg font-bold text-green-600">
                      {tpPercentage.toFixed(2)}%
                    </div>
                  </div>
                )}

                {/* Entry Price - CENTER (Always) */}
                <div className="relative py-4 md:py-0">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 opacity-50" />
                  <div className="relative text-center px-4 py-2">
                    <div className="mb-3 flex items-center justify-center">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry Price</div>
                    </div>
                    <div className="font-mono text-4xl font-bold tracking-tight text-primary tabular-nums sm:text-5xl">
                      {formatPrice(animatedEntry)}
                    </div>
                    {!isHold && (
                      <div className="mt-3 flex items-center justify-center">
                        <Badge variant="outline" className="text-xs">
                          R:R {riskRewardRatio.toFixed(2)}:1
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE - Context aware (TP for LONG, SL for SHORT) */}
                {isBuy ? (
                  <div className="relative py-4 text-center last:pb-0 md:py-0 md:text-right">
                    <div className="mb-3 flex items-center justify-center md:justify-end">
                      <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-600">
                        TP
                      </div>
                    </div>
                    <div className="font-mono text-3xl font-bold tracking-tight text-green-600 tabular-nums sm:text-4xl">
                      {formatPrice(animatedTp)}
                    </div>
                    <div className="mt-2 text-lg font-bold text-green-600">
                      +{Math.abs(tpPercentage).toFixed(2)}%
                    </div>
                  </div>
                ) : (
                  <div className="relative py-4 text-center last:pb-0 md:py-0 md:text-right">
                    <div className="mb-3 flex items-center justify-center md:justify-end">
                      <div className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-600">
                        SL
                      </div>
                    </div>
                    <div className="font-mono text-3xl font-bold tracking-tight text-red-600 tabular-nums sm:text-4xl">
                      {formatPrice(animatedSl)}
                    </div>
                    <div className="mt-2 text-lg font-bold text-red-600">
                      +{Math.abs(slPercentage).toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Separators (desktop only) */}
              <div className="absolute left-1/3 top-0 bottom-0 hidden w-px bg-gradient-to-b from-transparent via-border to-transparent opacity-50 md:block" />
              <div className="absolute left-2/3 top-0 bottom-0 hidden w-px bg-gradient-to-b from-transparent via-border to-transparent opacity-50 md:block" />
            </div>
          )}

          {/* AI Reasoning */}
          {signal.ai_reasoning && (
            <Collapsible open={reasoningOpen} onOpenChange={setReasoningOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  Análisis de la IA
                </span>
                <ChevronDown className={cn("size-4 transition-transform", reasoningOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                {signal.ai_reasoning}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Technical Indicators */}
          {indicators && (
            <Collapsible open={indicatorsOpen} onOpenChange={setIndicatorsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                <span className="flex items-center gap-2">
                  <Gauge className="size-3.5" />
                  Indicadores técnicos
                </span>
                <ChevronDown className={cn("size-4 transition-transform", indicatorsOpen && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-lg bg-muted/50 p-3">
                <IndicatorsGrid indicators={indicators} visibleIndicators={preferences.visibleIndicators} />
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
