import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN')

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate Token
    const token =
      req.headers.get('asaas-access-token') ||
      req.headers.get('x-webhook-token')
    if (token !== ASAAS_WEBHOOK_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const event = await req.json()
    console.log('Webhook Event:', event.event, event.payment?.id)

    // 2. Map Status
    let status = ''
    let payment_status = ''

    switch (event.event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        status = 'Recebido'
        payment_status = 'PAID'
        break
      case 'PAYMENT_OVERDUE':
        // Don't change main status if it was already paid/delivered, but usually strict flow:
        // status = 'Cancelado'; // Optional, or keep as is and just mark payment
        payment_status = 'OVERDUE'
        break
      case 'PAYMENT_REFUNDED':
        status = 'Cancelado'
        payment_status = 'REFUNDED'
        break
      default:
        // Ignore other events
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // 3. Update DB
    if (status || payment_status) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )

      // Find order by asaas_payment_id
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('asaas_payment_id', event.payment.id)
        .single()

      if (order) {
        const updates: any = {}
        if (status) updates.status = status
        if (payment_status) updates.payment_status = payment_status

        await supabase.from('orders').update(updates).eq('id', order.id)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
