/* eslint-disable */
import { supabase } from './supabaseClient'
import { Photo, Scene, Settings } from '@/types'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'
type TableName = 'photos' | 'scenes' | 'settings'

export interface RealtimeServiceConfig {
  listeners: {
    onPhotoChange?: (event: RealtimeEvent, photo: Photo) => void
    onSceneChange?: (event: RealtimeEvent, scene: Scene) => void
    onSettingsChange?: (event: RealtimeEvent, settings: Settings) => void
  }
}

const TABLE_TO_CHANNEL: Record<TableName, string> = {
  photos: 'photos-changes',
  scenes: 'scenes-changes',
  settings: 'settings-changes',
}

export class RealtimeService {
  private channels: any[] = []

  constructor(config: RealtimeServiceConfig) {
    if (config.listeners.onPhotoChange) {
      this.channels.push(this.subscribe('photos', config.listeners.onPhotoChange))
    }
    if (config.listeners.onSceneChange) {
      this.channels.push(this.subscribe('scenes', config.listeners.onSceneChange))
    }
    if (config.listeners.onSettingsChange) {
      this.channels.push(this.subscribe('settings', config.listeners.onSettingsChange))
    }
  }

  /**
   * Open a postgres_changes subscription on `table` and forward each row
   * payload to `onChange`. Kept generic so adding a new table is one line.
   */
  private subscribe<T>(table: TableName, onChange: (event: RealtimeEvent, row: T) => void) {
    return supabase
      .channel(TABLE_TO_CHANNEL[table])
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          onChange(payload.eventType as RealtimeEvent, payload.new as T)
        },
      )
      .subscribe()
  }

  destroy() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.channels = []
  }
}
