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

    const missingVars = {
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

    const { orderId, orderCode, planName, price } = body

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

    // New validation for CPF/CNPJ
    if (!order.client_cpf_cnpj) {
      return new Response(
        JSON.stringify({ error: 'CPF/CNPJ é obrigatório para pagamento' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

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

    // Check customer by email if not linked yet
    if (!customerId) {
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
      const existingCustomer = customerSearchResult.data?.[0]

      if (existingCustomer) {
        customerId = existingCustomer.id
        // Check if existing customer has missing CPF/CNPJ and update if necessary
        // Or if we just want to ensure our current order data is reflected on Asaas
        // We will update the customer with the current order info (name, cpfCnpj, phone)
        const updateRes = await fetch(
          `${ASAAS_API_URL}/customers/${customerId}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              name: order.client_name,
              cpfCnpj: order.client_cpf_cnpj,
              mobilePhone: order.client_whatsapp || undefined,
            }),
          },
        )

        if (!updateRes.ok) {
          console.warn(
            'Failed to update existing customer data in Asaas',
            await updateRes.text(),
          )
        }
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
          console.error('Asaas Create Customer Error:', newCustomerData.errors)
          const messages = newCustomerData.errors
            .map((e: any) => e.description)
            .join(', ')
          return new Response(
            JSON.stringify({ error: `Asaas Customer Error: ${messages}` }),
            {
              status: 502,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        customerId = newCustomerData.id
      }
    }

    const paymentPayload = {
      customer: customerId,
      billingType: 'UNDEFINED',
      value: Number(price),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
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
