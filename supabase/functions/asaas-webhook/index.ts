import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const event = await req.json()
    const { event: eventType, payment } = event

    console.log(`Received Webhook: ${eventType}`, payment.id)

    if (!payment || !payment.id) {
      return new Response('Invalid payload', { status: 400 })
    }

    let newStatus = ''
    let updateData: any = {
      asaas_status: eventType,
    }

    // Map Asaas events to system status
    // User Story Requirements: 'pago', 'cancelado', 'expirado'
    // Asaas events: PAYMENT_CONFIRMED, PAYMENT_RECEIVED (Paid), PAYMENT_OVERDUE (Expired), PAYMENT_REFUNDED (Cancelled?)

    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        newStatus = 'Recebido' // Matches 'pago' concept but sticks to existing Enum if possible, or sets to 'Recebido' as in schema
        updateData.status = 'Recebido'
        updateData.paid_at = new Date().toISOString()
        break
      case 'PAYMENT_OVERDUE':
        updateData.status = 'Cancelado' // Or 'Expirado' if supported by frontend logic
        break
      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_DELETED':
        updateData.status = 'Cancelado'
        break
      default:
        // Other events (CREATED, UPDATED) - just update asaas_status, keep order status
        break
    }

    if (newStatus || updateData.status) {
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('asaas_checkout_id', payment.id) // Using checkout_id (payment id) to find order

      if (error) {
        console.error('Error updating order:', error)
        throw error
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
