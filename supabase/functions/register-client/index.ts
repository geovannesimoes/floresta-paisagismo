import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email, full_name, cpf, whatsapp } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // 1. Generate a temporary password
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8).toUpperCase() +
      '!'

    // 2. Create Auth User
    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name },
      })

    if (createError) {
      // If user already exists, we might want to handle it differently, but for now throw error
      throw createError
    }

    if (!userData.user) {
      throw new Error('Failed to create user')
    }

    // 3. Create Customer Profile
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

    // 4. Send Email (Simulated for this environment if no provider configured)
    // In a real scenario, use Resend or Supabase Mailer here.
    // For this implementation, we will return the temp password in the response
    // to satisfy the requirement of allowing login in the demo environment
    // where email delivery might not be configured.

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account created successfully',
        // IMPORTANT: In production, NEVER return password.
        // We do this here only to fulfill the User Story "trigger temporary password" flow
        // without an actual email provider in this sandbox.
        tempPassword,
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
