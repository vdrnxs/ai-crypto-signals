"use client"

import { useEffect, useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Must match MANUAL_GENERATION_COOLDOWN_MS in app/api/analyze-signals/route.ts
const COOLDOWN_SECONDS = 30 * 60

interface GenerateSignalButtonProps {
  symbol?: string
  interval?: string
  /** ISO timestamp of the last known signal, used to resume the cooldown after a page refresh */
  lastSignalAt?: string
  onGenerated?: () => void
  className?: string
}

export function GenerateSignalButton({
  symbol = "BTC",
  interval = "4h",
  lastSignalAt,
  onGenerated,
  className,
}: GenerateSignalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Resume the real cooldown based on the last signal already loaded by the parent
  // (protects against refreshing the page to reset a client-only timer)
  useEffect(() => {
    if (!lastSignalAt) return

    const elapsedSeconds = (Date.now() - new Date(lastSignalAt).getTime()) / 1000
    const remaining = Math.ceil(COOLDOWN_SECONDS - elapsedSeconds)

    if (remaining > 0) setCooldown(remaining)
  }, [lastSignalAt])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, interval, limit: 100 }),
      })

      const data = await response.json()

      if (response.status === 429) {
        setCooldown(data.retry_after_seconds ?? COOLDOWN_SECONDS)
        throw new Error(data.error || "Cooldown activo")
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo generar la señal")
      }

      setCooldown(COOLDOWN_SECONDS)
      onGenerated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const disabled = loading || cooldown > 0

  function formatCooldown(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("flex flex-col items-end gap-1.5", className)}>
      <Button
        size="lg"
        onClick={handleGenerate}
        disabled={disabled}
        className="h-12 gap-2 px-6 text-base font-semibold shadow-lg shadow-primary/20"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Sparkles className="size-5" />
        )}
        {loading
          ? "Analizando mercado…"
          : cooldown > 0
            ? `Nueva señal en ${formatCooldown(cooldown)}`
            : "Generar nueva señal"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
