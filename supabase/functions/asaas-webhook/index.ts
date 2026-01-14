import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ ok: true, error: 'Configuration Error' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse Body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Error parsing JSON body:', e)
      return new Response(JSON.stringify({ ok: true, error: 'Invalid JSON' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { event, payment } = body
    const checkoutId = body.checkout?.id || null

    // Logging per AC
    console.log('Received Webhook:', {
      event,
      paymentId: payment?.id,
      checkoutId,
      externalReference: payment?.externalReference,
    })

    if (!payment || !payment.id) {
      console.warn('Invalid payload: missing payment information')
      return new Response(
        JSON.stringify({ ok: true, warning: 'Invalid payload' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Determine New Status based on AC
    let newStatus: string | null = null
    let paymentStatus: string | null = null

    switch (event) {
      case 'PAYMENT_CREATED':
        newStatus = 'aguardando_pagamento'
        paymentStatus = 'pending'
        break

      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        newStatus = 'recebido'
        paymentStatus = 'paid'
        break

      case 'PAYMENT_CANCELED':
        newStatus = 'cancelado'
        paymentStatus = 'canceled'
        break

      // Additional events mapping for resilience
      case 'CHECKOUT_PAID':
        newStatus = 'recebido'
        paymentStatus = 'paid'
        break
    }

    // Lookup Order
    // 1. Try Code (externalReference) - Priority per AC
    let orderMatch = null

    if (payment.externalReference) {
      const { data } = await supabase
        .from('orders')
        .select('id, status, payment_status')
        .eq('code', payment.externalReference)
        .maybeSingle()
      orderMatch = data
    }

    // 2. Try Payment ID (Resilience)
    if (!orderMatch) {
      const { data } = await supabase
        .from('orders')
        .select('id, status, payment_status')
        .eq('asaas_payment_id', payment.id)
        .maybeSingle()
      orderMatch = data
    }

    // 3. Try Checkout ID (Resilience)
    if (!orderMatch && checkoutId) {
      const { data } = await supabase
        .from('orders')
        .select('id, status, payment_status')
        .eq('asaas_checkout_id', checkoutId)
        .maybeSingle()
      orderMatch = data
    }

    if (!orderMatch) {
      console.warn(
        `Order not found for Payment ID: ${payment.id}, Ref: ${payment.externalReference}`,
      )
      // Return 200 per AC
      return new Response(
        JSON.stringify({ ok: true, warning: 'Order not found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Prepare Update Data
    const updateData: any = {
      asaas_payment_id: payment.id,
      asaas_webhook_last_event_at: new Date().toISOString(),
      asaas_status: event,
      updated_at: new Date().toISOString(),
    }

    // Apply Status Update logic
    if (newStatus) {
      // Prevent regression from 'recebido' to 'aguardando_pagamento' (Resilience)
      const currentStatus = orderMatch.status?.toLowerCase() || ''
      const currentPaymentStatus =
        orderMatch.payment_status?.toLowerCase() || ''
      const isPaid =
        currentStatus === 'recebido' || currentPaymentStatus === 'paid'

      if (isPaid && newStatus === 'aguardando_pagamento') {
        console.log('Skipping status update: Order is already paid')
      } else {
        updateData.status = newStatus
        if (paymentStatus) {
          updateData.payment_status = paymentStatus
        }
        if (newStatus === 'recebido') {
          updateData.paid_at = new Date().toISOString()
        }
      }
    }

    // Execute Update
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderMatch.id)

    if (updateError) {
      console.error('Error updating order:', updateError)
      return new Response(
        JSON.stringify({ ok: true, error: 'Database update failed' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook Internal Error:', error)
    // Fail-safe response for any internal error
    return new Response(JSON.stringify({ ok: true, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
