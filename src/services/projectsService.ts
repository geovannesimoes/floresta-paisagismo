import { supabase } from '@/lib/supabase/client'

export interface ProjectMedia {
  id?: string
  project_id: string
  url: string
  type: 'before' | 'after' | 'gallery'
  description?: string
  plants_used?: string
  materials_used?: string
}

export interface Project {
  id: string
  title: string
  description: string
  client_name?: string
  is_featured: boolean
  status: string
  created_at?: string
  media?: ProjectMedia[]
}

export const projectsService = {
  async getProjects(featuredOnly = false) {
    let query = supabase
      .from('projects')
      .select('*, media:project_media(*)')
      .order('created_at', { ascending: false })

    if (featuredOnly) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getProjectById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, media:project_media(*)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createProject(project: Omit<Project, 'id' | 'media' | 'created_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()
    return { data, error }
  },

  async updateProject(id: string, updates: Partial<Project>) {
    // Remove media from updates if present to avoid errors
    const { media, ...safeUpdates } = updates as any

    const { data, error } = await supabase
      .from('projects')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    return { error }
  },

  async addMedia(media: Omit<ProjectMedia, 'id'>) {
    const { data, error } = await supabase
      .from('project_media')
      .insert(media)
      .select()
      .single()
    return { data, error }
  },

  async deleteMedia(id: string) {
    const { error } = await supabase.from('project_media').delete().eq('id', id)
    return { error }
  },

  async updateMedia(id: string, updates: Partial<ProjectMedia>) {
    const { data, error } = await supabase
      .from('project_media')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async uploadImage(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file)

    if (uploadError) {
      return { url: null, error: uploadError }
    }

    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath)

    return { url: data.publicUrl, error: null }
  },
}
