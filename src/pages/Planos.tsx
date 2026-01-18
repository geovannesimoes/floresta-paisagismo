import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSeo } from '@/hooks/use-seo'
import { plansService, Plan } from '@/services/plansService'
import { PlanComparisonTable } from '@/components/PlanComparisonTable'

export default function Planos() {
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

  return (
    <div className="pt-32 pb-24 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Invista no seu bem-estar
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">
            Planos transparentes, sem custos ocultos. Compare as opções e
            escolha o nível de detalhe que você precisa.
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
          <div className="max-w-7xl mx-auto">
            <PlanComparisonTable plans={plans} />
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
