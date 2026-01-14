import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ASAAS_API_URL =
  Deno.env.get('ASAAS_ENV') === 'production'
    ? 'https://www.asaas.com/api/v3'
    : 'https://sandbox.asaas.com/api/v3'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { orderId, orderCode, planName, price, siteUrl } = await req.json()

    if (!orderId || !price) {
      throw new Error('Missing required fields')
    }

    // 1. Fetch Order to check idempotency and get client details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Idempotency check
    if (order.asaas_checkout_url) {
      return new Response(
        JSON.stringify({ checkoutUrl: order.asaas_checkout_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const asaasToken = Deno.env.get('ASAAS_ACCESS_TOKEN')
    if (!asaasToken) {
      throw new Error('Asaas configuration missing')
    }

    const headers = {
      'Content-Type': 'application/json',
      access_token: asaasToken,
    }

    // 2. Find or Create Customer in Asaas
    // Search for existing customer
    const customerSearch = await fetch(
      `${ASAAS_API_URL}/customers?email=${encodeURIComponent(order.client_email)}`,
      { headers },
    )
    const customerSearchResult = await customerSearch.json()

    let customerId = customerSearchResult.data?.[0]?.id

    // Create if not exists
    if (!customerId) {
      const newCustomerRes = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: order.client_name,
          email: order.client_email,
          mobilePhone: order.client_whatsapp || undefined,
          externalReference: order.id,
        }),
      })

      const newCustomerData = await newCustomerRes.json()
      if (newCustomerData.errors) {
        console.error('Asaas Customer Error:', newCustomerData.errors)
        throw new Error('Failed to create customer in payment gateway')
      }
      customerId = newCustomerData.id
    }

    // 3. Create Payment
    const paymentPayload = {
      customer: customerId,
      billingType: 'UNDEFINED', // Allows user to choose PIX or Credit Card
      value: Number(price),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 3 days
      description: `Projeto Paisagístico - Plano ${planName}`,
      externalReference: orderCode,
      postalService: false,
    }

    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload),
    })

    const paymentData = await paymentRes.json()

    if (paymentData.errors) {
      console.error('Asaas Payment Error:', paymentData.errors)
      throw new Error('Failed to create payment')
    }

    const checkoutUrl = paymentData.invoiceUrl
    const checkoutId = paymentData.id

    // 4. Update Order in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        asaas_checkout_id: checkoutId,
        asaas_checkout_url: checkoutUrl,
        asaas_status: 'PENDING',
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Supabase Update Error:', updateError)
    }

    return new Response(JSON.stringify({ checkoutUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
