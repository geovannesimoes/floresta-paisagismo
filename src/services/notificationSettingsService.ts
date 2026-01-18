import { supabase } from '@/lib/supabase/client'

export const notificationSettingsService = {
  async getAdminEmails() {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('value')
      .eq('key', 'admin_notification_emails')
      .single()

    return {
      data: (data?.value as string[]) || [],
      error,
    }
  },

  async updateAdminEmails(emails: string[]) {
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        key: 'admin_notification_emails',
        value: emails,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    return { data, error }
  },
}
