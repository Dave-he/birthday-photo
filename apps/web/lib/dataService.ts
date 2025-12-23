import { supabase } from './supabaseClient'
import { Photo, Scene, Settings } from '@/types'

export const dataService = {
  async getPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*, members(*)')
      .order('position_index', { ascending: true })
    
    if (error) throw error
    return { data: data as Photo[] || [] }
  },

  async getScenes() {
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return { data: data as Scene[] || [] }
  },

  async getSettings(): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single()
    
    if (error) {
      console.error('Error fetching settings:', error)
      return null
    }
    return data as Settings
  }
}
