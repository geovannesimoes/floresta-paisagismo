import { Button } from '@/components/ui/button'
import { useSeo } from '@/hooks/use-seo'
import { PricingCards } from '@/components/PricingCards'

export default function Planos() {
  useSeo({
    title: 'Nossos Planos | Floresta Paisagismo',
    description:
      'Escolha o plano ideal para o seu projeto de paisagismo. Opções acessíveis com entrega rápida e suporte especializado.',
  })

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

        <PricingCards />

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
