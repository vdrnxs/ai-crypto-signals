import Link from "next/link"
import { Activity, LineChart, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const howItWorks = [
  {
    icon: LineChart,
    title: "Datos de mercado",
    description: "Velas OHLCV en tiempo real obtenidas directamente de Hyperliquid.",
  },
  {
    icon: Activity,
    title: "Indicadores técnicos",
    description: "SMA, EMA, RSI, MACD, Bollinger Bands, ATR y más, calculados en cada ciclo.",
  },
  {
    icon: Sparkles,
    title: "Análisis con IA",
    description: "Un modelo de IA interpreta el contexto técnico y genera una señal razonada.",
  },
  {
    icon: TrendingUp,
    title: "Señal accionable",
    description: "BUY, SELL o HOLD con nivel de confianza, entrada, stop-loss y take-profit.",
  },
]

const pricingPlans = [
  { name: "Free", description: "Acceso limitado a señales", available: true },
  { name: "Pro", description: "Más señales y símbolos", available: false },
  { name: "Team", description: "Uso compartido en equipo", available: false },
]

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-24 px-6 py-20">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge variant="outline" className="text-xs">Beta abierta · sin registro</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Aurum
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          Señales de trading de criptomonedas generadas con IA, a partir de indicadores técnicos en tiempo real.
        </p>
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Ir a la app — servicio gratuito limitado (beta)
          </Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Cómo funciona</h2>
          <p className="mt-2 text-muted-foreground">
            De los datos de mercado a una señal razonada, en cuatro pasos.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {howItWorks.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <step.icon className="size-5 text-muted-foreground" />
                <CardTitle className="mt-2">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing placeholder */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Próximamente</h2>
          <p className="mt-2 text-muted-foreground">
            Planes de suscripción con más señales y símbolos. Por ahora, la beta es gratuita para todos.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className={plan.available ? undefined : "opacity-60"}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge variant={plan.available ? "success" : "secondary"}>
                    {plan.available ? "Disponible" : "Próximamente"}
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {plan.available ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard">Empezar gratis</Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    No disponible aún
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border border-warning/30 bg-warning/5 p-6 text-sm text-muted-foreground">
        <p className="font-medium text-warning">Aviso</p>
        <p className="mt-2">
          Aurum es un proyecto experimental y educativo. Las señales generadas son salidas algorítmicas,
          no asesoramiento financiero. El trading de criptomonedas conlleva un riesgo sustancial de pérdida.
          Usa esta herramienta bajo tu propia responsabilidad.
        </p>
      </section>
    </div>
  )
}