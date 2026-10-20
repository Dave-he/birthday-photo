'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Scene, Settings, SceneMode, GalleryLayout, GALLERY_LAYOUTS, SCENE_MODES } from '@/types'
import { supabase } from '@/lib/supabaseClient'

type QualityPreset = 'auto' | 'low' | 'high'

interface SceneHUDProps {
  hasStarted: boolean
  scenes: Scene[]
  currentSceneId: string | null
  onSceneChange: (id: string) => void
  mode: SceneMode
  onModeChange: (mode: SceneMode) => void
  galleryLayout: GalleryLayout
  onLayoutChange: (layout: GalleryLayout) => void
  settings: Settings | null
  isPlaying: boolean
  onToggleMusic: () => void
  /** Set when the configured background track could not be loaded. */
  musicError?: boolean
  qualityPreset?: QualityPreset
  onQualityPresetChange?: (val: QualityPreset) => void
  particleMultiplier?: number
  onParticleMultiplierChange?: (val: number) => void
  rotateSpeed?: number
  onRotateSpeedChange?: (val: number) => void
}

const MODE_ITEMS: { id: SceneMode; icon: string; label: string }[] = [
  { id: 'christmas', icon: '🎄', label: 'Christmas' },
  { id: 'birthday', icon: '🎂', label: 'Birthday' },
  { id: 'romantic', icon: '💖', label: 'Romantic' },
  { id: 'party', icon: '🎉', label: 'Party' },
]

// Build a quick lookup so we can verify the SCENE_MODES constant and the
// MODE_ITEMS display list never drift apart at runtime.
const MODE_ITEM_IDS = new Set(MODE_ITEMS.map((m) => m.id))
for (const mode of SCENE_MODES) {
  if (!MODE_ITEM_IDS.has(mode)) {
    // eslint-disable-next-line no-console
    console.warn(`[SceneHUD] MODE_ITEMS missing entry for scene mode: ${mode}`)
  }
}

const QUALITY_PRESETS: QualityPreset[] = ['auto', 'low', 'high']

export default function SceneHUD({
  hasStarted,
  scenes,
  currentSceneId,
  onSceneChange,
  mode,
  onModeChange,
  galleryLayout,
  onLayoutChange,
  settings,
  isPlaying,
  onToggleMusic,
  musicError,
  qualityPreset,
  onQualityPresetChange,
  particleMultiplier,
  onParticleMultiplierChange,
  rotateSpeed,
  onRotateSpeedChange
}: SceneHUDProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const musicErrorShown = useRef(false)

  // Tell the visitor why the music toggle disappeared. Hooks have to run
  // before the early return below.
  useEffect(() => {
    if (!musicError || musicErrorShown.current) return
    musicErrorShown.current = true
    setToast({ message: 'Background music could not be loaded', type: 'error' })
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [musicError])

  if (!hasStarted) return null

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  const handleSaveToSettings = async () => {
    // Require an authenticated user — settings table is write-protected by RLS.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please login to save settings', 'error')
      return
    }

    // The settings table is a singleton; without a row id there is nothing to
    // update. Point the user at the admin panel instead of failing silently.
    if (!settings?.id) {
      showToast('No settings record yet — create one in the admin panel', 'error')
      return
    }

    // Persist the configuration that the settings table actually has columns
    // for: the landing scene plus the visual mode / gallery layout.
    const { error } = await supabase
      .from('settings')
      .update({
        default_scene_id: currentSceneId || null,
        default_mode: mode,
        default_layout: galleryLayout,
      })
      .eq('id', settings.id)

    if (error) {
      console.error(error)
      showToast('Failed to save settings', 'error')
      return
    }
    showToast('Settings saved successfully!', 'success')
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-xl backdrop-blur-md border ${
                toast.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-100' : 'bg-red-500/20 border-red-500/50 text-red-100'
            }`}
          >
              {toast.message}
          </motion.div>
      )}

      {/* Scene Selector (Top Left) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-20 flex flex-col gap-2"
      >
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl transition-all hover:bg-black/40">
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-semibold px-1 block mb-1">Current Scene</label>
          <div className="relative">
            <select
              value={currentSceneId || ''}
              onChange={(e) => onSceneChange(e.target.value)}
              className="w-full bg-transparent text-white border-none outline-none cursor-pointer font-serif text-lg appearance-none pr-8 py-1"
            >
              {scenes.map(scene => (
                <option key={scene.id} value={scene.id} className="text-black bg-white">{scene.name}</option>
              ))}
              <option value="" className="text-black bg-white">All Photos</option>
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              ▼
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <button
            onClick={handleSaveToSettings}
            className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs py-2 px-3 rounded-lg backdrop-blur-md border border-white/5 transition-all flex items-center justify-center gap-2"
        >
            <span>💾 Save Configuration</span>
        </button>
      </motion.div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 w-64 shadow-2xl"
        >
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Performance & Visuals</h3>
            
            {/* Quality Preset */}
            <div className="mb-4">
                <label className="text-[10px] text-white/50 block mb-1">Quality Preset</label>
                <div className="flex bg-white/10 rounded-lg p-1">
                    {QUALITY_PRESETS.map((q) => (
                        <button
                            key={q}
                            onClick={() => onQualityPresetChange?.(q)}
                            className={`flex-1 py-1 text-[10px] rounded capitalize transition-all ${
                                qualityPreset === q ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
                            }`}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Particle Multiplier */}
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <label className="text-[10px] text-white/50">Particles</label>
                    <span className="text-[10px] text-white/80">{particleMultiplier?.toFixed(1)}x</span>
                </div>
                <input 
                    type="range" 
                    min="0.1" 
                    max="2" 
                    step="0.1" 
                    value={particleMultiplier || 1}
                    onChange={(e) => onParticleMultiplierChange?.(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Rotation Speed */}
            <div>
                <div className="flex justify-between mb-1">
                    <label className="text-[10px] text-white/50">Rotation Speed</label>
                    <span className="text-[10px] text-white/80">{rotateSpeed?.toFixed(1)}x</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.1" 
                    value={rotateSpeed ?? 0.8}
                    onChange={(e) => onRotateSpeedChange?.(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </motion.div>
      )}

      {/* Main Controls (Bottom Center) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col md:flex-row gap-4 items-center"
      >
        {/* Control Bar */}
        <div className="flex gap-2 p-2 bg-black/30 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
          
          {/* Mode Switcher */}
          <div className="flex gap-1">
            {MODE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onModeChange(item.id)}
                className={`relative group p-3 rounded-full transition-all duration-300 ${
                  mode === item.id
                    ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-110'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-white/10 mx-2 self-center"></div>

          {/* Layout Switcher */}
          <div className="flex gap-1 bg-black/20 rounded-full p-1">
            {GALLERY_LAYOUTS.map((layout) => (
              <button
                key={layout}
                onClick={() => onLayoutChange(layout)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 capitalize ${
                  galleryLayout === layout
                    ? 'bg-white/90 text-black shadow-lg scale-105'
                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {layout}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-white/10 mx-2 self-center"></div>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-full transition-all duration-300 ${
              showSettings 
                ? 'bg-white/20 text-white' 
                : 'text-white/40 hover:bg-white/10 hover:text-white'
            }`}
            title="Settings"
          >
            ⚙️
          </button>

          {/* Music Toggle — hidden when the track could not be loaded, so the
              button never silently does nothing. */}
          {settings?.bg_music_url && !musicError && (
            <button
              onClick={onToggleMusic}
              className={`p-3 rounded-full transition-all duration-300 ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                  : 'text-white/40 hover:bg-white/10 hover:text-white'
              }`}
              title={isPlaying ? "Pause Music" : "Play Music"}
            >
              {isPlaying ? "🔊" : "🔇"}
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
}
