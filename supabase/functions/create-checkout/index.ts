import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const ASAAS_API_URL =
  Deno.env.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3'
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
const QA_BYPASS_EMAILS = Deno.env.get('QA_BYPASS_EMAILS') || ''

function generateOrderCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const requestData = await req.json()
    const {
      client_name,
      client_email,
      client_whatsapp,
      plan,
      price,
      property_type,
      dimensions,
      preferences,
      notes,
    } = requestData

    if (!client_name || !client_email || !plan || !price) {
      throw new Error(
        'Campos obrigatórios faltando (Nome, Email, Plano, Preço)',
      )
    }

    let orderCode = generateOrderCode()
    let isUnique = false
    let retries = 0
    while (!isUnique && retries < 5) {
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderCode)
        .single()
      if (!data) isUnique = true
      else {
        orderCode = generateOrderCode()
        retries++
      }
    }
    if (!isUnique) throw new Error('Falha ao gerar código único do pedido')

    const bypassEmails = QA_BYPASS_EMAILS.split(',').map((e: string) =>
      e.trim().toLowerCase(),
    )
    const emailLower = client_email.toLowerCase().trim()
    const isQABypass =
      emailLower === 'geovanne_simoes@hotmail.com' ||
      bypassEmails.includes(emailLower)

    if (isQABypass) {
      const { error: dbError } = await supabase.from('orders').insert({
        id: orderCode,
        client_name,
        client_email,
        client_whatsapp,
        plan,
        price,
        property_type,
        dimensions,
        preferences,
        notes,
        status: 'Recebido',
        payment_status: 'PAID',
        is_test: true,
        payment_mode: 'qa_bypass',
      })

      if (dbError) {
        console.error('Database Error (QA):', dbError)
        throw new Error('Erro ao salvar pedido no banco de dados')
      }

      return new Response(
        JSON.stringify({
          orderCode,
          checkoutUrl: `/pagamento/sucesso?code=${orderCode}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!ASAAS_API_KEY) {
      throw new Error('Configuração da API Asaas ausente')
    }

    let customerId = ''
    const customerSearchRes = await fetch(
      `${ASAAS_API_URL}/customers?email=${encodeURIComponent(client_email)}`,
      {
        headers: { access_token: ASAAS_API_KEY },
      },
    )

    if (!customerSearchRes.ok) {
      const errText = await customerSearchRes.text()
      console.error('Asaas Customer Search Error:', errText)
      throw new Error('Erro ao buscar cliente no Asaas')
    }

    const customerSearchData = await customerSearchRes.json()

    if (customerSearchData.data && customerSearchData.data.length > 0) {
      customerId = customerSearchData.data[0].id
    } else {
      const createCustomerRes = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: ASAAS_API_KEY,
        },
        body: JSON.stringify({
          name: client_name,
          email: client_email,
          mobilePhone: client_whatsapp,
          notificationDisabled: false,
        }),
      })
      const createCustomerData = await createCustomerRes.json()
      if (createCustomerData.errors) {
        throw new Error(
          `Erro no Asaas (Cliente): ${createCustomerData.errors[0].description}`,
        )
      }
      customerId = createCustomerData.id
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)

    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED',
        value: price,
        dueDate: dueDate.toISOString().split('T')[0],
        description: `Projeto Paisagístico - Plano ${plan}`,
        externalReference: orderCode,
        postalService: false,
      }),
    })

    const paymentData = await paymentRes.json()
    if (paymentData.errors) {
      throw new Error(
        `Erro no Asaas (Pagamento): ${paymentData.errors[0].description}`,
      )
    }

    const { error: dbError } = await supabase.from('orders').insert({
      id: orderCode,
      client_name,
      client_email,
      client_whatsapp,
      plan,
      price,
      property_type,
      dimensions,
      preferences,
      notes,
      status: 'Aguardando Pagamento',
      payment_status: 'PENDING',
      asaas_customer_id: customerId,
      asaas_payment_id: paymentData.id,
      asaas_invoice_url: paymentData.invoiceUrl,
      is_test: false,
      payment_mode: 'asaas',
    })

    if (dbError) {
      console.error('Database Insert Error:', dbError)
      throw new Error('Erro ao salvar pedido no banco de dados')
    }

    return new Response(
      JSON.stringify({
        orderCode,
        checkoutUrl: paymentData.invoiceUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('Checkout Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
