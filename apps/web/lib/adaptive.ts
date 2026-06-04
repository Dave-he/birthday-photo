export interface AdaptiveEventsConfig {
  enableDamping: boolean
  dampingFactor: number
  rotateSpeed: number
  zoomSpeed: number
  panSpeed: number
  enablePan: boolean
  enableZoom: boolean
}

/**
 * Adaptive DPR (Device Pixel Ratio) based on device performance and resolution.
 * Returns a number or [min, max] tuple accepted by R3F's `dpr` prop.
 */
export function getAdaptiveDpr(isLow: boolean): number | [number, number] {
  if (isLow) return 1
  if (typeof window === 'undefined') return [1, 1.5]

  const { devicePixelRatio, screen } = window
  // High-end devices with high resolution
  if (devicePixelRatio >= 2.5 && screen.width >= 1440) return 2
  // Medium-high end devices
  if (devicePixelRatio >= 2 && screen.width >= 1024) return 1.5
  // Low-mid range devices
  if (devicePixelRatio >= 1.5) return 1.25
  // Low-end devices
  return 1
}

/**
 * OrbitControls configuration tuned per device performance tier.
 */
export function getAdaptiveEventsConfig(isLow: boolean): AdaptiveEventsConfig {
  if (isLow) {
    return {
      enableDamping: false,
      dampingFactor: 0.05,
      rotateSpeed: 0.5,
      zoomSpeed: 0.5,
      panSpeed: 0.5,
      enablePan: false,
      enableZoom: true,
    }
  }
  return {
    enableDamping: true,
    dampingFactor: 0.05,
    rotateSpeed: 0.8,
    zoomSpeed: 0.8,
    panSpeed: 0.8,
    enablePan: true,
    enableZoom: true,
  }
}
