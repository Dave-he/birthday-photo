import { create } from 'zustand'
import { dataService } from '@/lib/dataService'
import { describeLoadError, resolveInitialSceneId } from '@/lib/loadState'
import { Photo, Scene, Settings } from '@/types'

interface AppState {
  photos: Photo[]
  scenes: Scene[]
  settings: Settings | null
  currentSceneId: string | null
  isLoading: boolean
  /**
   * Set when the initial load failed. The 3D scene keeps running with an empty
   * gallery — the visitor is never trapped on the loading screen.
   */
  error: string | null

  // Actions
  fetchInitialData: () => Promise<void>
  fetchPhotos: (sceneId: string | null) => Promise<void>
  setCurrentSceneId: (id: string | null) => void
  clearError: () => void

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
  error: null,

  fetchInitialData: async () => {
    set({ isLoading: true, error: null })

    try {
      // Fetch Scenes
      const { data: scenes } = await dataService.getScenes()

      // Fetch Settings
      const settings = await dataService.getSettings()

      // The scene saved as `default_scene_id` wins, otherwise use the first one.
      const initialSceneId = resolveInitialSceneId(settings, scenes)

      set({
        scenes: scenes || [],
        settings: settings || null,
        currentSceneId: initialSceneId,
        isLoading: false,
        error: null,
      })

      // Fetch Photos for the initial scene
      await get().fetchPhotos(initialSceneId)
    } catch (error) {
      // A failed backend must not break the 3D experience: keep the scene
      // alive with an empty gallery and surface the reason in the overlay.
      console.error('Failed to load initial data:', error)
      set({
        isLoading: false,
        error: describeLoadError(error),
      })
    }
  },

  fetchPhotos: async (sceneId) => {
    try {
      const { data } = await dataService.getPhotos(sceneId)
      set({ photos: data ?? [] })
    } catch (error) {
      console.error('Failed to load photos:', error)
      set({ photos: [], error: describeLoadError(error) })
    }
  },

  setCurrentSceneId: (id) => {
      set({ currentSceneId: id })
      get().fetchPhotos(id)
  },

  clearError: () => set({ error: null }),

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
