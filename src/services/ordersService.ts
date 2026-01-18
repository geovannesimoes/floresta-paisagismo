import { supabase } from '@/lib/supabase/client'
import { PLAN_DETAILS, PlanName } from '@/lib/plan-constants'
import { emailService } from '@/services/emailService'

// ... existing interfaces ... (Using existing interfaces, imports are sufficient)

// Redefine interfaces for clarity in this file context if needed, but assuming global scope from previous context
// For brevity, I'm extending the existing file content

export interface OrderChecklistItem {
  id: string
  order_id: string
  text: string
  is_done: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  display_id: number
  code: string
  client_name: string
  client_email: string
  client_cpf_cnpj?: string
  client_whatsapp: string
  property_type: string
  dimensions?: string
  preferences?: string
  notes?: string
  plan: string
  plan_id?: string
  plan_snapshot_name?: string
  plan_snapshot_price_cents?: number
  plan_snapshot_features?: string[]
  status: string
  created_at: string
  updated_at: string
  price?: number
  asaas_checkout_id?: string
  asaas_checkout_url?: string
  asaas_status?: string
  paid_at?: string
  delivered_at?: string
  delivery_deadline_days?: number
  photos?: any[]
  deliverables?: any[]
  revisions?: any[]
}

interface CreateOrderParams {
  client_name: string
  client_email: string
  client_cpf_cnpj: string
  client_whatsapp: string
  property_type: string
  dimensions?: string
  preferences?: string
  notes?: string
  plan: string
  status?: string
  plan_id?: string
  plan_snapshot_name?: string
  plan_snapshot_price_cents?: number
  plan_snapshot_features?: string[]
}

export const ordersService = {
  // ... existing methods ...

  async createOrder(order: CreateOrderParams) {
    const { data, error } = await supabase.rpc('create_order_and_return', {
      p_client_name: order.client_name,
      p_client_email: order.client_email,
      p_client_cpf_cnpj: order.client_cpf_cnpj || null,
      p_client_whatsapp: order.client_whatsapp || null,
      p_property_type: order.property_type || null,
      p_dimensions: order.dimensions || null,
      p_preferences: order.preferences || null,
      p_notes: order.notes || null,
      p_plan: order.plan,
      p_plan_id: order.plan_id || null,
      p_plan_snapshot_name: order.plan_snapshot_name || null,
      p_plan_snapshot_price_cents: order.plan_snapshot_price_cents || null,
      p_plan_snapshot_features: order.plan_snapshot_features || null,
    })

    if (error) return { data: null, error }
    const createdOrder = Array.isArray(data) ? data[0] : data

    // Notify Admin of New Order (Manually created via frontend flow, e.g. test)
    // Note: Usually handled by Webhook on payment, but good to have here if payment skipped or testing
    // We will rely on webhook for "Paid" notification.
    // If we want "Created" notification, we can add:
    // emailService.sendEmail({ template: 'new_order_admin', to: 'ADMINS', data: createdOrder, relatedOrderId: createdOrder.id });

    return { data: createdOrder as Order, error: null }
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

  async getOrderByCode(code: string) {
    const { data, error } = await supabase.rpc('get_order_by_code', {
      p_code: code,
    })
    return { data: data as Order[], error }
  },

  async getClientOrder(email: string, code: string) {
    const { data, error } = await supabase.rpc('get_client_order_details', {
      p_email: email,
      p_code: code,
    })
    return { data: data as unknown as Order, error }
  },

  async getOrdersByEmail(email: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_email', email)
      .order('created_at', { ascending: false })
    return { data: data as Order[], error }
  },

  async getOrderWithRelations(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(
        '*, photos:order_photos(*), deliverables:order_deliverables(*), revisions:revision_requests(*)',
      )
      .eq('id', id)
      .single()
    return { data: data as Order, error }
  },

  async updateOrderStatus(id: string, status: string, currentOrder: Order) {
    const updates: any = { status, updated_at: new Date().toISOString() }

    if (status.includes('Recebido') && !currentOrder.paid_at) {
      updates.paid_at = new Date().toISOString()
      const planName = currentOrder.plan_snapshot_name || currentOrder.plan
      if (planName) {
        updates.delivery_deadline_days = planName.includes('Jasmim') ? 3 : 7
      }
    }

    if (status.includes('Enviado') && !currentOrder.delivered_at) {
      updates.delivered_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      // Send Email Notification
      await emailService.notifyStatusUpdate(data, status)

      // Special case: Delivered
      if (status.includes('Enviado')) {
        await emailService.notifyProjectDelivered(data)
      }
    }

    return { data: data as Order, error }
  },

  async requestRevision(orderId: string, description: string) {
    const { data, error } = await supabase
      .from('revision_requests')
      .insert({
        order_id: orderId,
        description,
        status: 'Pendente',
      })
      .select()
      .single()

    if (data) {
      // Notify Admin
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
      if (order) {
        await emailService.notifyRevisionRequested(order, description)
      }
    }

    return { data, error }
  },

  // ... checklist methods (same as before) ...
  async getChecklist(orderId: string) {
    const { data, error } = await supabase
      .from('order_checklist_items')
      .select('*')
      .eq('order_id', orderId)
      .order('sort_order', { ascending: true })
    return { data: data as OrderChecklistItem[], error }
  },

  async initChecklist(orderId: string, planName: string) {
    let items: string[] = []
    if (planName.includes('Jasmim'))
      items = PLAN_DETAILS['Jasmim'].checklist as unknown as string[]
    else if (planName.includes('Ipê'))
      items = PLAN_DETAILS['Ipê'].checklist as unknown as string[]
    else items = PLAN_DETAILS['Lírio'].checklist as unknown as string[]

    if (!items || items.length === 0) return { data: [], error: null }
    const checklistItems = items.map((text, index) => ({
      order_id: orderId,
      text,
      is_done: false,
      sort_order: index + 1,
    }))
    const { data, error } = await supabase
      .from('order_checklist_items')
      .insert(checklistItems)
      .select()
    return { data: data as OrderChecklistItem[], error }
  },

  async toggleChecklistItem(itemId: string, isDone: boolean) {
    const { data, error } = await supabase
      .from('order_checklist_items')
      .update({ is_done: isDone, updated_at: new Date().toISOString() })
      .eq('id', itemId)
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

  async uploadDeliverable(
    orderId: string,
    file: File,
    title: string,
    customType?: string,
  ) {
    const fileExt = file.name.split('.').pop()
    const type = customType || (file.type.startsWith('image') ? 'image' : 'pdf')
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

    if (data && type === 'revised_project') {
      // 1. Resolve Revision Requests
      await supabase
        .from('revision_requests')
        .update({ status: 'Resolvido' })
        .eq('order_id', orderId)
        .eq('status', 'Pendente')

      // 2. Notify Client
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
      if (order) {
        await emailService.notifyRevisedProjectDelivered(order)
      }
    }

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
        if (path)
          await supabase.storage
            .from('order-uploads')
            .remove([decodeURIComponent(path)])
      } catch (e) {
        console.error(e)
      }
    }
    const { error } = await supabase
      .from('order_deliverables')
      .delete()
      .eq('id', id)
    return { error }
  },
}
