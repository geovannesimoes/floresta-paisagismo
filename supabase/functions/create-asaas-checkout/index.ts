import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const asaasToken = Deno.env.get('ASAAS_ACCESS_TOKEN')
    const asaasEnv = Deno.env.get('ASAAS_ENV')

    const missingVars: Record<string, boolean> = {
      SUPABASE_URL: !supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !supabaseServiceKey,
      ASAAS_ACCESS_TOKEN: !asaasToken,
      ASAAS_ENV: !asaasEnv,
    }

    if (Object.values(missingVars).some((v) => v)) {
      console.error('Missing environment variables:', missingVars)
      return new Response(
        JSON.stringify({
          error:
            'Server configuration error: Missing required environment variables',
          missing: missingVars,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const ASAAS_API_URL =
      asaasEnv === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://api-sandbox.asaas.com/v3'

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

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

    // 1. Fetch Order to validate and check existing Asaas ID
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

    if (!order.client_cpf_cnpj) {
      return new Response(
        JSON.stringify({ error: 'CPF/CNPJ é obrigatório para pagamento' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // If order already has a checkout URL, return it
    if (order.asaas_checkout_url) {
      return new Response(
        JSON.stringify({ checkoutUrl: order.asaas_checkout_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const headers = {
      'Content-Type': 'application/json',
      access_token: asaasToken!,
    }

    let customerId = order.asaas_customer_id

    // 2. Check or Create Customer in Asaas
    if (!customerId) {
      // Search by Email first
      const customerSearchRes = await fetch(
        `${ASAAS_API_URL}/customers?email=${encodeURIComponent(order.client_email)}`,
        { headers },
      )

      if (!customerSearchRes.ok) {
        throw new Error(
          `Failed to search customer: ${customerSearchRes.statusText}`,
        )
      }

      const customerSearchResult = await customerSearchRes.json()
      const existingCustomer = customerSearchResult.data?.[0]

      if (existingCustomer) {
        customerId = existingCustomer.id
        // Update customer data
        await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: order.client_name,
            cpfCnpj: order.client_cpf_cnpj,
            mobilePhone: order.client_whatsapp || undefined,
          }),
        })
      } else {
        // Create new customer
        const newCustomerRes = await fetch(`${ASAAS_API_URL}/customers`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: order.client_name,
            email: order.client_email,
            mobilePhone: order.client_whatsapp || undefined,
            cpfCnpj: order.client_cpf_cnpj,
            externalReference: order.id,
          }),
        })

        const newCustomerData = await newCustomerRes.json()
        if (newCustomerData.errors) {
          const messages = newCustomerData.errors
            .map((e: any) => e.description)
            .join(', ')
          return new Response(
            JSON.stringify({
              error: 'Erro ao criar cliente no Asaas',
              details: messages,
            }),
            {
              status: 502,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        customerId = newCustomerData.id
      }
    }

    // 3. Construct Payment Payload
    const paymentPayload: any = {
      customer: customerId,
      billingType: 'UNDEFINED',
      value: Number(price),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      description: `Projeto Paisagístico - ${planName}`,
      externalReference: orderCode, // Used for webhook matching
      postalService: false,
    }

    // 4. Add Redirect URLs if siteUrl is provided
    // CRITICAL: Must append orderCode to URL parameters for reliable return flow
    if (siteUrl) {
      const successUrl = `${siteUrl}/pagamento/sucesso?orderCode=${orderCode}`
      const cancelUrl = `${siteUrl}/pagamento/cancelado?orderCode=${orderCode}`
      // Expired isn't a standard redirect in Asaas API but useful if supported or for manual links
      const expiredUrl = `${siteUrl}/pagamento/expirado?orderCode=${orderCode}`

      paymentPayload.callback = {
        successUrl: successUrl,
        autoRedirect: true,
      }
      // Setting these for completeness, though callback.successUrl is primary for Asaas v3
      paymentPayload.successUrl = successUrl
    }

    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload),
    })

    const paymentData = await paymentRes.json()

    if (paymentData.errors) {
      const messages = paymentData.errors
        .map((e: any) => e.description)
        .join(', ')
      return new Response(
        JSON.stringify({
          error: 'Erro ao criar pagamento no Asaas',
          details: messages,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const checkoutUrl = paymentData.invoiceUrl
    const checkoutId = paymentData.id

    // 5. Update Order with Payment Info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        asaas_customer_id: customerId,
        asaas_checkout_id: checkoutId,
        asaas_payment_id: checkoutId,
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
