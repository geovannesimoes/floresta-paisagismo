import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, full_name, cpf, whatsapp } = await req.json()

    if (!email || !cpf) {
      throw new Error('Email e CPF são obrigatórios')
    }

    // 1. Check Duplicates
    const { data: existingCpf } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('cpf', cpf)
      .single()

    if (existingCpf) {
      return new Response(
        JSON.stringify({
          error_code: 'account_exists',
          message: 'Conta já existente.',
        }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 2. Temp Password
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8).toUpperCase() +
      '!'

    // 3. Create Auth User
    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name },
      })

    if (createError) throw createError

    // 4. Create Profile
    const { error: profileError } = await supabase
      .from('customer_profiles')
      .insert({
        id: userData.user.id,
        full_name,
        cpf,
        whatsapp,
        must_change_password: true,
      })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userData.user.id)
      throw profileError
    }

    // 5. Send Welcome Email via Edge Function
    await supabase.functions.invoke('send-email', {
      body: {
        template: 'account_created',
        to: email,
        relatedUserId: userData.user.id,
        data: {
          name: full_name,
          email: email,
          password: tempPassword,
        },
      },
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
