import { ProjectCard } from '@/components/ProjectCard'

export default function Projetos() {
  const projects = [
    {
      title: 'Jardim de Inverno Luxuoso',
      type: 'Interior',
      description:
        'Um espaço morto sob a escada transformado em um jardim de inverno vibrante.',
      before:
        'https://img.usecurling.com/p/600/400?q=empty%20under%20stairs&color=gray',
      after:
        'https://img.usecurling.com/p/600/400?q=indoor%20garden%20under%20stairs',
    },
    {
      title: 'Quintal para Família',
      type: 'Residencial',
      description: 'Criação de área de lazer segura para crianças e pets.',
      before:
        'https://img.usecurling.com/p/600/400?q=messy%20backyard&color=gray',
      after:
        'https://img.usecurling.com/p/600/400?q=family%20backyard%20playground',
    },
    {
      title: 'Fachada Comercial',
      type: 'Comercial',
      description:
        'Paisagismo para entrada de escritório de advocacia, transmitindo seriedade e elegância.',
      before:
        'https://img.usecurling.com/p/600/400?q=office%20entrance&color=gray',
      after:
        'https://img.usecurling.com/p/600/400?q=modern%20office%20landscaping',
    },
    {
      title: 'Terraço Gourmet',
      type: 'Apartamento',
      description: 'Otimização de espaço em varanda de apartamento pequeno.',
      before:
        'https://img.usecurling.com/p/600/400?q=empty%20terrace&color=gray',
      after: 'https://img.usecurling.com/p/600/400?q=terrace%20garden%20bbq',
    },
    {
      title: 'Piscina Tropical',
      type: 'Residencial',
      description:
        'Revitalização da área da piscina com palmeiras e plantas tropicais.',
      before:
        'https://img.usecurling.com/p/600/400?q=pool%20area%20empty&color=gray',
      after:
        'https://img.usecurling.com/p/600/400?q=pool%20area%20tropical%20plants',
    },
    {
      title: 'Jardim Zen',
      type: 'Residencial',
      description: 'Criação de espaço para meditação e relaxamento.',
      before: 'https://img.usecurling.com/p/600/400?q=dirt%20patch&color=gray',
      after: 'https://img.usecurling.com/p/600/400?q=zen%20garden%20rocks',
    },
  ]

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Nossos Projetos Realizados
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore nossa galeria e veja como transformamos diferentes tipos de
            espaços.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProjectCard
                title={project.title}
                type={project.type}
                description={project.description}
                beforeImage={project.before}
                afterImage={project.after}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
