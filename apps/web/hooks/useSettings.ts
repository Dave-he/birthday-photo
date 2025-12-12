import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Settings } from '@/types'

const DEFAULT_SETTINGS: Settings & {
  auto_mode_cycle_enabled: boolean
  mode_cycle_min_seconds: number
  mode_cycle_max_seconds: number
} = {
  bg_music_url: '',
  snow_density: 200,
  is_snowing: true,
  greeting_title: 'Merry Christmas!',
  auto_mode_cycle_enabled: true,
  mode_cycle_min_seconds: 60,
  mode_cycle_max_seconds: 180,
}

export function useSettings() {
  const [settings, setSettings] = useState<typeof DEFAULT_SETTINGS>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('settings')
          .select('*')
          .single()

        if (!mounted) return

        const merged = {
          ...DEFAULT_SETTINGS,
          ...(data || {}),
          auto_mode_cycle_enabled: DEFAULT_SETTINGS.auto_mode_cycle_enabled,
          mode_cycle_min_seconds: DEFAULT_SETTINGS.mode_cycle_min_seconds,
          mode_cycle_max_seconds: DEFAULT_SETTINGS.mode_cycle_max_seconds,
        }
        setSettings(merged)
        setError(null)
      } catch (e: unknown) {
        if (!mounted) return
        const msg = e instanceof Error ? e.message : 'Failed to load settings'
        setError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSettings()
    return () => {
      mounted = false
    }
  }, [])

  return { settings, loading, error }
}

