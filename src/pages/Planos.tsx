import { Link, useNavigate } from 'react-router-dom'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { useSeo } from '@/hooks/use-seo'

export default function Planos() {
  const navigate = useNavigate()

  useSeo({
    title: 'Nossos Planos | Floresta Paisagismo',
    description:
      'Escolha o plano ideal para o seu projeto de paisagismo. Opções acessíveis com entrega rápida e suporte especializado.',
  })

  const plans = [
    {
      name: 'Projeto Lírio',
      price: 'R$ 399,00',
      description: 'Ideal para pequenas renovações e consultas rápidas.',
      features: [
        'Análise detalhada das fotos',
        'Design paisagístico conceitual',
        'Sugestão de plantas ideais',
        '1 versão do projeto',
        'Entrega em PDF digital',
        'Prazo: até 7 dias úteis',
      ],
      highlight: false,
      cta: 'Escolher Lírio',
    },
    {
      name: 'Projeto Ipê',
      price: 'R$ 699,00',
      description: 'O equilíbrio perfeito para transformar seu espaço.',
      features: [
        'Tudo do Projeto Lírio',
        'Lista de compras completa',
        '1 rodada de revisão',
        'Guia de manutenção básico',
        'Entrega em alta resolução',
        'Prazo: até 7 dias úteis',
      ],
      highlight: true,
      cta: 'Escolher Ipê',
    },
    {
      name: 'Projeto Jasmim',
      price: 'R$ 999,00',
      description: 'Experiência premium e suporte dedicado.',
      features: [
        'Tudo do Projeto Ipê',
        '2 rodadas de revisão',
        'Suporte via WhatsApp',
        'Guia detalhado de plantio',
        'Prioridade na entrega',
        'Prazo: até 3 dias úteis',
      ],
      highlight: false,
      cta: 'Escolher Jasmim',
    },
  ]

  const handleSelectPlan = (planName: string) => {
    navigate('/pedido', { state: { selectedPlan: planName } })
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col h-full transition-all duration-300 ${
                plan.highlight
                  ? 'border-2 border-amber-400 shadow-xl scale-105 z-10 bg-white'
                  : 'border border-border shadow-sm hover:shadow-md bg-white/80'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-highlight text-forest px-6 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current" /> Recomendado
                </div>
              )}

              <CardHeader className="text-center pb-2 pt-8">
                <h3 className="text-2xl font-bold font-heading text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground min-h-[40px] px-4">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="flex-grow text-center px-6">
                <div className="mb-8 py-6 border-b border-border/50">
                  <span className="text-5xl font-bold text-forest">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm block mt-2">
                    Pagamento único
                  </span>
                </div>

                <ul className="space-y-4 text-left">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-foreground/80"
                    >
                      <div className="mt-0.5 p-0.5 rounded-full bg-green-100 text-primary">
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
                      ? 'bg-primary hover:bg-forest text-white hover:scale-105'
                      : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

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
