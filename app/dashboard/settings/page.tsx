"use client"

import { Lock, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { IntervalSelector } from "@/components/signals/interval-selector"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSignalPreferences } from "@/lib/hooks/use-signal-preferences"
import { INDICATOR_KEYS, INDICATOR_METADATA } from "@/lib/indicators-metadata"
import { cn } from "@/lib/utils"

const GROUPS = ["Tendencia", "Momentum", "Volatilidad"] as const

export default function SettingsPage() {
  const { preferences, setDefaultInterval, toggleIndicator } = useSignalPreferences()

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Temporalidad por defecto</CardTitle>
          <CardDescription>
            Se usará al abrir la página de señales y al generar una nueva señal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntervalSelector value={preferences.defaultInterval} onChange={setDefaultInterval} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores visibles</CardTitle>
          <CardDescription>
            Elige qué KPIs de indicadores técnicos se muestran en la señal. Todos se siguen calculando igual;
            esto solo controla qué se ve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {GROUPS.map((group) => (
            <div key={group} className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {INDICATOR_KEYS.filter((key) => INDICATOR_METADATA[key].group === group).map((key) => {
                  const meta = INDICATOR_METADATA[key]
                  const checked = preferences.visibleIndicators.includes(key)
                  const locked = meta.pro

                  const button = (
                    <button
                      key={key}
                      type="button"
                      onClick={() => !locked && toggleIndicator(key)}
                      disabled={locked}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        locked
                          ? "cursor-not-allowed border-border text-muted-foreground/50"
                          : checked
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border",
                          checked && !locked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {checked && !locked && <Check className="size-3" />}
                      </span>
                      {meta.label}
                      {locked && <Lock className="ml-auto size-3" />}
                    </button>
                  )

                  if (!locked) return button

                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent>Disponible en el plan Pro</TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
