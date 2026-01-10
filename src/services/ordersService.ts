import { supabase } from '@/lib/supabase/client'

export interface Order {
  id: string
  display_id: number
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

export const ordersService = {
  async createOrder(order: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    return { data, error }
  },

  async getClientOrder(email: string, id: string) {
    // Call RPC for security
    const { data, error } = await supabase.rpc('get_client_order', {
      p_email: email,
      p_id: id,
    })

    if (error) return { data: null, error }
    if (!data || data.length === 0)
      return { data: null, error: 'Order not found' }

    return this._fetchOrderRelations(data[0])
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

    // Fetch relations for the first order (or all? usually client area shows one, but we can list them)
    // For simplicity, we'll fetch relations for the most recent one if used in single view,
    // or return basic data. The Client Area currently handles one order at a time in the view.
    // We will return list, and the UI can let user pick.
    return { data, error: null }
  },

  async getOrderWithRelations(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return { data: null, error }
    return this._fetchOrderRelations(data)
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
    return { data, error }
  },

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
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
