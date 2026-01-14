import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ASAAS_API_URL =
  Deno.env.get('ASAAS_ENV') === 'production'
    ? 'https://www.asaas.com/api/v3'
    : 'https://sandbox.asaas.com/api/v3'

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Validate Environment Variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const asaasToken = Deno.env.get('ASAAS_ACCESS_TOKEN')

    if (!supabaseUrl || !supabaseServiceKey || !asaasToken) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({
          error:
            'Server configuration error: Missing required environment variables',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Parse and Validate Request Body
    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { orderId, orderCode, planName, price, siteUrl } = body

    const missingFields = []
    if (!orderId) missingFields.push('orderId')
    if (!orderCode) missingFields.push('orderCode')
    if (!price) missingFields.push('price')

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 4. Fetch Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order fetch error:', orderError)
      return new Response(
        JSON.stringify({ error: 'Order not found in database' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Idempotency check
    if (order.asaas_checkout_url) {
      return new Response(
        JSON.stringify({ checkoutUrl: order.asaas_checkout_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const headers = {
      'Content-Type': 'application/json',
      access_token: asaasToken,
    }

    // 5. Find or Create Customer in Asaas
    let customerId = order.asaas_customer_id

    if (!customerId) {
      // Search by email first
      const customerSearchRes = await fetch(
        `${ASAAS_API_URL}/customers?email=${encodeURIComponent(order.client_email)}`,
        { headers },
      )

      if (!customerSearchRes.ok) {
        const errorText = await customerSearchRes.text()
        console.error('Asaas Customer Search Error:', errorText)
        throw new Error(
          `Failed to search customer: ${customerSearchRes.statusText}`,
        )
      }

      const customerSearchResult = await customerSearchRes.json()
      customerId = customerSearchResult.data?.[0]?.id

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
          console.error('Asaas Create Customer Error:', newCustomerData.errors)
          const messages = newCustomerData.errors
            .map((e: any) => e.description)
            .join(', ')
          return new Response(
            JSON.stringify({ error: `Asaas Customer Error: ${messages}` }),
            {
              status: 502, // Bad Gateway (Upstream error)
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        customerId = newCustomerData.id
      }
    }

    // 6. Create Payment
    const paymentPayload = {
      customer: customerId,
      billingType: 'UNDEFINED',
      value: Number(price),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      description: `Projeto Paisagístico - Plano ${planName}`,
      externalReference: orderCode, // Use code for easier identification
      postalService: false,
    }

    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload),
    })

    const paymentData = await paymentRes.json()

    if (paymentData.errors) {
      console.error('Asaas Create Payment Error:', paymentData.errors)
      const messages = paymentData.errors
        .map((e: any) => e.description)
        .join(', ')
      return new Response(
        JSON.stringify({ error: `Asaas Payment Error: ${messages}` }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const checkoutUrl = paymentData.invoiceUrl
    const checkoutId = paymentData.id

    // 7. Update Order in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        asaas_customer_id: customerId,
        asaas_checkout_id: checkoutId,
        asaas_checkout_url: checkoutUrl,
        asaas_status: 'PENDING',
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Supabase Update Error:', updateError)
      // We don't fail the request here because payment was created, just log it
    }

    return new Response(JSON.stringify({ checkoutUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Internal Server Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
