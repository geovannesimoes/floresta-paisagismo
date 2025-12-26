import { useState, useEffect } from 'react'

export type OrderStatus =
  | 'Recebido'
  | 'Aguardando Pagamento'
  | 'Em Produção'
  | 'Enviado'
  | 'Cancelado'

export interface Order {
  id: string
  clientName: string
  clientEmail: string
  clientWhatsapp: string
  propertyType: string
  dimensions?: string
  preferences?: string
  notes?: string
  plan: 'Essencial' | 'Completo' | 'Premium'
  photos: string[]
  status: OrderStatus
  paymentId?: string
  createdAt: string
  finalImages?: { title: string; url: string }[]
}

export interface FeaturedProject {
  id: string
  title: string
  description: string
  before: string
  after: string
  images?: string[]
}

export interface SiteConfig {
  heroImage: string
  featuredProjects: FeaturedProject[]
}

interface StoreData {
  orders: Order[]
  config: SiteConfig
}

const STORE_KEY = 'floresta_db_v3'

const defaultFeaturedProjects: FeaturedProject[] = [
  {
    id: '1',
    title: 'Oásis Urbano',
    description:
      'Transformação completa de um pequeno quintal cimentado em um refúgio tropical com deck de madeira.',
    before:
      'https://img.usecurling.com/p/600/400?q=empty%20concrete%20backyard&color=gray',
    after: 'https://img.usecurling.com/p/600/400?q=tropical%20garden%20deck',
    images: [
      'https://img.usecurling.com/p/600/400?q=tropical%20garden%20detail',
      'https://img.usecurling.com/p/600/400?q=wooden%20deck%20plants',
      'https://img.usecurling.com/p/600/400?q=garden%20lighting%20night',
    ],
  },
  {
    id: '2',
    title: 'Frente Moderna',
    description:
      'Valorização da fachada com paisagismo minimalista e iluminação estratégica.',
    before:
      'https://img.usecurling.com/p/600/400?q=plain%20house%20front&color=gray',
    after:
      'https://img.usecurling.com/p/600/400?q=modern%20landscaping%20front%20yard',
    images: [
      'https://img.usecurling.com/p/600/400?q=modern%20garden%20pathway',
      'https://img.usecurling.com/p/600/400?q=facade%20lighting',
    ],
  },
  {
    id: '3',
    title: 'Varanda Gourmet',
    description:
      'Integração da área de churrasqueira com jardim vertical e vasos ornamentais.',
    before: 'https://img.usecurling.com/p/600/400?q=empty%20balcony&color=gray',
    after: 'https://img.usecurling.com/p/600/400?q=balcony%20garden%20plants',
    images: [
      'https://img.usecurling.com/p/600/400?q=vertical%20garden%20detail',
      'https://img.usecurling.com/p/600/400?q=potted%20plants%20balcony',
    ],
  },
]

const initialData: StoreData = {
  orders: [
    {
      id: 'DEMO-1234',
      clientName: 'Cliente Demo',
      clientEmail: 'demo@floresta.com',
      clientWhatsapp: '(64) 99999-9999',
      propertyType: 'Casa',
      plan: 'Completo',
      photos: ['https://img.usecurling.com/p/400/300?q=backyard'],
      status: 'Enviado',
      createdAt: new Date().toISOString(),
      finalImages: [
        {
          title: 'Vista Aérea',
          url: 'https://img.usecurling.com/p/800/600?q=garden%20top%20view',
        },
        {
          title: 'Área de Lazer',
          url: 'https://img.usecurling.com/p/800/600?q=garden%20pool',
        },
        {
          title: 'Jardim Vertical',
          url: 'https://img.usecurling.com/p/800/600?q=vertical%20garden',
        },
      ],
    },
  ],
  config: {
    heroImage:
      'https://img.usecurling.com/p/1920/1080?q=lush%20garden%20luxury%20landscape&dpr=2',
    featuredProjects: defaultFeaturedProjects,
  },
}

export const useStore = () => {
  const [data, setData] = useState<StoreData>(initialData)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Robustness check
        if (!parsed.config) {
          setData({ ...parsed, config: initialData.config })
        } else {
          // Ensure featuredProjects exists and is array
          if (!Array.isArray(parsed.config.featuredProjects)) {
            parsed.config.featuredProjects = initialData.config.featuredProjects
          }
          setData(parsed)
        }
      } catch (e) {
        console.error('Failed to parse store', e)
        setData(initialData)
      }
    } else {
      localStorage.setItem(STORE_KEY, JSON.stringify(initialData))
      setData(initialData)
    }
    setIsInitialized(true)
  }, [])

  const saveData = (newData: StoreData) => {
    setData(newData)
    localStorage.setItem(STORE_KEY, JSON.stringify(newData))
  }

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'Recebido',
    }
    saveData({ ...data, orders: [newOrder, ...data.orders] })
    return newOrder
  }

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const newOrders = data.orders.map((o) =>
      o.id === id ? { ...o, status } : o,
    )
    saveData({ ...data, orders: newOrders })
  }

  const updateOrderPayment = (id: string, paymentId: string) => {
    const newOrders = data.orders.map((o) =>
      o.id === id
        ? { ...o, paymentId, status: 'Aguardando Pagamento' as OrderStatus }
        : o,
    )
    saveData({ ...data, orders: newOrders })
  }

  const updateOrderFinalImages = (
    id: string,
    images: { title: string; url: string }[],
  ) => {
    const newOrders = data.orders.map((o) =>
      o.id === id ? { ...o, finalImages: images } : o,
    )
    saveData({ ...data, orders: newOrders })
  }

  const getOrder = (id: string) => data.orders.find((o) => o.id === id)

  // CMS Actions
  const updateHeroImage = (url: string) => {
    saveData({ ...data, config: { ...data.config, heroImage: url } })
  }

  const addFeaturedProject = (project: Omit<FeaturedProject, 'id'>) => {
    const newProject = {
      ...project,
      id: Math.random().toString(36).substring(2, 9),
    }
    saveData({
      ...data,
      config: {
        ...data.config,
        featuredProjects: [...data.config.featuredProjects, newProject],
      },
    })
  }

  const updateFeaturedProject = (project: FeaturedProject) => {
    const newProjects = data.config.featuredProjects.map((p) =>
      p.id === project.id ? project : p,
    )
    saveData({
      ...data,
      config: { ...data.config, featuredProjects: newProjects },
    })
  }

  const removeFeaturedProject = (id: string) => {
    const newProjects = data.config.featuredProjects.filter((p) => p.id !== id)
    saveData({
      ...data,
      config: { ...data.config, featuredProjects: newProjects },
    })
  }

  return {
    orders: data.orders,
    config: data.config,
    isInitialized,
    addOrder,
    updateOrderStatus,
    updateOrderPayment,
    updateOrderFinalImages,
    getOrder,
    updateHeroImage,
    addFeaturedProject,
    updateFeaturedProject,
    removeFeaturedProject,
  }
}
