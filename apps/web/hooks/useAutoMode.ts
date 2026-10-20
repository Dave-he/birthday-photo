import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/hooks/useStore'
import { getNextCycleState, getLayoutForMode, resolveSavedVisuals } from '@/lib/autoMode'
import { SceneMode, GalleryLayout } from '@/types'

export function useAutoMode(hasStarted: boolean) {
    const [mode, setMode] = useState<SceneMode>('christmas')
    const [galleryLayout, setGalleryLayout] = useState<GalleryLayout>('tree')
    const settings = useStore((state) => state.settings)

    // Latest values for the interval callback. Kept in refs so the timer is
    // never torn down and re-created on every visual change.
    const modeRef = useRef<SceneMode>(mode)
    const layoutRef = useRef<GalleryLayout>(galleryLayout)

    useEffect(() => { modeRef.current = mode }, [mode])
    useEffect(() => { layoutRef.current = galleryLayout }, [galleryLayout])

    // Restore the saved default visuals exactly once, as soon as the settings
    // arrive. The ref guard keeps it from fighting the user afterwards.
    const appliedSavedVisuals = useRef(false)
    useEffect(() => {
        if (appliedSavedVisuals.current) return
        if (!settings) return
        appliedSavedVisuals.current = true

        const { mode: savedMode, layout: savedLayout } = resolveSavedVisuals(settings)
        if (savedMode) setMode(savedMode)
        if (savedLayout) setGalleryLayout(savedLayout)
    }, [settings])

    /**
     * Switch to another scene mode.
     *
     * The layout follows when it has to: the `tree` layout needs the
     * christmas tree, so switching away from christmas replaces it with
     * the layout that suits the new scene. Every other layout is the
     * visitor's own choice and is left alone.
     */
    const changeMode = useCallback((next: SceneMode) => {
        setMode(next)
        setGalleryLayout((current) => getLayoutForMode(next, current))
    }, [])

    useEffect(() => {
        if (!hasStarted) return
        if (settings?.auto_mode_cycle_enabled === false) return

        const minSec = settings?.mode_cycle_min_seconds ?? 60
        const maxSec = settings?.mode_cycle_max_seconds ?? 180
        const minMs = Math.max(5, minSec) * 1000
        const maxMs = Math.max(minSec, maxSec) * 1000
        const intervalMs = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs)

        const interval = setInterval(() => {
            // Derive the next pair from the live state so the cycle continues
            // from the restored scene instead of always starting at index 0.
            const next = getNextCycleState(modeRef.current, layoutRef.current)
            setMode(next.mode)
            setGalleryLayout(next.layout)
        }, intervalMs)

        return () => clearInterval(interval)
      }, [hasStarted, settings?.auto_mode_cycle_enabled, settings?.mode_cycle_min_seconds, settings?.mode_cycle_max_seconds])

      return { mode, setMode: changeMode, galleryLayout, setGalleryLayout }
}
