import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Camera,
  ArrowRight,
  Leaf,
  Sprout,
  TreePine,
  Image as ImageIcon,
  Check,
} from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'

import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/ProjectCard'
import { projectsService, Project } from '@/services/projectsService'
import { plansService, Plan } from '@/services/plansService'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { useSeo } from '@/hooks/use-seo'
import { heroSlidesService, HeroSlide } from '@/services/heroSlidesService'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

export default function Index() {
  const { settings } = useSiteSettings()

  useSeo({
    title: `${settings?.company_name || 'Floresta Paisagismo'} | Projetos Paisagísticos`,
    description:
      settings?.hero_subtitle ||
      'Transforme seu jardim com projetos de paisagismo online.',
    canonical: window.location.origin,
  })

  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [activePlans, setActivePlans] = useState<Plan[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])

  useEffect(() => {
    const loadData = async () => {
      // Load Projects
      const { data: projectsData } = await projectsService.getProjects(true)
      if (projectsData) {
        setFeaturedProjects(projectsData)
      }

      // Load Plans
      const { data: plansData } = await plansService.getPlans(true)
      if (plansData) {
        setActivePlans(plansData)
      }

      // Load Hero Slides
      const { data: slidesData } = await heroSlidesService.getSlides(true)
      if (slidesData) {
        setHeroSlides(slidesData)
      }
    }
    loadData()
  }, [])

  // Helper to extract before/after from media array
  const getProjectImages = (project: Project) => {
    const before = project.media?.find((m) => m.type === 'before')?.url || ''
    const after =
      project.media?.find((m) => m.type === 'after')?.url ||
      project.media?.[0]?.url ||
      ''
    return { before, after }
  }

  // 3-Step Visual Guide
  const steps = [
    {
      icon: <Leaf className="h-10 w-10 text-primary" />,
      title: '1. Escolha seu Plano',
      desc: 'Selecione o pacote ideal para o seu espaço e orçamento, com opções simples ou completas.',
    },
    {
      icon: <Camera className="h-10 w-10 text-primary" />,
      title: '2. Envie suas Fotos',
      desc: 'Compartilhe fotos e medidas do seu ambiente para criarmos algo sob medida.',
    },
    {
      icon: <Sprout className="h-10 w-10 text-primary" />,
      title: '3. Receba o Projeto',
      desc: 'Em poucos dias, receba seu projeto completo com lista de plantas e instruções.',
    },
  ]

  const showCarousel = heroSlides.length > 0
  const fallbackHeroImage =
    settings?.hero_image_url ||
    'https://img.usecurling.com/p/1920/1080?q=luxury%20tropical%20garden&dpr=2'

  return (
    <div className="flex flex-col bg-background font-body">
      {/* 1. Hero Section (Background Carousel + Static Overlay) */}
      <section className="relative min-h-[90vh] overflow-hidden flex items-center justify-center">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          {showCarousel ? (
            <Carousel
              opts={{
                loop: true,
                duration: 60,
                watchDrag: false, // Disable user drag for background
              }}
              plugins={[Autoplay({ delay: 5000 }), Fade()]}
              className="w-full h-full"
            >
              <CarouselContent className="h-[90vh] ml-0">
                {heroSlides.map((slide) => (
                  <CarouselItem key={slide.id} className="pl-0 h-full w-full">
                    <img
                      src={slide.image_url}
                      alt="Background"
                      className="w-full h-full object-cover brightness-[0.55]"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <img
              src={fallbackHeroImage}
              alt="Background"
              className="w-full h-full object-cover brightness-[0.55]"
            />
          )}
        </div>

        {/* Content Overlay Layer (Static) */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white pt-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-8 animate-fade-in-up leading-tight tracking-tight">
            {settings?.hero_title || (
              <>
                Seu refúgio particular <br className="hidden md:block" />
                começa com um bom projeto
              </>
            )}
          </h1>
          <p className="text-lg md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto animate-fade-in-up delay-100 font-light leading-relaxed">
            {settings?.hero_subtitle || (
              <>
                Paisagismo profissional, 100% online e acessível.
                <br />
                Transformamos seu espaço em um ambiente vivo e acolhedor.
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-200">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white text-lg h-16 px-10 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold tracking-wide"
            >
              <Link to={settings?.hero_button_link || '/planos'}>
                {settings?.hero_button_text || 'Começar Transformação'}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-lg h-16 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              <Link to="/projetos">Ver Portfólio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Como Funciona
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              Simplicidade e eficiência para tirar seu sonho do papel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-8 p-6 bg-accent/30 rounded-3xl text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm border border-accent/50">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 font-heading text-foreground">
                  {step.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed px-4">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-20">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 h-12 text-base transition-all duration-300"
            >
              <Link to="/planos" className="flex items-center gap-2">
                Conhecer Detalhes dos Planos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Featured Projects */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
                Projetos em Destaque
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Inspire-se com transformações reais projetadas por nossa equipe.
              </p>
            </div>
            <Button
              asChild
              variant="link"
              className="text-primary text-lg font-semibold hover:text-primary/80 hidden md:inline-flex"
            >
              <Link to="/projetos" className="flex items-center gap-2">
                Ver galeria completa <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.slice(0, 3).map((project, index) => {
              const { before, after } = getProjectImages(project)
              return (
                <Link
                  key={project.id}
                  to={`/projetos/${project.id}`}
                  className="block group hover:no-underline transform hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="aspect-[4/3] w-full">
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      beforeImage={before}
                      afterImage={after}
                    />
                  </div>
                </Link>
              )
            })}

            {featuredProjects.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-2xl shadow-sm border border-border">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                  Carregando projetos incríveis...
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-12 md:hidden">
            <Button asChild variant="default" className="w-full">
              <Link to="/projetos">Ver galeria completa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Final CTA */}
      <section
        className="py-32 bg-primary text-white relative overflow-hidden"
        style={
          settings?.cta_background_image_url
            ? {
                backgroundImage: `url(${settings.cta_background_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        {/* Background Pattern or Overlay */}
        <div
          className={
            settings?.cta_background_image_url
              ? 'absolute inset-0 bg-black/60 z-0'
              : 'absolute inset-0 opacity-10 pointer-events-none'
          }
        >
          {!settings?.cta_background_image_url && (
            <>
              <TreePine className="absolute -bottom-12 -left-12 w-96 h-96" />
              <TreePine className="absolute top-12 right-12 w-64 h-64 rotate-12" />
            </>
          )}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">
            {settings?.cta_title || 'Pronto para transformar seu espaço?'}
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            {settings?.cta_text ||
              'Não deixe para depois. Tenha o jardim dos seus sonhos com um projeto profissional, acessível e feito para você.'}
          </p>

          {/* Plans Summary in CTA */}
          {activePlans.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {activePlans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left flex flex-col"
                >
                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <div className="text-2xl font-bold mb-4">
                    R$ {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
                  </div>
                  <ul className="space-y-2 mb-6 text-sm opacity-90 flex-grow">
                    {/* Show ALL features as per requirement */}
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full bg-white text-primary hover:bg-white/90 font-bold mt-auto"
                  >
                    <Link to={`/pedido?plan=${plan.slug}`}>
                      Escolher {plan.name}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-primary font-bold text-xl h-16 px-12 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <Link to={settings?.cta_button_link || '/planos'}>
              {settings?.cta_button_text || 'Ver todos os Planos'}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
