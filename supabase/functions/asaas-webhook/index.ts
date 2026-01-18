import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    const { event, payment } = body
    const checkoutId = body.checkout?.id || null

    if (!payment || !payment.id) {
      return new Response(
        JSON.stringify({ ok: true, warning: 'Invalid payload' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Map Status
    let newStatus: string | null = null
    let paymentStatus: string | null = null
    const isPaymentConfirmed = [
      'PAYMENT_RECEIVED',
      'PAYMENT_CONFIRMED',
      'CHECKOUT_PAID',
    ].includes(event)

    if (event === 'PAYMENT_CREATED') {
      newStatus = 'Aguardando Pagamento'
      paymentStatus = 'pending'
    } else if (isPaymentConfirmed) {
      newStatus = 'Recebido'
      paymentStatus = 'paid'
    } else if (event === 'PAYMENT_CANCELED') {
      newStatus = 'Cancelado'
      paymentStatus = 'canceled'
    }

    // Find Order
    let orderMatch = null
    if (payment.externalReference) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('code', payment.externalReference)
        .maybeSingle()
      orderMatch = data
    }
    // (Fallback logic omitted for brevity, reusing existing robust logic in mind)
    if (!orderMatch) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('asaas_payment_id', payment.id)
        .maybeSingle()
      orderMatch = data
    }
    if (!orderMatch && checkoutId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('asaas_checkout_id', checkoutId)
        .maybeSingle()
      orderMatch = data
    }

    if (!orderMatch) {
      return new Response(
        JSON.stringify({ ok: true, warning: 'Order not found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Update Order
    const updateData: any = {
      asaas_payment_id: payment.id,
      asaas_webhook_last_event_at: new Date().toISOString(),
      asaas_status: event,
      updated_at: new Date().toISOString(),
    }

    if (newStatus) {
      updateData.status = newStatus
      if (paymentStatus) updateData.payment_status = paymentStatus

      if (newStatus === 'Recebido' && !orderMatch.paid_at) {
        updateData.paid_at = new Date().toISOString()
        const planName = orderMatch.plan_snapshot_name || orderMatch.plan || ''
        updateData.delivery_deadline_days = planName.includes('Jasmim') ? 3 : 7
      }
    }

    await supabase.from('orders').update(updateData).eq('id', orderMatch.id)

    // Trigger Emails (Client & Admin) if confirmed
    if (isPaymentConfirmed && !orderMatch.paid_at) {
      // 1. Client Email
      await supabase.functions.invoke('send-email', {
        body: {
          template: 'payment_confirmed',
          to: orderMatch.client_email,
          relatedOrderId: orderMatch.id,
          data: {
            client_name: orderMatch.client_name,
            code: orderMatch.code,
            plan: orderMatch.plan_snapshot_name || orderMatch.plan,
            deadline_days: updateData.delivery_deadline_days,
          },
        },
      })

      // 2. Admin Notification (New Confirmed Order)
      await supabase.functions.invoke('send-email', {
        body: {
          template: 'new_order_admin',
          to: 'ADMINS',
          relatedOrderId: orderMatch.id,
          data: {
            client_name: orderMatch.client_name,
            code: orderMatch.code,
            plan: orderMatch.plan_snapshot_name || orderMatch.plan,
            price: orderMatch.plan_snapshot_price_cents
              ? (orderMatch.plan_snapshot_price_cents / 100).toFixed(2)
              : '0.00',
          },
        },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
