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
  photos: string[] // Base64 or URLs
  status: OrderStatus
  paymentId?: string
  createdAt: string
  finalImages?: { title: string; url: string }[]
}

const STORE_KEY = 'floresta_db_v1'

const initialOrders: Order[] = [
  {
    id: 'DEMO-1234',
    clientName: 'Cliente Demo',
    clientEmail: 'demo@floresta.com',
    clientWhatsapp: '(11) 99999-9999',
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
]

export const useStore = () => {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORE_KEY)
    if (stored) {
      setOrders(JSON.parse(stored))
    } else {
      localStorage.setItem(STORE_KEY, JSON.stringify(initialOrders))
      setOrders(initialOrders)
    }
  }, [])

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders)
    localStorage.setItem(STORE_KEY, JSON.stringify(newOrders))
  }

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'Recebido', // Immediately 'Recebido' then 'Aguardando Pagamento' usually
    }
    saveOrders([newOrder, ...orders])
    return newOrder
  }

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const newOrders = orders.map((o) => (o.id === id ? { ...o, status } : o))
    saveOrders(newOrders)
  }

  const updateOrderPayment = (id: string, paymentId: string) => {
    const newOrders = orders.map((o) =>
      o.id === id
        ? { ...o, paymentId, status: 'Aguardando Pagamento' as OrderStatus }
        : o,
    )
    saveOrders(newOrders)
  }

  const updateOrderFinalImages = (
    id: string,
    images: { title: string; url: string }[],
  ) => {
    const newOrders = orders.map((o) =>
      o.id === id ? { ...o, finalImages: images } : o,
    )
    saveOrders(newOrders)
  }

  const getOrder = (id: string) => orders.find((o) => o.id === id)

  return {
    orders,
    addOrder,
    updateOrderStatus,
    updateOrderPayment,
    updateOrderFinalImages,
    getOrder,
  }
}
