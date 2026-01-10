import { supabase } from '@/lib/supabase/client'

export interface SiteSettings {
  id: string
  company_name: string
  logo_url: string | null
  hero_image_url: string | null

  // CMS Fields
  hero_title?: string
  hero_subtitle?: string
  hero_button_text?: string
  hero_button_link?: string

  cta_title?: string
  cta_text?: string
  cta_button_text?: string
  cta_button_link?: string
  cta_background_image_url?: string | null

  contact_phone?: string
  contact_email?: string
  address?: string
  instagram_link?: string

  primary_color?: string
  accent_color?: string

  updated_at: string
}

export const siteSettingsService = {
  async getSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()

    return { data, error }
  },

  async updateSettings(id: string, updates: Partial<SiteSettings>) {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async uploadAsset(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file)

    if (uploadError) {
      return { url: null, error: uploadError }
    }

    const { data } = supabase.storage.from('site-assets').getPublicUrl(filePath)

    return { url: data.publicUrl, error: null }
  },
}
