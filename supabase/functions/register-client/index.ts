import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email, full_name, cpf, whatsapp } = await req.json()

    if (!email || !cpf) {
      throw new Error('Email e CPF são obrigatórios')
    }

    // 1. Check for Duplicate CPF in public.customer_profiles
    const { data: existingCpf } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('cpf', cpf)
      .single()

    if (existingCpf) {
      return new Response(
        JSON.stringify({
          error_code: 'account_exists',
          message:
            'Já existe uma conta cadastrada com este e-mail ou CPF. Faça login ou utilize "Esqueci minha senha".',
        }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 2. Generate a secure temporary password
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

    if (createError) {
      // Handle Duplicate Email Error from Supabase Auth
      if (createError.message?.includes('already been registered')) {
        return new Response(
          JSON.stringify({
            error_code: 'account_exists',
            message:
              'Já existe uma conta cadastrada com este e-mail ou CPF. Faça login ou utilize "Esqueci minha senha".',
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
      throw createError
    }

    if (!userData.user) {
      throw new Error('Falha ao criar usuário')
    }

    // 4. Create Customer Profile
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
      // Rollback user creation if profile fails (best effort)
      await supabase.auth.admin.deleteUser(userData.user.id)

      // Check if profile error is due to unique constraint violation (race condition)
      if (profileError.code === '23505') {
        // Postgres unique_violation code
        return new Response(
          JSON.stringify({
            error_code: 'account_exists',
            message:
              'Já existe uma conta cadastrada com este e-mail ou CPF. Faça login ou utilize "Esqueci minha senha".',
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      throw profileError
    }

    // 5. Send Email (Simulated)
    console.log(`
      [EMAIL SENT]
      Subject: Bem-vindo(a) ao Viveiro Floresta
      To: ${email}
      Body:
        Olá ${full_name},
        
        Sua conta foi criada com sucesso!
        
        Login: ${email}
        Senha Temporária: ${tempPassword}
        
        Acesse sua área do cliente: ${req.headers.get('origin') || 'https://viveirofloresta.com.br'}/area-cliente
    `)

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Conta criada com sucesso. Verifique seu e-mail para acessar com a senha temporária.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
