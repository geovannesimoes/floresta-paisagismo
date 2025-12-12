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
}

export function ProjectCard({
  beforeImage,
  afterImage,
  title,
  description,
  type,
}: ProjectCardProps) {
  const [showAfter, setShowAfter] = useState(true)

  return (
    <Card className="overflow-hidden border-none shadow-elevation group hover:shadow-xl transition-all duration-300">
      <div
        className="relative h-64 overflow-hidden cursor-pointer"
        onMouseEnter={() => setShowAfter(false)}
        onMouseLeave={() => setShowAfter(true)}
        onClick={() => setShowAfter(!showAfter)}
      >
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500 ease-in-out',
            showAfter ? 'opacity-100' : 'opacity-0',
          )}
        >
          <img
            src={afterImage}
            alt={`Depois - ${title}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <Badge className="absolute top-4 right-4 bg-primary text-white hover:bg-primary">
            Depois
          </Badge>
        </div>
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500 ease-in-out',
            showAfter ? 'opacity-0' : 'opacity-100',
          )}
        >
          <img
            src={beforeImage}
            alt={`Antes - ${title}`}
            className="w-full h-full object-cover"
          />
          <Badge variant="secondary" className="absolute top-4 left-4">
            Antes
          </Badge>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightLeft className="h-3 w-3" /> Compare
        </div>
      </div>
      <CardContent className="p-6">
        {type && (
          <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
            {type}
          </p>
        )}
        <h3 className="text-xl font-heading font-bold mb-2 text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
