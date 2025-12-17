import type { Photo, Scene, Settings, Member } from '../types'
import type { Database } from '../types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase as defaultSupabase } from '../supabase'

interface DataServiceOptions {
  supabaseClient?: SupabaseClient<Database>
}

export class DataService {
  private client: SupabaseClient<Database>

  constructor(options?: DataServiceOptions) {
    this.client = options?.supabaseClient || defaultSupabase
  }

  // Photo Methods
  async getPhotos(limit?: number) {
    let query = this.client
      .from('photos')
      .select('*, members(*)', { count: 'exact' })
      .order('position_index', { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching photos:', error)
      throw error
    }

    return { data: data as unknown as Photo[], count }
  }

  async getPhotoById(id: string) {
    const { data, error } = await this.client
      .from('photos')
      .select('*, members(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching photo by id:', error)
      throw error
    }

    return data as unknown as Photo
  }

  async createPhoto(photo: Omit<Photo, 'id'>) {
    const { data, error } = await this.client
      .from('photos')
      .insert(photo)
      .select()
      .single()

    if (error) {
      console.error('Error creating photo:', error)
      throw error
    }

    return data as unknown as Photo
  }

  async updatePhoto(id: string, photo: Partial<Photo>) {
    const { data, error } = await this.client
      .from('photos')
      .update(photo)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating photo:', error)
      throw error
    }

    return data as unknown as Photo
  }

  async deletePhoto(id: string) {
    const { error } = await this.client
      .from('photos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting photo:', error)
      throw error
    }

    return true
  }

  // Scene Methods
  async getScenes(limit?: number) {
    let query = this.client
      .from('scenes')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching scenes:', error)
      throw error
    }

    return { data: data as unknown as Scene[], count }
  }

  async getSceneById(id: string) {
    const { data, error } = await this.client
      .from('scenes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching scene by id:', error)
      throw error
    }

    return data as unknown as Scene
  }

  // Settings Methods
  async getSettings() {
    const { data, error } = await this.client
      .from('settings')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching settings:', error)
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return {
          id: '',
          bg_music_url: '',
          snow_density: 50,
          is_snowing: false,
          greeting_title: 'Happy Birthday!',
          auto_mode_cycle_enabled: false,
          mode_cycle_min_seconds: 30,
          mode_cycle_max_seconds: 60,
          low_quality_mode: false,
          particle_multiplier: 1,
          rotate_speed: 0.5
        } as Settings
      }
      throw error
    }

    return data as unknown as Settings
  }

  async updateSettings(settings: Settings) {
    const { data, error } = await this.client
      .from('settings')
      .upsert(settings)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      throw error
    }

    return data as unknown as Settings
  }

  // Member Methods
  async getMembers(limit?: number) {
    let query = this.client
      .from('members')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching members:', error)
      throw error
    }

    return { data: data as unknown as Member[], count }
  }
}

// Default service using environment variables
export const dataService = new DataService()

export { RealtimeService } from './realtime'
