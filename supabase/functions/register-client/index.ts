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
          error:
            'Já existe uma conta cadastrada com este CPF. Caso não lembre sua senha, utilize a opção "Esqueci minha senha".',
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
            error:
              'Já existe uma conta cadastrada com este e-mail. Caso não lembre sua senha, utilize a opção "Esqueci minha senha".',
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
      throw profileError
    }

    // 5. Send Email (Simulated)
    // In a production environment, you would use an email provider like Resend or SendGrid here.
    // For this implementation, we assume the system logs the email or uses Supabase internal mailer if configured.
    console.log(`
      [MOCK EMAIL SENT]
      To: ${email}
      Subject: Sua conta foi criada – Viveiro Floresta
      Body:
        Olá ${full_name},
        
        Sua conta foi criada com sucesso!
        
        Sua senha temporária é: ${tempPassword}
        
        Por favor, faça login e altere sua senha imediatamente.
        Acesse: ${req.headers.get('origin') || 'https://viveirofloresta.com.br'}/area-cliente
    `)

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Conta criada com sucesso. Enviamos uma senha temporária para o seu e-mail.',
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
