import type { Database } from '../types/supabase'
import type { Photo, Scene, Settings } from '../types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase as defaultSupabase } from '../supabase'

export interface RealtimeListeners {
  onPhotoChange?: (event: 'INSERT' | 'UPDATE' | 'DELETE', photo: Photo) => void
  onSceneChange?: (event: 'INSERT' | 'UPDATE' | 'DELETE', scene: Scene) => void
  onSettingsChange?: (event: 'INSERT' | 'UPDATE' | 'DELETE', settings: Settings) => void
}

export interface RealtimeOptions {
  supabaseClient?: SupabaseClient<Database>
  listeners: RealtimeListeners
}

export class RealtimeService {
  private client: SupabaseClient<Database>
  private listeners: RealtimeListeners
  private channels: any[] = []

  constructor(options: RealtimeOptions) {
    this.client = options.supabaseClient || defaultSupabase
    this.listeners = options.listeners
    this.initRealtime()
  }

  private initRealtime() {
    // Listen to photos changes
    if (this.listeners.onPhotoChange) {
      const photosChannel = this.client
        .channel('public:photos')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'photos' },
          (payload) => {
            this.listeners.onPhotoChange?.(payload.eventType as any, payload.new as unknown as Photo)
          }
        )
        .subscribe()

      this.channels.push(photosChannel)
    }

    // Listen to scenes changes
    if (this.listeners.onSceneChange) {
      const scenesChannel = this.client
        .channel('public:scenes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scenes' },
          (payload) => {
            this.listeners.onSceneChange?.(payload.eventType as any, payload.new as unknown as Scene)
          }
        )
        .subscribe()

      this.channels.push(scenesChannel)
    }

    // Listen to settings changes
    if (this.listeners.onSettingsChange) {
      const settingsChannel = this.client
        .channel('public:settings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settings' },
          (payload) => {
            this.listeners.onSettingsChange?.(payload.eventType as any, payload.new as unknown as Settings)
          }
        )
        .subscribe()

      this.channels.push(settingsChannel)
    }
  }

  // Add a listener after initialization
  addListener(type: keyof RealtimeListeners, callback: any) {
    this.listeners[type] = callback
    
    // Re-initialize realtime to add new listeners
    this.initRealtime()
  }

  // Remove a listener
  removeListener(type: keyof RealtimeListeners) {
    delete this.listeners[type]
  }

  // Cleanup all subscriptions
  destroy() {
    this.channels.forEach(channel => {
      this.client.removeChannel(channel)
    })
    this.channels = []
  }
}
