import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getEmailTemplate } from '../_shared/email-templates.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const emailProviderApiKey = Deno.env.get('EMAIL_PROVIDER_API_KEY')
    const emailFrom =
      Deno.env.get('EMAIL_FROM_ADDRESS') ||
      'nao-responda@viveirofloresta.com.br'
    const emailFromName =
      Deno.env.get('EMAIL_FROM_NAME') || 'Floresta Paisagismo'
    const siteUrl = Deno.env.get('SITE_URL') || 'https://viveirofloresta.com.br'

    // If using Resend (Example implementation)
    // Adjust logic if using SendGrid or others based on available secrets

    if (!emailProviderApiKey) {
      console.warn('EMAIL_PROVIDER_API_KEY not set. Email will be skipped.')
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { template, to, data, relatedOrderId, relatedUserId } =
      await req.json()

    if (!to || !template) {
      throw new Error('Missing "to" or "template" fields')
    }

    // Resolve Admins if needed
    let recipients: string[] = Array.isArray(to) ? to : [to]

    if (to === 'ADMINS') {
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('value')
        .eq('key', 'admin_notification_emails')
        .single()

      if (settings?.value && Array.isArray(settings.value)) {
        recipients = settings.value
      } else {
        console.warn('No admin emails configured')
        recipients = []
      }
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: 'No recipients' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Generate Content
    const { subject, html } = getEmailTemplate(template, { ...data, siteUrl })

    // Send Email (Using Resend API as primary example)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emailProviderApiKey}`,
      },
      body: JSON.stringify({
        from: `${emailFromName} <${emailFrom}>`,
        to: recipients,
        subject: subject,
        html: html,
      }),
    })

    const result = await res.json()
    const status = res.ok ? 'sent' : 'failed'

    // Log to Outbox
    await supabase.from('email_outbox').insert({
      event_type: template,
      to_emails: recipients,
      subject: subject,
      html: html, // Optional: might want to truncate if huge
      status: status,
      provider_message_id: result.id || null,
      error: !res.ok ? JSON.stringify(result) : null,
      related_order_id: relatedOrderId || null,
      related_user_id: relatedUserId || null,
    })

    if (!res.ok) {
      console.error('Email Provider Error:', result)
      throw new Error('Failed to send email via provider')
    }

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Send Email Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
