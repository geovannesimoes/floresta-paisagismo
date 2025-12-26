import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, ArrowRightLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useStore, FeaturedProject } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function ProjetoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { config } = useStore()
  const [project, setProject] = useState<FeaturedProject | null>(null)
  const [viewMode, setViewMode] = useState<'after' | 'before' | 'split'>(
    'after',
  )

  useEffect(() => {
    if (id && config.featuredProjects) {
      const found = config.featuredProjects.find((p) => p.id === id)
      if (found) {
        setProject(found)
      }
    }
  }, [id, config.featuredProjects])

  if (!project && !id) return null

  if (!project) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-4">Projeto não encontrado</h1>
        <p className="text-muted-foreground mb-8">
          O projeto que você está procurando não existe ou foi removido.
        </p>
        <Button asChild>
          <Link to="/projetos">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Projetos
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background animate-fade-in">
      {/* Breadcrumb / Back Navigation */}
      <div className="container mx-auto px-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/projetos')}
          className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Galeria
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content (Images) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold">Visualização</h2>
              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('before')}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                    viewMode === 'before'
                      ? 'bg-white shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Antes
                </button>
                <button
                  onClick={() => setViewMode('after')}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                    viewMode === 'after'
                      ? 'bg-white shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Depois
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                    viewMode === 'split'
                      ? 'bg-white shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Comparar
                </button>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-100 aspect-video ring-1 ring-border/50">
              {viewMode === 'split' ? (
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 h-full relative border-r border-white/20">
                    <img
                      src={project.before}
                      alt="Antes"
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute top-4 left-4 bg-black/50 text-white border-none"
                    >
                      Antes
                    </Badge>
                  </div>
                  <div className="w-1/2 h-full relative">
                    <img
                      src={project.after}
                      alt="Depois"
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 right-4">Depois</Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/30">
                      <ArrowRightLeft className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative animate-fade-in">
                  <img
                    src={viewMode === 'after' ? project.after : project.before}
                    alt={viewMode === 'after' ? 'Depois' : 'Antes'}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className={cn(
                      'absolute top-4 left-4 text-white border-none',
                      viewMode === 'after' ? 'bg-primary' : 'bg-black/50',
                    )}
                  >
                    {viewMode === 'after'
                      ? 'Resultado Final'
                      : 'Situação Original'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="hidden sm:grid grid-cols-2 gap-4">
              <div
                className={cn(
                  'cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                  viewMode === 'before'
                    ? 'border-primary opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
                onClick={() => setViewMode('before')}
              >
                <img
                  src={project.before}
                  alt="Miniatura Antes"
                  className="w-full h-24 object-cover"
                />
                <p className="text-center text-xs py-1 bg-muted font-medium">
                  Antes
                </p>
              </div>
              <div
                className={cn(
                  'cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                  viewMode === 'after'
                    ? 'border-primary opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
                onClick={() => setViewMode('after')}
              >
                <img
                  src={project.after}
                  alt="Miniatura Depois"
                  className="w-full h-24 object-cover"
                />
                <p className="text-center text-xs py-1 bg-muted font-medium">
                  Depois
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Projeto Realizado</span>
              </div>
              <Separator className="mb-6" />
              <div className="prose prose-stone max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="bg-accent/20 rounded-xl p-6 border border-accent">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Destaques do Projeto
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Design personalizado para o ambiente</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Otimização de espaço e funcionalidade</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Seleção de plantas adequadas ao clima</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 rounded-xl p-6 text-center space-y-4">
              <h3 className="font-bold text-lg">Gostou deste resultado?</h3>
              <p className="text-sm text-muted-foreground">
                Podemos fazer o mesmo pelo seu espaço. Escolha um plano e comece
                hoje mesmo.
              </p>
              <Button asChild className="w-full font-bold shadow-lg" size="lg">
                <Link to="/planos">Transformar meu Espaço</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
