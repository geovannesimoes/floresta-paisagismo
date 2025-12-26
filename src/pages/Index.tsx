import { Link } from 'react-router-dom'
import { Check, Camera, CreditCard, Download, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/ProjectCard'
import { useStore } from '@/lib/store'

export default function Index() {
  const { config } = useStore()

  const steps = [
    {
      icon: <Check className="h-8 w-8 text-primary" />,
      title: '1. Escolha o plano',
      desc: 'Selecione o pacote que melhor atende às suas necessidades.',
    },
    {
      icon: <Camera className="h-8 w-8 text-primary" />,
      title: '2. Envie fotos',
      desc: 'Compartilhe fotos e detalhes do seu espaço para personalizarmos o projeto.',
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: '3. Pagamento Seguro',
      desc: 'Pague via Pix ou Cartão para iniciarmos seu projeto.',
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: '4. Receba e Baixe',
      desc: 'Acesse seu projeto finalizado em até 7 dias e baixe as imagens.',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={config.heroImage}
            alt="Jardim exuberante"
            className="w-full h-full object-cover brightness-[0.6]"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white pt-20">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 animate-fade-in-up leading-tight">
            Transforme seu imóvel com um <br className="hidden md:block" />
            projeto paisagístico sob medida
          </h1>
          <p className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl mx-auto animate-fade-in-up delay-100">
            Designs personalizados que trazem vida, valorização e beleza ao seu
            espaço, entregues 100% online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-forest text-white text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Link to="/planos">Escolher meu plano</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-lg h-14 px-8 rounded-full shadow-lg hover:scale-105 transition-all"
            >
              <Link to="/projetos">Ver projetos reais</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-accent/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Projetos em Destaque
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Confira algumas das transformações incríveis que realizamos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.featuredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  beforeImage={project.before}
                  afterImage={project.after}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="link" className="text-primary text-lg">
              <Link to="/projetos" className="flex items-center gap-2">
                Ver todos os projetos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground">
              Seu novo jardim em 4 passos simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl border border-border hover:shadow-lg transition-shadow bg-card"
              >
                <div className="mb-6 p-4 bg-primary/10 rounded-full text-primary">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-forest text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Pronto para transformar seu espaço?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Não deixe para depois. Tenha o jardim dos seus sonhos com um projeto
            profissional e acessível.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-highlight text-forest hover:bg-yellow-400 font-bold text-lg h-14 px-10 rounded-full shadow-xl hover:scale-105 transition-all"
          >
            <Link to="/planos">Começar Agora</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
