"use client"

import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRO_ONLY_INTERVALS } from "@/lib/constants"
import { SignalInterval } from "@/lib/hooks/use-signal-preferences"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const INTERVALS: SignalInterval[] = ["1h", "4h", "1d"]

interface IntervalSelectorProps {
  value: SignalInterval
  onChange: (interval: SignalInterval) => void
  className?: string
}

function isProInterval(interval: SignalInterval): boolean {
  return (PRO_ONLY_INTERVALS as readonly string[]).includes(interval)
}

export function IntervalSelector({ value, onChange, className }: IntervalSelectorProps) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1", className)}>
      {INTERVALS.map((interval) => {
        const locked = isProInterval(interval)

        const button = (
          <button
            key={interval}
            type="button"
            onClick={() => !locked && onChange(interval)}
            aria-pressed={value === interval}
            disabled={locked}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              locked
                ? "cursor-not-allowed text-muted-foreground/50"
                : value === interval
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            {interval}
            {locked && <Lock className="size-3" />}
          </button>
        )

        if (!locked) return button

        return (
          <Tooltip key={interval}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>Disponible en el plan Pro</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
