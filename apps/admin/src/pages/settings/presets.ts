export type PerformancePreset = "mobile" | "desktop" | "cinematic"

export interface PresetValues {
  low_quality_mode: boolean
  particle_multiplier: number
  rotate_speed: number
  auto_mode_cycle_enabled: boolean
  mode_cycle_min_seconds: number
  mode_cycle_max_seconds: number
}

/**
 * Recommended performance / cycle parameters per target device class.
 * Consumed by `SettingsEdit.applyPreset`.
 */
export const PERFORMANCE_PRESETS: Record<PerformancePreset, PresetValues> = {
  mobile: {
    low_quality_mode: true,
    particle_multiplier: 0.5,
    rotate_speed: 0.5,
    auto_mode_cycle_enabled: true,
    mode_cycle_min_seconds: 60,
    mode_cycle_max_seconds: 120,
  },
  desktop: {
    low_quality_mode: false,
    particle_multiplier: 1,
    rotate_speed: 0.8,
    auto_mode_cycle_enabled: true,
    mode_cycle_min_seconds: 60,
    mode_cycle_max_seconds: 180,
  },
  cinematic: {
    low_quality_mode: false,
    particle_multiplier: 1.5,
    rotate_speed: 1.2,
    auto_mode_cycle_enabled: true,
    mode_cycle_min_seconds: 90,
    mode_cycle_max_seconds: 240,
  },
}

export const PRESET_LABELS: Record<PerformancePreset, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  cinematic: "Cinematic",
}
