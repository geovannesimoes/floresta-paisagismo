import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  ArrowRightLeft,
  CheckCircle2,
  ImageIcon,
  Leaf,
  Hammer,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { projectsService, Project } from '@/services/projectsService'

export default function ProjetoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'after' | 'before' | 'split'>(
    'after',
  )

  useEffect(() => {
    const loadProject = async () => {
      if (id) {
        setLoading(true)
        const { data } = await projectsService.getProjectById(id)
        if (data) {
          setProject(data)
        }
        setLoading(false)
      }
    }
    loadProject()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

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

  const beforeImage = project.media?.find((m) => m.type === 'before')?.url
  const afterImage =
    project.media?.find((m) => m.type === 'after')?.url ||
    project.media?.[0]?.url
  const galleryImages =
    project.media?.filter(
      (m) =>
        m.type === 'gallery' || (m.url !== beforeImage && m.url !== afterImage),
    ) || []

  const hasComparison = !!beforeImage && !!afterImage

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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Comparison Section */}
            {hasComparison ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Transformação
                  </h2>
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
                      <div className="w-1/2 h-full relative border-r border-white/20 overflow-hidden">
                        <img
                          src={beforeImage}
                          alt="Antes"
                          className="w-full h-full object-cover object-left"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute top-4 left-4 bg-black/50 text-white border-none"
                        >
                          Antes
                        </Badge>
                      </div>
                      <div className="w-1/2 h-full relative overflow-hidden">
                        <img
                          src={afterImage}
                          alt="Depois"
                          className="w-full h-full object-cover object-right"
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
                        src={viewMode === 'after' ? afterImage : beforeImage}
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
              </div>
            ) : (
              // If no comparison, just show main image
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={afterImage || beforeImage}
                  alt={project.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Galeria de Fotos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <Dialog key={idx}>
                      <DialogTrigger asChild>
                        <div className="aspect-square relative rounded-lg overflow-hidden cursor-zoom-in group bg-gray-100 border">
                          <img
                            src={img.url}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                          {/* Tags for Plants/Materials if available */}
                          {(img.plants_used || img.materials_used) && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                              {img.plants_used && (
                                <div className="truncate">
                                  <Leaf className="inline w-3 h-3 mr-1" />
                                  {img.plants_used}
                                </div>
                              )}
                              {img.materials_used && (
                                <div className="truncate">
                                  <Hammer className="inline w-3 h-3 mr-1" />
                                  {img.materials_used}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none">
                        <div className="relative w-full h-[80vh] flex flex-col items-center justify-center">
                          <img
                            src={img.url}
                            alt="Detalhe"
                            className="max-w-full max-h-[90%] rounded-lg shadow-2xl object-contain mb-4"
                          />
                          {(img.plants_used || img.materials_used) && (
                            <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-full shadow-xl flex gap-6 text-sm">
                              {img.plants_used && (
                                <div className="flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-gray-700">
                                    Plantas:
                                  </span>
                                  <span>{img.plants_used}</span>
                                </div>
                              )}
                              {img.materials_used && (
                                <div className="flex items-center gap-2 border-l pl-6 border-gray-300">
                                  <Hammer className="h-4 w-4 text-stone-600" />
                                  <span className="font-semibold text-gray-700">
                                    Materiais:
                                  </span>
                                  <span>{img.materials_used}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-24">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(
                      project.created_at || Date.now(),
                    ).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <Separator className="mb-6" />
                <div className="prose prose-stone max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
              </div>

              {project.client_name && (
                <div className="mt-8 bg-muted/20 p-4 rounded-lg border">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Cliente
                  </span>
                  <p className="font-medium">{project.client_name}</p>
                </div>
              )}

              <div className="bg-accent/20 rounded-xl p-6 border border-accent mt-8">
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

              <div className="bg-primary/5 rounded-xl p-6 text-center space-y-4 mt-8">
                <h3 className="font-bold text-lg">Gostou deste resultado?</h3>
                <p className="text-sm text-muted-foreground">
                  Podemos fazer o mesmo pelo seu espaço. Escolha um plano e
                  comece hoje mesmo.
                </p>
                <Button
                  asChild
                  className="w-full font-bold shadow-lg"
                  size="lg"
                >
                  <Link to="/planos">Transformar meu Espaço</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
