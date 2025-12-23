import { create } from 'zustand'
import { dataService } from '@/lib/dataService'
import { Photo, Scene, Settings } from '@/types'

interface AppState {
  photos: Photo[]
  scenes: Scene[]
  settings: Settings | null
  currentSceneId: string | null
  isLoading: boolean
  
  // Actions
  fetchInitialData: () => Promise<void>
  fetchPhotos: (sceneId: string | null) => Promise<void>
  setCurrentSceneId: (id: string | null) => void
  
  // Realtime Actions (called by subscription)
  setPhotos: (photos: Photo[]) => void
  updatePhoto: (photo: Photo) => void
  addPhoto: (photo: Photo) => void
  removePhoto: (id: string) => void
  
  setSettings: (settings: Settings) => void
  
  setScenes: (scenes: Scene[]) => void
  addScene: (scene: Scene) => void
  updateScene: (scene: Scene) => void
  removeScene: (id: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  photos: [],
  scenes: [],
  settings: null,
  currentSceneId: null,
  isLoading: true,

  fetchInitialData: async () => {
    set({ isLoading: true })
    
    // Fetch Scenes
    const { data: scenes } = await dataService.getScenes()
    
    // Fetch Settings
    const settings = await dataService.getSettings()

    set({ 
        scenes: scenes || [], 
        settings: settings || null,
        // If we have scenes, default to first one, else null
        currentSceneId: scenes && scenes.length > 0 ? scenes[0].id : null,
        isLoading: false
    })

    // Fetch Photos for the initial scene
    await get().fetchPhotos(get().currentSceneId)
  },

  fetchPhotos: async (sceneId) => {
    const { data } = await dataService.getPhotos()
    
    // Filter photos by scene if sceneId is provided
    const filteredPhotos = sceneId 
      ? data.filter(photo => photo.scene_id === sceneId)
      : data

    if (filteredPhotos) {
        set({ photos: filteredPhotos })
    }
  },

  setCurrentSceneId: (id) => {
      set({ currentSceneId: id })
      get().fetchPhotos(id)
  },

  // Realtime Helpers
  setPhotos: (photos) => set({ photos }),
  updatePhoto: (photo) => set((state) => ({
      photos: state.photos.map(p => p.id === photo.id ? { ...p, ...photo } : p)
  })),
  addPhoto: (photo) => set((state) => {
      // Only add if it matches current scene filter
      if (state.currentSceneId && photo.scene_id !== state.currentSceneId) return state;
      return { photos: [...state.photos, photo] }
  }),
  removePhoto: (id) => set((state) => ({
      photos: state.photos.filter(p => p.id !== id)
  })),

  setSettings: (settings) => set({ settings }),

  setScenes: (scenes) => set({ scenes }),
  addScene: (scene) => set((state) => ({ scenes: [scene, ...state.scenes] })),
  updateScene: (scene) => set((state) => ({
      scenes: state.scenes.map(s => s.id === scene.id ? scene : s)
  })),
  removeScene: (id) => set((state) => ({
      scenes: state.scenes.filter(s => s.id !== id)
  })),
}))
