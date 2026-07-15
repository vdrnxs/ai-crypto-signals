"use client"

import { useCallback, useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { SignalCard } from "@/components/signals/signal-card"
import { SignalDetails } from "@/components/signals/signal-details"
import { GenerateSignalButton } from "@/components/signals/generate-signal-button"
import { getSignalHistory } from "@/lib/services/signals-service"
import { useSignalPreferences } from "@/lib/hooks/use-signal-preferences"
import { SYMBOL_SLUGS } from "@/lib/constants"
import { SYMBOL_METADATA } from "@/lib/api/constants"
import { TradingSignal } from "@/types/database"

export default function SymbolSignalsPage() {
  const params = useParams<{ symbol: string }>()
  const symbol = SYMBOL_SLUGS[params.symbol]

  const { preferences } = useSignalPreferences()
  const interval = preferences.defaultInterval
  const [signalHistory, setSignalHistory] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!symbol) return
    setLoading(true)
    try {
      const history = await getSignalHistory(symbol, interval)
      setSignalHistory(history)
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error)
    } finally {
      setLoading(false)
    }
  }, [symbol, interval])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!symbol) {
    notFound()
  }

  const latestSignal = signalHistory[0]
  const { label } = SYMBOL_METADATA[symbol]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <GenerateSignalButton
          symbol={symbol}
          interval={interval}
          lastSignalAt={latestSignal?.created_at}
          onGenerated={fetchData}
        />
      </div>

      {loading ? (
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      ) : latestSignal ? (
        <SignalCard signal={latestSignal} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Todavía no hay señales generadas para {label} en {interval}. Pulsa &quot;Generar nueva señal&quot; para empezar.
        </div>
      )}

      {!loading && <SignalDetails signals={signalHistory} />}
    </div>
  )
}
