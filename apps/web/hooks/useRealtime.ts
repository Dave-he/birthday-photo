import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { RealtimeService } from '@/lib/RealtimeService'
import { useStore } from './useStore'

export const useRealtime = () => {
  const {
      addPhoto, updatePhoto, removePhoto,
      setSettings,
      addScene, updateScene, removeScene
  } = useStore(useShallow((state) => ({
      addPhoto: state.addPhoto,
      updatePhoto: state.updatePhoto,
      removePhoto: state.removePhoto,
      setSettings: state.setSettings,
      addScene: state.addScene,
      updateScene: state.updateScene,
      removeScene: state.removeScene,
  })))

  useEffect(() => {
    // Create a realtime service instance
    const realtimeService = new RealtimeService({
      listeners: {
        onPhotoChange: (event, photo) => {
          if (event === 'INSERT') addPhoto(photo)
          if (event === 'UPDATE') updatePhoto(photo)
          if (event === 'DELETE') removePhoto(photo.id)
        },
        onSettingsChange: (event, settings) => {
          if (event === 'UPDATE' || event === 'INSERT') {
            setSettings(settings)
          }
        },
        onSceneChange: (event, scene) => {
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
