import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Planos() {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Plano Essencial',
      price: 'R$ 497,00',
      description: 'Indicado para projetos menores e rápidos.',
      features: [
        'Análise das fotos',
        'Projeto paisagístico 2D',
        'Sugestão de plantas',
        '1 versão do projeto',
        'Entrega digital em PDF',
        'Prazo até 7 dias',
      ],
      highlight: false,
      cta: 'Escolher Essencial',
    },
    {
      name: 'Plano Completo',
      price: 'R$ 897,00',
      description: 'O mais escolhido para um design completo!',
      features: [
        'Tudo do Essencial',
        'Projeto detalhado e realista',
        'Lista de compras de plantas',
        '1 rodada de ajustes',
        'Guia de manutenção básica',
        'Entrega digital em alta resolução',
        'Prazo até 7 dias',
      ],
      highlight: true,
      cta: 'Escolher Completo',
    },
    {
      name: 'Plano Premium',
      price: 'R$ 1.497,00',
      description: 'Experiência exclusiva e prioridade total.',
      features: [
        'Tudo do Completo',
        'Projeto elaborado com 3D',
        'Até 2 rodadas de ajustes',
        'Suporte direto via WhatsApp',
        'Prioridade na fila de produção',
        'Guia completo de plantio',
        'Prazo até 7 dias',
      ],
      highlight: false,
      cta: 'Escolher Premium',
    },
  ]

  const handleSelectPlan = (planName: string) => {
    navigate('/pedido', { state: { selectedPlan: planName } })
  }

  return (
    <div className="pt-24 pb-16 bg-accent/20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-muted-foreground text-lg">
            Investimento único para valorizar seu imóvel para sempre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 flex flex-col h-full hover:shadow-2xl transition-all duration-300 ${plan.highlight ? 'border-primary shadow-xl scale-105 z-10' : 'border-transparent shadow-md'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-highlight text-forest px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                  Mais Escolhido
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground h-10">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="flex-grow text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm"> /único</span>
                </div>

                <ul className="space-y-3 text-left max-w-xs mx-auto">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-foreground/80"
                    >
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className={`w-full text-lg h-12 ${plan.highlight ? 'bg-primary hover:bg-forest' : 'bg-forest hover:bg-primary'}`}
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
