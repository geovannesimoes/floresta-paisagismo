import { useEffect } from 'react'

interface SeoProps {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: string
}

export function useSeo({
  title,
  description = 'Transforme seu jardim com projetos de paisagismo online. Profissionais especializados, entrega rápida e planos acessíveis.',
  canonical,
  ogImage = 'https://img.usecurling.com/p/1200/630?q=landscape%20garden%20design&dpr=2',
  ogType = 'website',
}: SeoProps) {
  useEffect(() => {
    // Update Title
    document.title = title

    // Update Meta Tags
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: canonical || window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ]

    metaTags.forEach((tag) => {
      let element: HTMLMetaElement | null

      if (tag.name) {
        element = document.querySelector(`meta[name="${tag.name}"]`)
      } else {
        element = document.querySelector(`meta[property="${tag.property}"]`)
      }

      if (element) {
        element.setAttribute('content', tag.content)
      } else {
        element = document.createElement('meta')
        if (tag.name) element.setAttribute('name', tag.name)
        if (tag.property) element.setAttribute('property', tag.property)
        element.setAttribute('content', tag.content)
        document.head.appendChild(element)
      }
    })

    // Update Canonical Link
    let link = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      if (link) {
        link.setAttribute('href', canonical)
      } else {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        link.setAttribute('href', canonical)
        document.head.appendChild(link)
      }
    }

    return () => {
      // Cleanup if necessary, though usually not needed for SEO tags as they get overwritten
    }
  }, [title, description, canonical, ogImage, ogType])
}
