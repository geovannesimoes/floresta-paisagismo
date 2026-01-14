import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { useSeo } from '@/hooks/use-seo'
import { plansService, Plan } from '@/services/plansService'

export default function Planos() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useSeo({
    title: 'Nossos Planos | Floresta Paisagismo',
    description:
      'Escolha o plano ideal para o seu projeto de paisagismo. Opções acessíveis com entrega rápida e suporte especializado.',
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    const { data } = await plansService.getPlans(true)
    if (data) setPlans(data)
    setLoading(false)
  }

  const handleSelectPlan = (plan: Plan) => {
    navigate('/pedido', { state: { selectedPlan: plan } })
  }

  return (
    <div className="pt-32 pb-24 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Invista no seu bem-estar
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">
            Planos transparentes, sem custos ocultos. Escolha o nível de detalhe
            que você precisa.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow border">
            <h3 className="text-xl font-bold mb-2">Serviços Indisponíveis</h3>
            <p className="text-muted-foreground">
              No momento não há planos ativos para contratação. Por favor, volte
              mais tarde.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
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
                    Projeto {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground min-h-[40px] px-4">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="flex-grow text-center px-6">
                  <div className="mb-8 py-6 border-b border-border/50">
                    <span className="text-5xl font-bold text-primary">
                      R$ {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-muted-foreground text-sm block mt-2">
                      Pagamento único
                    </span>
                  </div>

                  <ul className="space-y-4 text-left">
                    {plan.features?.map((feature) => (
                      <li
                        key={feature.id}
                        className="flex items-start gap-3 text-sm text-foreground/80"
                      >
                        <div className="mt-0.5 p-0.5 rounded-full bg-primary/10 text-primary">
                          <Check className="h-3 w-3 shrink-0" />
                        </div>
                        <span className="leading-tight">{feature.text}</span>
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
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {plan.cta || 'Escolher'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-20 text-center bg-white p-8 rounded-2xl border border-border max-w-4xl mx-auto shadow-sm">
          <h3 className="text-xl font-bold mb-4">Dúvidas sobre o projeto?</h3>
          <p className="text-muted-foreground mb-6">
            Não tem certeza de qual plano é melhor para o seu espaço? Fale com
            nossa equipe.
          </p>
          <Button
            asChild
            variant="link"
            className="text-primary text-lg font-semibold"
          >
            <a
              href="https://wa.me/5564984536263"
              target="_blank"
              rel="noreferrer"
            >
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
