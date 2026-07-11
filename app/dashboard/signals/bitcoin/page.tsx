"use client"

import { useCallback, useEffect, useState } from "react"
import { SignalCard } from "@/components/signals/signal-card"
import { SignalDetails } from "@/components/signals/signal-details"
import { GenerateSignalButton } from "@/components/signals/generate-signal-button"
import { getSignalHistory } from "@/lib/services/signals-service"
import { useSignalPreferences } from "@/lib/hooks/use-signal-preferences"
import { TradingSignal } from "@/types/database"

export default function BitcoinSignalsPage() {
  const { preferences } = useSignalPreferences()
  const interval = preferences.defaultInterval
  const [signalHistory, setSignalHistory] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const history = await getSignalHistory('BTC', interval)
      setSignalHistory(history)
    } catch (error) {
      console.error('Error fetching Bitcoin data:', error)
    } finally {
      setLoading(false)
    }
  }, [interval])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const latestSignal = signalHistory[0]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <GenerateSignalButton
          symbol="BTC"
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
          Todavía no hay señales generadas para {interval}. Pulsa &quot;Generar nueva señal&quot; para empezar.
        </div>
      )}

      {!loading && <SignalDetails signals={signalHistory} />}
    </div>
  )
}
