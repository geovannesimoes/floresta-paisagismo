import { supabase } from '@/lib/supabase/client'

export interface ClientRegistrationData {
  full_name: string
  email: string
  cpf: string
  whatsapp: string
}

export interface CustomerProfile {
  id: string
  full_name: string
  cpf: string
  whatsapp: string
  must_change_password: boolean
}

export const authService = {
  async registerClient(data: ClientRegistrationData) {
    const { data: result, error } = await supabase.functions.invoke(
      'register-client',
      {
        body: data,
      },
    )
    return { data: result, error }
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data: data as CustomerProfile, error }
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    })
    return { data, error }
  },

  async markPasswordChanged(userId: string) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update({
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async resetPassword(email: string) {
    const redirectUrl = `${window.location.origin}/area-cliente`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    return { error }
  },
}
