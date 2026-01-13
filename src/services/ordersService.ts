import { supabase } from '@/lib/supabase/client'

export interface Order {
  id: string
  display_id: number
  code: string
  client_name: string
  client_email: string
  client_whatsapp: string
  property_type: string
  dimensions?: string
  preferences?: string
  notes?: string
  plan: string
  status: string
  created_at: string
  photos?: OrderPhoto[]
  deliverables?: OrderDeliverable[]
  revisions?: RevisionRequest[]
}

export interface OrderPhoto {
  id: string
  order_id: string
  url: string
  created_at: string
}

export interface OrderDeliverable {
  id: string
  order_id: string
  title: string
  url: string
  type: string
  created_at: string
}

export interface RevisionRequest {
  id: string
  order_id: string
  description: string
  status: string
  created_at: string
}

const generateOrderCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const ordersService = {
  async createOrder(order: Partial<Order>) {
    // Retry logic to ensure unique code generation
    let attempts = 0
    const maxAttempts = 3
    let savedOrder: Order | null = null
    let lastError = null

    while (attempts < maxAttempts && !savedOrder) {
      attempts++
      const code = generateOrderCode()

      // Remove id if present to let DB handle UUID generation
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...orderData } = order as any

      const newOrder = {
        ...orderData,
        code,
        // Use passed status or default to 'Aguardando Pagamento'
        status: orderData.status || 'Aguardando Pagamento',
      }

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single()

      if (!error && data) {
        savedOrder = data as Order
      } else {
        lastError = error
        // If error is not about uniqueness, break loop and return error
        if (error?.code !== '23505') {
          break
        }
      }
    }

    return { data: savedOrder, error: savedOrder ? null : lastError }
  },

  async getClientOrder(email: string, code: string) {
    // Use the RPC that filters by code and email (case insensitive email)
    const { data, error } = await supabase.rpc('get_client_order', {
      p_email: email,
      p_code: code,
    })

    if (error) return { data: null, error }
    if (!data || data.length === 0)
      return { data: null, error: 'Pedido não encontrado' }

    return this._fetchOrderRelations(data[0] as Order)
  },

  async getOrdersByEmail(email: string) {
    // Fetches all orders for a specific email (Authenticated QA flow)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('client_email', email)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    if (!data || data.length === 0) return { data: [], error: null }

    return { data: data as Order[], error: null }
  },

  async getOrderWithRelations(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return { data: null, error }
    return this._fetchOrderRelations(data as Order)
  },

  async _fetchOrderRelations(order: Order) {
    const [photos, deliverables, revisions] = await Promise.all([
      supabase.from('order_photos').select('*').eq('order_id', order.id),
      supabase.from('order_deliverables').select('*').eq('order_id', order.id),
      supabase.from('revision_requests').select('*').eq('order_id', order.id),
    ])

    return {
      data: {
        ...order,
        photos: photos.data || [],
        deliverables: deliverables.data || [],
        revisions: revisions.data || [],
      } as Order,
      error: null,
    }
  },

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(
        '*, photos:order_photos(*), deliverables:order_deliverables(*), revisions:revision_requests(*)',
      )
      .order('created_at', { ascending: false })
    return { data: data as Order[], error }
  },

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data: data as Order, error }
  },

  async uploadOrderPhoto(orderId: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('order-uploads')
      .upload(fileName, file)

    if (uploadError) return { error: uploadError }

    const { data: urlData } = supabase.storage
      .from('order-uploads')
      .getPublicUrl(fileName)

    const { data, error: dbError } = await supabase
      .from('order_photos')
      .insert({ order_id: orderId, url: urlData.publicUrl })
      .select()
      .single()

    return { data, error: dbError }
  },

  async uploadDeliverable(orderId: string, file: File, title: string) {
    const fileExt = file.name.split('.').pop()
    const type = file.type.startsWith('image') ? 'image' : 'pdf'
    const fileName = `deliverables/${orderId}/${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('order-uploads')
      .upload(fileName, file)

    if (uploadError) return { error: uploadError }

    const { data: urlData } = supabase.storage
      .from('order-uploads')
      .getPublicUrl(fileName)

    const { data, error: dbError } = await supabase
      .from('order_deliverables')
      .insert({ order_id: orderId, url: urlData.publicUrl, title, type })
      .select()
      .single()

    return { data, error: dbError }
  },

  async deleteDeliverable(id: string) {
    // 1. Get the URL to delete from storage
    const { data: item } = await supabase
      .from('order_deliverables')
      .select('url')
      .eq('id', id)
      .single()

    if (item && item.url) {
      try {
        const urlObj = new URL(item.url)
        // Storage path is relative to bucket root.
        const path = urlObj.pathname.split('/order-uploads/')[1]
        if (path) {
          await supabase.storage
            .from('order-uploads')
            .remove([decodeURIComponent(path)])
        }
      } catch (e) {
        console.error('Error parsing URL for deletion', e)
      }
    }

    const { error } = await supabase
      .from('order_deliverables')
      .delete()
      .eq('id', id)
    return { error }
  },

  async requestRevision(orderId: string, description: string) {
    const { data, error } = await supabase
      .from('revision_requests')
      .insert({ order_id: orderId, description })
      .select()
      .single()
    return { data, error }
  },
}
