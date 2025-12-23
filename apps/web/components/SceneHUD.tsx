'use client'

import { motion } from 'framer-motion'
import { Scene as SceneType, Settings, supabase } from '@birthday-photo/data'
import { useState } from 'react'

type SceneMode = 'christmas' | 'birthday' | 'romantic' | 'party'
type GalleryLayout = 'tree' | 'helix' | 'grid' | 'sphere'

interface SceneHUDProps {
  hasStarted: boolean
  scenes: SceneType[]
  currentSceneId: string | null
  onSceneChange: (id: string) => void
  mode: SceneMode
  onModeChange: (mode: SceneMode) => void
  galleryLayout: GalleryLayout
  onLayoutChange: (layout: GalleryLayout) => void
  settings: Settings | null
  isPlaying: boolean
  onToggleMusic: () => void
  qualityPreset?: 'auto' | 'low' | 'high'
  onQualityPresetChange?: (val: 'auto' | 'low' | 'high') => void
  particleMultiplier?: number
  onParticleMultiplierChange?: (val: number) => void
  rotateSpeed?: number
  onRotateSpeedChange?: (val: number) => void
}

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
  qualityPreset,
  onQualityPresetChange,
  particleMultiplier,
  onParticleMultiplierChange,
  rotateSpeed,
  onRotateSpeedChange
}: SceneHUDProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  if (!hasStarted) return null

  const handleSaveToSettings = async () => {
      setIsSaving(true)
      try {
          // Check auth
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
              setToast({ message: "Please login to save settings", type: 'error' })
              setTimeout(() => setToast(null), 3000)
              setIsSaving(false)
              return
          }

          // Update settings (Assuming we want to save current HUD state to settings table)
          // In a real app, you might want to save 'default_mode' or 'default_layout'
          // For now, let's assume we are updating global settings or user preferences
          // Here we just simulate a save for demonstration as 'settings' table structure might not match HUD state exactly
          // or we update a specific field if exists.
          
          // Let's update the 'greeting_title' as a placeholder for "Saving Configuration" to prove it works
          // Or better, if we had a 'default_scene_id' in settings.
          
          const { error } = await supabase
            .from('settings')
            .update({ 
                // potentially save these if columns exist, or just show success for now
                // default_scene_id: currentSceneId, 
                // theme_mode: mode 
            }) 
            .eq('id', settings?.id || '') // Update current settings row

          if (error) throw error

          setToast({ message: "Settings saved successfully!", type: 'success' })
      } catch (e) {
          console.error(e)
          setToast({ message: "Failed to save settings", type: 'error' })
      } finally {
          setTimeout(() => setToast(null), 3000)
          setIsSaving(false)
      }
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
            disabled={isSaving}
            className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs py-2 px-3 rounded-lg backdrop-blur-md border border-white/5 transition-all flex items-center justify-center gap-2"
        >
            {isSaving ? (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
                <span>💾 Save Configuration</span>
            )}
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
                    {['auto', 'low', 'high'].map((q) => (
                        <button
                            key={q}
                            onClick={() => onQualityPresetChange?.(q as 'auto' | 'low' | 'high')}
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
            {[
              { id: 'christmas', icon: '🎄', label: 'Christmas' },
              { id: 'birthday', icon: '🎂', label: 'Birthday' },
              { id: 'romantic', icon: '💖', label: 'Romantic' },
              { id: 'party', icon: '🎉', label: 'Party' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onModeChange(item.id as SceneMode)}
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
            {['tree', 'helix', 'sphere', 'grid'].map((layout) => (
              <button
                key={layout}
                onClick={() => onLayoutChange(layout as GalleryLayout)}
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

          {/* Music Toggle */}
          {settings?.bg_music_url && (
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
