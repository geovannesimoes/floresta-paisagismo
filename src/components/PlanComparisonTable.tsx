import { Check, X, Star } from 'lucide-react'
import { Plan } from '@/services/plansService'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

interface PlanComparisonTableProps {
  plans: Plan[]
}

export function PlanComparisonTable({ plans }: PlanComparisonTableProps) {
  // 1. Extract all unique feature texts from all plans
  const allFeatures = Array.from(
    new Set(plans.flatMap((plan) => plan.features?.map((f) => f.text) || [])),
  ).sort()

  const handleSelectPlan = (plan: Plan) => {
    // Navigate handled by parent usually, but here we can just link
    // We'll leave it to the button Link component
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] lg:min-w-full rounded-xl border border-border shadow-sm bg-white overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] bg-muted/30 border-b">
          <div className="p-6 flex flex-col justify-end">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Comparativo
            </span>
            <h3 className="text-xl font-heading font-bold text-foreground">
              Recursos e Benefícios
            </h3>
          </div>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'p-6 text-center flex flex-col gap-4 relative',
                plan.highlight ? 'bg-primary/5' : '',
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 bg-accent text-primary text-xs font-bold py-1 uppercase tracking-wide">
                  Recomendado
                </div>
              )}
              <div className="mt-2">
                <h4 className="text-lg font-bold font-heading">{plan.name}</h4>
                <div className="text-2xl font-bold text-primary my-2">
                  R$ {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <Button
                asChild
                variant={plan.highlight ? 'default' : 'outline'}
                className={cn(
                  'w-full rounded-full font-bold',
                  plan.highlight ? 'shadow-md' : '',
                )}
              >
                <Link to="/pedido" state={{ selectedPlan: plan }}>
                  {plan.cta || 'Escolher'}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Feature Rows */}
        <div className="divide-y divide-border">
          {allFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1.5fr_repeat(3,1fr)] hover:bg-muted/10 transition-colors"
            >
              <div className="p-4 px-6 flex items-center text-sm font-medium text-foreground/80">
                {feature}
              </div>
              {plans.map((plan) => {
                const hasFeature = plan.features?.some(
                  (f) => f.text === feature,
                )
                return (
                  <div
                    key={`${plan.id}-${idx}`}
                    className={cn(
                      'p-4 flex items-center justify-center',
                      plan.highlight ? 'bg-primary/5' : '',
                    )}
                  >
                    {hasFeature ? (
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-muted-foreground/50">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
