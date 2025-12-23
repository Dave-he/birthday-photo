import { useEffect } from 'react'
import { RealtimeService } from '@/lib/RealtimeService'
import { useStore } from './useStore'

export const useRealtime = () => {
  const { 
      addPhoto, updatePhoto, removePhoto,
      setSettings,
      addScene, updateScene, removeScene
  } = useStore()

  useEffect(() => {
    // Create a realtime service instance
    const realtimeService = new RealtimeService({
      listeners: {
        onPhotoChange: (event, photo) => {
          console.log('Realtime photo change:', event, photo)
          if (event === 'INSERT') addPhoto(photo)
          if (event === 'UPDATE') updatePhoto(photo)
          if (event === 'DELETE') removePhoto(photo.id)
        },
        onSettingsChange: (event, settings) => {
          console.log('Realtime settings change:', event, settings)
          if (event === 'UPDATE' || event === 'INSERT') {
            setSettings(settings)
          }
        },
        onSceneChange: (event, scene) => {
          console.log('Realtime scene change:', event, scene)
          if (event === 'INSERT') addScene(scene)
          if (event === 'UPDATE') updateScene(scene)
          if (event === 'DELETE') removeScene(scene.id)
        }
      }
    })

    return () => {
      // Cleanup the realtime service
      realtimeService.destroy()
    }
  }, [addPhoto, updatePhoto, removePhoto, setSettings, addScene, updateScene, removeScene])
}
