import { supabase } from './supabaseClient'
import { Photo, Scene, Settings } from '@/types'

export const dataService = {
  /**
   * Fetch photos, optionally narrowed to a single scene.
   *
   * The scene filter is pushed down to PostgREST instead of being applied in
   * the browser: a gallery can hold hundreds of photos and we only ever
   * render the ones belonging to the active scene.
   */
  async getPhotos(sceneId?: string | null) {
    let query = supabase
      .from('photos')
      .select('*, members(*)')
      .order('position_index', { ascending: true })

    if (sceneId) {
      query = query.eq('scene_id', sceneId)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: (data as Photo[]) || [] }
  },

  async getScenes() {
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return { data: (data as Scene[]) || [] }
  },

  async getSettings(): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching settings:', error)
      return null
    }
    return (data as Settings) ?? null
  }
}
