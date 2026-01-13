import { useNavigate } from 'react-router-dom'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { PLAN_DETAILS, PlanName } from '@/lib/plan-constants'

export function PricingCards() {
  const navigate = useNavigate()

  const handleSelectPlan = (planName: string) => {
    // Navigate using URL parameters as requested
    navigate(`/pedido?plan=${encodeURIComponent(planName)}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {(
        Object.entries(PLAN_DETAILS) as [
          PlanName,
          (typeof PLAN_DETAILS)[PlanName],
        ][]
      ).map(([planName, plan]) => (
        <Card
          key={planName}
          className={`relative flex flex-col h-full transition-all duration-300 ${
            plan.highlight
              ? 'border-2 border-accent shadow-xl scale-105 z-10 bg-white'
              : 'border border-border shadow-sm hover:shadow-md bg-white/80'
          }`}
        >
          {plan.highlight && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-primary px-6 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <Star className="h-4 w-4 fill-current" /> Recomendado
            </div>
          )}

          <CardHeader className="text-center pb-2 pt-8">
            <h3 className="text-2xl font-bold font-heading text-foreground mb-2">
              Projeto {planName}
            </h3>
            <p className="text-sm text-muted-foreground min-h-[40px] px-4">
              {plan.description}
            </p>
          </CardHeader>

          <CardContent className="flex-grow text-center px-6">
            <div className="mb-8 py-6 border-b border-border/50">
              <span className="text-5xl font-bold text-primary">
                R$ {plan.price}
              </span>
              <span className="text-muted-foreground text-sm block mt-2">
                Pagamento único
              </span>
            </div>

            <ul className="space-y-4 text-left">
              {plan.marketing_features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-foreground/80"
                >
                  <div className="mt-0.5 p-0.5 rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3 shrink-0" />
                  </div>
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-6 pb-8 px-6">
            <Button
              className={`w-full text-lg h-14 rounded-full font-bold shadow-md transition-all duration-300 ${
                plan.highlight
                  ? 'bg-primary hover:bg-primary/90 text-white hover:scale-105'
                  : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
              }`}
              onClick={() => handleSelectPlan(planName)}
            >
              {plan.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
