import { useState, useEffect } from 'react'
import { useStore } from '@/hooks/useStore'
import { SCENE_MODES, GALLERY_LAYOUTS, SceneMode, GalleryLayout } from '@/types'

export function useAutoMode(hasStarted: boolean) {
    const [mode, setMode] = useState<SceneMode>('christmas')
    const [galleryLayout, setGalleryLayout] = useState<GalleryLayout>('tree')
    const { settings } = useStore()

    useEffect(() => {
        if (!hasStarted) return
        if (settings?.auto_mode_cycle_enabled === false) return

        let currentModeIndex = 0
        let currentLayoutIndex = 0

        const minSec = settings?.mode_cycle_min_seconds ?? 60
        const maxSec = settings?.mode_cycle_max_seconds ?? 180
        const minMs = Math.max(5, minSec) * 1000
        const maxMs = Math.max(minSec, maxSec) * 1000
        const intervalMs = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs)

        const interval = setInterval(() => {
            currentModeIndex = (currentModeIndex + 1) % SCENE_MODES.length
            const nextMode = SCENE_MODES[currentModeIndex]
            setMode(nextMode)

            if (nextMode === 'christmas') {
                setGalleryLayout('tree')
            } else {
                currentLayoutIndex = (currentLayoutIndex + 1) % GALLERY_LAYOUTS.length
                setGalleryLayout(GALLERY_LAYOUTS[currentLayoutIndex])
            }
        }, intervalMs)

        return () => clearInterval(interval)
      }, [hasStarted, settings?.auto_mode_cycle_enabled, settings?.mode_cycle_min_seconds, settings?.mode_cycle_max_seconds])

      return { mode, setMode, galleryLayout, setGalleryLayout }
}
