"use client"

import { useCallback, useEffect, useState } from "react"
import { SignalCard } from "@/components/signals/signal-card"
import { SignalDetails } from "@/components/signals/signal-details"
import { GenerateSignalButton } from "@/components/signals/generate-signal-button"
import { getSignalHistory } from "@/lib/services/signals-service"
import { TradingSignal } from "@/types/database"

export default function BitcoinSignalsPage() {
  const [signalHistory, setSignalHistory] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const history = await getSignalHistory('BTC')
      setSignalHistory(history)
    } catch (error) {
      console.error('Error fetching Bitcoin data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const latestSignal = signalHistory[0]

  // Debug helper for previewing the count-up animation without waiting for the
  // 30-minute cooldown. Re-enable when tweaking SignalCard's animation.
  //
  // const [debugSignal, setDebugSignal] = useState<TradingSignal | null>(null)
  // const displayedSignal = debugSignal ?? latestSignal
  //
  // function triggerDebugFlash() {
  //   if (!latestSignal) return
  //   const jitter = (value: number | null) => (value ? Math.round(value * (0.97 + Math.random() * 0.06)) : value)
  //   setDebugSignal({
  //     ...latestSignal,
  //     id: -Date.now(),
  //     entry_price: jitter(latestSignal.entry_price),
  //     stop_loss: jitter(latestSignal.stop_loss),
  //     take_profit: jitter(latestSignal.take_profit),
  //   })
  // }
  const displayedSignal = latestSignal

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BTC · Señal actual</h1>
          <p className="text-sm text-muted-foreground">Análisis en tiempo real con IA</p>
        </div>
        <div className="flex items-center gap-2">
          {/* {process.env.NODE_ENV === 'development' && (
            <Button variant="outline" size="sm" onClick={triggerDebugFlash} disabled={!latestSignal}>
              Debug: probar animación
            </Button>
          )} */}
          <GenerateSignalButton symbol="BTC" lastSignalAt={latestSignal?.created_at} onGenerated={fetchData} />
        </div>
      </div>

      {loading ? (
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      ) : displayedSignal ? (
        <SignalCard signal={displayedSignal} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Todavía no hay señales generadas. Pulsa &quot;Generar nueva señal&quot; para empezar.
        </div>
      )}

      {!loading && <SignalDetails signals={signalHistory} />}
    </div>
  )
}
