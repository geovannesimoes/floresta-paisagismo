import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  beforeImage: string
  afterImage: string
  title: string
  description: string
  type?: string
  disableHover?: boolean
}

export function ProjectCard({
  beforeImage,
  afterImage,
  title,
  description,
  type,
  disableHover = false,
}: ProjectCardProps) {
  const [showAfter, setShowAfter] = useState(true)

  // Use placeholders if images are missing to prevent broken UI
  const safeBefore =
    beforeImage ||
    'https://img.usecurling.com/p/600/400?q=no%20image&color=gray'
  const safeAfter =
    afterImage ||
    'https://img.usecurling.com/p/600/400?q=no%20image&color=white'

  return (
    <Card className="overflow-hidden border-none shadow-elevation group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div
        className="relative h-64 overflow-hidden bg-gray-100"
        onMouseEnter={() => !disableHover && setShowAfter(false)}
        onMouseLeave={() => !disableHover && setShowAfter(true)}
      >
        {/* After Image (Default Visible) */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500 ease-in-out',
            showAfter ? 'opacity-100' : 'opacity-0',
          )}
        >
          <img
            src={safeAfter}
            alt={`Depois - ${title}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <Badge className="absolute top-4 right-4 bg-primary text-white hover:bg-primary z-10">
            Depois
          </Badge>
        </div>

        {/* Before Image (Hover Visible) */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500 ease-in-out',
            showAfter ? 'opacity-0' : 'opacity-100',
          )}
        >
          <img
            src={safeBefore}
            alt={`Antes - ${title}`}
            className="w-full h-full object-cover"
          />
          <Badge variant="secondary" className="absolute top-4 left-4 z-10">
            Antes
          </Badge>
        </div>

        {!disableHover && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <ArrowRightLeft className="h-3 w-3" /> Compare
          </div>
        )}
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        {type && (
          <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
            {type}
          </p>
        )}
        <h3 className="text-xl font-heading font-bold mb-2 text-foreground line-clamp-2">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
          {description}
        </p>
        <div className="mt-auto pt-2 text-primary font-medium text-sm group-hover:underline">
          Ver detalhes do projeto &rarr;
        </div>
      </CardContent>
    </Card>
  )
}
