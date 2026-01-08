import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Loader2 } from 'lucide-react'
import { projectsService, Project } from '@/services/projectsService'

export default function Projetos() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      const { data } = await projectsService.getProjects()
      if (data) {
        setProjects(data)
      }
      setLoading(false)
    }
    loadProjects()
  }, [])

  const getProjectImages = (project: Project) => {
    const before = project.media?.find((m) => m.type === 'before')?.url || ''
    const after =
      project.media?.find((m) => m.type === 'after')?.url ||
      project.media?.[0]?.url ||
      ''
    return { before, after }
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <Badge
            variant="outline"
            className="px-4 py-1 border-primary/20 text-primary bg-primary/5 mb-2"
          >
            Portfólio
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
            Nossos Projetos Realizados
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore nossa galeria e veja como transformamos diferentes tipos de
            espaços em ambientes vivos e acolhedores.
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {projects.map((project, index) => {
              const { before, after } = getProjectImages(project)
              return (
                <Link
                  key={project.id}
                  to={`/projetos/${project.id}`}
                  className="block h-full animate-fade-in-up hover:no-underline"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    beforeImage={before}
                    afterImage={after}
                  />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl mb-16">
            <h3 className="text-xl font-bold text-muted-foreground">
              Nenhum projeto em destaque no momento.
            </h3>
            <p className="text-muted-foreground">
              Volte em breve para ver novidades.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-forest text-white rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Inspire-se e comece sua transformação
            </h2>
            <p className="text-white/80 text-lg mb-10">
              Cada projeto é único, assim como o seu espaço. Deixe nossa equipe
              de especialistas criar o jardim perfeito para você.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-highlight text-forest hover:bg-yellow-400 font-bold text-lg h-14 px-10 rounded-full shadow-xl hover:scale-105 transition-all"
            >
              <Link to="/planos">
                Ver Planos e Preços <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
