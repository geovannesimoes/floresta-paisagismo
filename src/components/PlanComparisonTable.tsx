import { Check, X, Star } from 'lucide-react'
import { Plan } from '@/services/plansService'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

interface PlanComparisonTableProps {
  plans: Plan[]
}

export function PlanComparisonTable({ plans }: PlanComparisonTableProps) {
  // 1. Analyze Feature Frequency
  const featureFrequency = new Map<string, number>()
  plans.forEach((plan) => {
    plan.features?.forEach((f) => {
      const count = featureFrequency.get(f.text) || 0
      featureFrequency.set(f.text, count + 1)
    })
  })

  // 2. Sort Features dynamically
  // Priority 1: Common to ALL plans
  // Priority 2: Common to SOME plans
  // Priority 3: Exclusive
  const allFeatures = Array.from(featureFrequency.keys()).sort((a, b) => {
    const freqA = featureFrequency.get(a) || 0
    const freqB = featureFrequency.get(b) || 0
    const totalPlans = plans.length

    const getPriority = (freq: number) => {
      if (freq === totalPlans) return 0 // Common to all
      if (freq > 1) return 1 // Common to some
      return 2 // Exclusive
    }

    const priorityA = getPriority(freqA)
    const priorityB = getPriority(freqB)

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // Alphabetical fallback
    return a.localeCompare(b)
  })

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-[800px] lg:min-w-full rounded-2xl border border-border/60 shadow-xl bg-white overflow-hidden ring-1 ring-black/5">
        {/* Header Row */}
        <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] bg-gradient-to-b from-stone-50 to-white border-b">
          <div className="p-8 flex flex-col justify-end">
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2">
              Comparativo Completo
            </span>
            <h3 className="text-2xl font-heading font-bold text-foreground">
              Escolha o ideal para você
            </h3>
          </div>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'p-6 text-center flex flex-col gap-4 relative transition-colors duration-300',
                plan.highlight ? 'bg-primary/5' : 'hover:bg-stone-50/50',
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg uppercase tracking-wide shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> Recomendado
                </div>
              )}
              <div className="mt-4">
                <h4 className="text-xl font-bold font-heading mb-1">
                  {plan.name}
                </h4>
                <div className="text-3xl font-bold text-primary my-3">
                  <span className="text-lg text-muted-foreground align-top font-normal mr-1">
                    R$
                  </span>
                  {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <Button
                asChild
                variant={plan.highlight ? 'default' : 'outline'}
                size="lg"
                className={cn(
                  'w-full rounded-full font-bold shadow-sm transition-all hover:scale-105',
                  plan.highlight
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/25'
                    : 'border-2 hover:border-primary hover:text-primary',
                )}
              >
                <Link to={`/pedido?plan=${plan.slug}`}>
                  {plan.cta || 'Escolher Plano'}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Feature Rows */}
        <div className="divide-y divide-border/60">
          {allFeatures.map((feature, idx) => {
            const freq = featureFrequency.get(feature) || 0
            const isCommon = freq === plans.length
            const isExclusive = freq === 1

            return (
              <div
                key={idx}
                className={cn(
                  'grid grid-cols-[1.5fr_repeat(3,1fr)] hover:bg-muted/30 transition-colors group',
                  isCommon ? 'bg-stone-50/30' : '',
                )}
              >
                <div className="p-4 px-8 flex items-center text-sm font-medium text-foreground/80 group-hover:text-foreground">
                  {feature}
                  {isExclusive && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 text-[10px] uppercase"
                    >
                      Exclusivo
                    </Badge>
                  )}
                </div>
                {plans.map((plan) => {
                  const hasFeature = plan.features?.some(
                    (f) => f.text === feature,
                  )
                  return (
                    <div
                      key={`${plan.id}-${idx}`}
                      className={cn(
                        'p-4 flex items-center justify-center border-l border-transparent group-hover:border-border/30',
                        plan.highlight ? 'bg-primary/5' : '',
                      )}
                    >
                      {hasFeature ? (
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm animate-in zoom-in duration-300">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-muted-foreground/20">
                          <X className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
