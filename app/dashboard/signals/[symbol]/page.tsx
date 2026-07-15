"use client"

import { useEffect, useState } from "react"
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

  if (!symbol) {
    notFound()
  }

  // Remounting on symbol/interval change (via key) gives each combination a
  // fresh `loading` state for free, instead of managing it by hand with a
  // setState call at the top of an effect.
  return <SymbolSignals key={`${symbol}-${preferences.defaultInterval}`} symbol={symbol} interval={preferences.defaultInterval} />
}

interface SymbolSignalsProps {
  symbol: (typeof SYMBOL_SLUGS)[string]
  interval: string
}

function SymbolSignals({ symbol, interval }: SymbolSignalsProps) {
  const [signalHistory, setSignalHistory] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)
  // Bumped after generating a signal to re-run the fetch effect
  const [refreshKey, setRefreshKey] = useState(0)

  // Official react.dev fetch-in-effect pattern: the async function lives inside
  // the effect and every setState is guarded by the cleanup flag, so stale
  // responses from a previous symbol/interval can never overwrite fresh state.
  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const history = await getSignalHistory(symbol, interval)
        if (!ignore) setSignalHistory(history)
      } catch (error) {
        console.error(`Error fetching ${symbol} data:`, error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [symbol, interval, refreshKey])

  const latestSignal = signalHistory[0]
  const { label } = SYMBOL_METADATA[symbol]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <GenerateSignalButton
          symbol={symbol}
          interval={interval}
          lastSignalAt={latestSignal?.created_at}
          onGenerated={() => setRefreshKey((k) => k + 1)}
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
