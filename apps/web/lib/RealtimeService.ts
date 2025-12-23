import { supabase } from './supabaseClient'
import { Photo, Scene, Settings } from '@/types'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

interface RealtimeServiceConfig {
  listeners: {
    onPhotoChange?: (event: RealtimeEvent, photo: Photo) => void
    onSceneChange?: (event: RealtimeEvent, scene: Scene) => void
    onSettingsChange?: (event: RealtimeEvent, settings: Settings) => void
  }
}

export class RealtimeService {
  private channels: any[] = []

  constructor(config: RealtimeServiceConfig) {
    // Subscribe to photos table
    if (config.listeners.onPhotoChange) {
      const photosChannel = supabase
        .channel('photos-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'photos' },
          (payload) => {
            const event = payload.eventType as RealtimeEvent
            config.listeners.onPhotoChange?.(event, payload.new as Photo)
          }
        )
        .subscribe()
      
      this.channels.push(photosChannel)
    }

    // Subscribe to scenes table
    if (config.listeners.onSceneChange) {
      const scenesChannel = supabase
        .channel('scenes-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'scenes' },
          (payload) => {
            const event = payload.eventType as RealtimeEvent
            config.listeners.onSceneChange?.(event, payload.new as Scene)
          }
        )
        .subscribe()
      
      this.channels.push(scenesChannel)
    }

    // Subscribe to settings table
    if (config.listeners.onSettingsChange) {
      const settingsChannel = supabase
        .channel('settings-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'settings' },
          (payload) => {
            const event = payload.eventType as RealtimeEvent
            config.listeners.onSettingsChange?.(event, payload.new as Settings)
          }
        )
        .subscribe()
      
      this.channels.push(settingsChannel)
    }
  }

  destroy() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    this.channels = []
  }
}
