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
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let newStatus = ''
    let updateData: any = {
      asaas_status: eventType,
      asaas_payment_id: payment.id, // Ensure we track this
      updated_at: new Date().toISOString(),
    }

    // Map Asaas events to system status
    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        newStatus = 'Recebido'
        updateData.status = 'Recebido'
        updateData.paid_at = new Date().toISOString()
        updateData.payment_status = 'paid'
        break
      case 'PAYMENT_OVERDUE':
        // Only update status if it wasn't paid before (optional logic, but safe)
        updateData.status = 'Expirado'
        break
      case 'PAYMENT_REFUNDED':
        updateData.status = 'Cancelado'
        updateData.payment_status = 'refunded'
        break
      case 'PAYMENT_DELETED':
        // If deleted in Asaas, we might want to cancel here too
        updateData.status = 'Cancelado'
        break
      default:
        // For CREATED, UPDATED, etc., just update metadata
        break
    }

    // Update using asaas_checkout_id (which corresponds to invoice Id usually, but payment.id is safer if we saved it)
    // We try to match by asaas_checkout_id which we saved as payment.id in create-checkout

    // Check if order exists first to avoid silent failure or error
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('asaas_checkout_id', payment.id)
      .maybeSingle()

    if (findError) {
      console.error('Error finding order:', findError)
      // Return 200 to Asaas to stop retries, but log error
      return new Response(
        JSON.stringify({ received: true, error: 'Db error finding order' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!order) {
      console.warn(`Order not found for payment ID: ${payment.id}`)
      // Return 200 to avoid retries for unrelated payments
      return new Response(
        JSON.stringify({ received: true, warning: 'Order not found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // If order is already paid, don't overwrite with 'Expirado' if a race condition happens
    if (order.status === 'Recebido' && newStatus !== 'Recebido') {
      console.log(
        'Order already paid, ignoring subsequent non-payment status update',
      )
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (updateError) {
      console.error('Error updating order:', updateError)
      throw updateError
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook Internal Error:', error)
    // Return 200 to Asaas to prevent indefinite retries if it's a code error we can't fix immediately
    // Unless it's a temporary database glitch, but for safety in this context:
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
