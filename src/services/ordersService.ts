import { supabase } from '@/lib/supabase/client'

export interface Order {
  id: string
  display_id?: number
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
  price?: number
  payment_status?: string
  asaas_invoice_url?: string
  is_test?: boolean
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

export interface CheckoutRequest {
  client_name: string
  client_email: string
  client_whatsapp: string
  plan: string
  price: number
  property_type: string
  dimensions?: string
  preferences?: string
  notes?: string
}

export interface CheckoutResponse {
  orderCode: string
  checkoutUrl: string
  error?: string
}

export const ordersService = {
  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const { data: result, error } = await supabase.functions.invoke(
      'create-checkout',
      {
        body: data,
      },
    )

    if (error) {
      console.error('Checkout invoke error:', error)
      // Attempt to parse the error message if it's a JSON string in the error object or similar
      // The supabase invoke error usually has a generic message if 500/400
      let errorMessage = 'Erro ao conectar com servidor'
      try {
        if (error instanceof Error) errorMessage = error.message
        // If response is available in error context (depends on SDK version)
      } catch (e) {
        // ignore
      }
      return {
        orderCode: '',
        checkoutUrl: '',
        error: errorMessage,
      }
    }

    if (result && result.error) {
      // Error returned from the function logic (catch block)
      return { orderCode: '', checkoutUrl: '', error: result.error }
    }

    // Check if result is empty or missing expected fields
    if (!result || !result.checkoutUrl) {
      return {
        orderCode: '',
        checkoutUrl: '',
        error: 'Resposta inválida do servidor de pagamento',
      }
    }

    return result as CheckoutResponse
  },

  async getOrderByCode(code: string) {
    const { data, error } = await supabase.rpc('get_order_by_code', {
      p_code: code,
    })

    if (error) return { data: null, error }
    if (!data || data.length === 0)
      return { data: null, error: 'Pedido não encontrado' }

    return { data: data[0] as Order, error: null }
  },

  async getClientOrder(email: string, id: string) {
    const { data, error } = await supabase.rpc('get_client_order', {
      p_email: email,
      p_id: id,
    })

    if (error) return { data: null, error }
    if (!data || data.length === 0)
      return { data: null, error: 'Pedido não encontrado' }

    return this._fetchOrderRelations(data[0])
  },

  async getOrdersByEmail(email: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('client_email', email)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    if (!data || data.length === 0) return { data: [], error: null }

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
    const { data: item } = await supabase
      .from('order_deliverables')
      .select('url')
      .eq('id', id)
      .single()

    if (item && item.url) {
      try {
        const urlObj = new URL(item.url)
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
