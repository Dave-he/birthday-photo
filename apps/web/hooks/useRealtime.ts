import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useStore } from './useStore'
import { Photo, Scene, Settings } from '@/types'

export const useRealtime = () => {
  const { 
      addPhoto, updatePhoto, removePhoto,
      setSettings,
      addScene, updateScene, removeScene
  } = useStore()

  useEffect(() => {
    // Channel for all DB changes we care about
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photos' },
        (payload) => {
          console.log('Realtime photo change:', payload)
          if (payload.eventType === 'INSERT') addPhoto(payload.new as Photo)
          if (payload.eventType === 'UPDATE') updatePhoto(payload.new as Photo)
          if (payload.eventType === 'DELETE') removePhoto(payload.old.id)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          console.log('Realtime settings change:', payload)
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setSettings(payload.new as Settings)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scenes' },
        (payload) => {
          console.log('Realtime scene change:', payload)
          if (payload.eventType === 'INSERT') addScene(payload.new as Scene)
          if (payload.eventType === 'UPDATE') updateScene(payload.new as Scene)
          if (payload.eventType === 'DELETE') removeScene(payload.old.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addPhoto, updatePhoto, removePhoto, setSettings, addScene, updateScene, removeScene])
}
