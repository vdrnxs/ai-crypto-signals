"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { TradingSignal } from "@/types/database"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { SignalStats } from "@/components/dashboard/signal-stats"
import { SignalsTable } from "@/components/signals/signals-table"
import { cn } from "@/lib/utils"

interface SignalDetailsProps {
  signals: TradingSignal[]
}

export function SignalDetails({ signals }: SignalDetailsProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <span>Detalles: estadísticas e historial</span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-6">
        <SignalStats signals={signals} />
        <SignalsTable signals={signals} />
      </CollapsibleContent>
    </Collapsible>
  )
}
