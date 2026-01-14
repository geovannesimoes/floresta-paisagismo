import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 2. Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const event = await req.json()
    const { event: eventType, payment } = event

    console.log(`Received Webhook: ${eventType}`, payment?.id)

    if (!payment || !payment.id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 200, // Return 200 to avoid retries on bad payload
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Determine New Status based on Event Type
    let newStatus = ''
    const updateData: any = {
      asaas_status: eventType,
      asaas_payment_id: payment.id,
      asaas_webhook_last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
      case 'CHECKOUT_PAID':
        newStatus = 'Recebido'
        updateData.status = 'Recebido'
        updateData.payment_status = 'paid'
        updateData.paid_at = new Date().toISOString()
        break

      case 'PAYMENT_CANCELED':
      case 'CHECKOUT_CANCELED':
        newStatus = 'Cancelado'
        updateData.status = 'Cancelado'
        updateData.payment_status = 'canceled'
        break

      case 'PAYMENT_OVERDUE':
      case 'CHECKOUT_EXPIRED':
        newStatus = 'Expirado'
        updateData.status = 'Expirado'
        break

      case 'PAYMENT_CREATED':
      case 'CHECKOUT_CREATED':
        newStatus = 'Aguardando Pagamento'
        updateData.status = 'Aguardando Pagamento'
        break

      default:
        // For other events, we just update tracking info (asaas_status, timestamp) but not the main order status
        console.log(`Event ${eventType} received, updating metadata only.`)
        break
    }

    // Lookup Order
    // Try by externalReference (code), then by asaas_checkout_id, then by asaas_payment_id

    let orderMatch = null

    // 1. Try Code (externalReference)
    if (payment.externalReference) {
      const { data } = await supabase
        .from('orders')
        .select('id, status')
        .eq('code', payment.externalReference)
        .maybeSingle()
      orderMatch = data
    }

    // 2. Try Checkout ID (if code didn't work)
    if (!orderMatch) {
      const { data } = await supabase
        .from('orders')
        .select('id, status')
        .eq('asaas_checkout_id', payment.id)
        .maybeSingle()
      orderMatch = data
    }

    // 3. Try Payment ID (if still not found)
    if (!orderMatch) {
      const { data } = await supabase
        .from('orders')
        .select('id, status')
        .eq('asaas_payment_id', payment.id)
        .maybeSingle()
      orderMatch = data
    }

    if (!orderMatch) {
      console.warn(
        `Order not found for Payment ID: ${payment.id}, Ref: ${payment.externalReference}`,
      )
      // Return 200 to acknowledge receipt and prevent Asaas from retrying
      return new Response(
        JSON.stringify({ received: true, warning: 'Order match failed' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Prevent overwriting 'Recebido' status with 'Expirado' or others (race conditions or late events)
    if (
      orderMatch.status === 'Recebido' &&
      newStatus !== 'Recebido' &&
      newStatus !== ''
    ) {
      console.log('Order already Paid, skipping status update to', newStatus)
      // We still update metadata
      delete updateData.status
      delete updateData.payment_status
      delete updateData.paid_at
    }

    // Execute Update
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderMatch.id)

    if (updateError) {
      console.error('Error updating order:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ received: true, orderId: orderMatch.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Webhook Internal Error:', error)
    // Return 200 to prevent retries on internal logic errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
