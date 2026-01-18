import { supabase } from '@/lib/supabase/client'

export interface HeroSlide {
  id: string
  image_url: string
  title?: string
  subtitle?: string
  cta_text?: string
  cta_href?: string
  is_active: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export const heroSlidesService = {
  async getSlides(activeOnly = true) {
    let query = supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    return { data: data as HeroSlide[], error }
  },

  async createSlide(slide: Partial<HeroSlide>) {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert(slide)
      .select()
      .single()
    return { data, error }
  },

  async updateSlide(id: string, updates: Partial<HeroSlide>) {
    const { data, error } = await supabase
      .from('hero_slides')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteSlide(id: string) {
    // We might want to delete the image from storage too, but simple delete for now
    const { error } = await supabase.from('hero_slides').delete().eq('id', id)
    return { error }
  },

  async uploadImage(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `hero-slides/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(fileName, file)

    if (uploadError) return { url: null, error: uploadError }

    const { data } = supabase.storage.from('site-assets').getPublicUrl(fileName)

    return { url: data.publicUrl, error: null }
  },
}
