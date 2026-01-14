import { supabase } from '@/lib/supabase/client'

export interface PlanFeature {
  id: string
  plan_id: string
  text: string
  sort_order: number
}

export interface Plan {
  id: string
  slug: string
  name: string
  description: string
  price_cents: number
  is_active: boolean
  sort_order: number
  highlight: boolean
  cta: string
  features?: PlanFeature[]
}

export const plansService = {
  async getPlans(activeOnly = true) {
    let query = supabase
      .from('plans')
      .select('*, features:plan_features(*)')
      .order('sort_order', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    // Sort features manually if needed, or rely on client sorting
    if (data) {
      data.forEach((plan) => {
        if (plan.features) {
          plan.features.sort((a: any, b: any) => a.sort_order - b.sort_order)
        }
      })
    }

    return { data: data as Plan[], error }
  },

  async getPlanBySlug(slug: string) {
    const { data, error } = await supabase
      .from('plans')
      .select('*, features:plan_features(*)')
      .eq('slug', slug)
      .single()

    if (data && data.features) {
      data.features.sort((a: any, b: any) => a.sort_order - b.sort_order)
    }

    return { data: data as Plan, error }
  },

  async createPlan(plan: Partial<Plan>) {
    const { data, error } = await supabase
      .from('plans')
      .insert(plan)
      .select()
      .single()
    return { data, error }
  },

  async updatePlan(id: string, updates: Partial<Plan>) {
    // Separate features from plan updates
    const { features, ...planUpdates } = updates as any
    const { data, error } = await supabase
      .from('plans')
      .update(planUpdates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deletePlan(id: string) {
    const { error } = await supabase.from('plans').delete().eq('id', id)
    return { error }
  },

  async createFeature(feature: Partial<PlanFeature>) {
    const { data, error } = await supabase
      .from('plan_features')
      .insert(feature)
      .select()
      .single()
    return { data, error }
  },

  async deleteFeature(id: string) {
    const { error } = await supabase.from('plan_features').delete().eq('id', id)
    return { error }
  },

  async updateFeature(id: string, updates: Partial<PlanFeature>) {
    const { data, error } = await supabase
      .from('plan_features')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },
}
