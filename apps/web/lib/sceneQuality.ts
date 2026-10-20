// The explicit `.ts` extension keeps this module importable by the Node test
// runner (`node --test --experimental-strip-types`), which does not resolve
// the `@/` alias or extensionless relative paths.

/**
 * One place that decides how expensive the scene is allowed to be.
 *
 * The particle counts used to be spread over `SceneEffects`, the DPR over
 * `lib/adaptive.ts`, the shadow map over the environment and the star count
 * over the environment as well — so "low quality mode" only ever turned
 * *some* of the knobs down and the scene stayed expensive. Everything the
 * renderer does now comes from a single config object.
 */

export type QualityTier = 'low' | 'medium' | 'high'

export interface SceneQuality {
  tier: QualityTier
  /** Device pixel ratio range the renderer may use. */
  dpr: [number, number]
  /** Whether the scene casts shadows at all. */
  shadows: boolean
  /** Resolution of the directional light's shadow map. */
  shadowMapSize: number
  /** Number of stars in the background sky. */
  starCount: number
  /** Number of twinkling lights on the christmas tree. */
  treeLightCount: number
  /** Ambient gold sparkles. */
  magicParticleCount: number
  /** Falling snow (christmas). */
  snowCount: number
  /** Romantic sparkles. */
  sparkleCount: number
  /** Balloons. */
  balloonCount: number
  /** Fireworks. */
  fireworkCount: number
  /** Atmospheric clouds. */
  cloud: {
    enabled: boolean
    segments: number
    volume: number
    opacity: number
  }
  /** Cube-map resolution of the image-based lighting. */
  environmentResolution: number
  /** Whether the camera may rotate on its own. */
  autoRotate: boolean
}

export interface SceneQualityInput {
  /** The visitor (or the database) asked for low quality. */
  isLow: boolean
  /** The particle multiplier, 0.1 – 2. */
  particleMultiplier: number
  /** Snow density from the settings table. */
  snowDensity: number
  /** The visitor asked the system to reduce motion. */
  reducedMotion: boolean
}

/** Clamp a value into a range. */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), max)
}

export function getSceneQuality(input: SceneQualityInput): SceneQuality {
  const { isLow, reducedMotion } = input
  const multiplier = clamp(input.particleMultiplier, 0.1, 2)
  const snowDensity = clamp(input.snowDensity, 0, 3000)

  let tier: QualityTier
  if (isLow) tier = 'low'
  else if (multiplier < 0.7) tier = 'low'
  else if (multiplier < 1.5) tier = 'medium'
  else tier = 'high'

  const base: SceneQuality = {
    tier,
    dpr: tier === 'low' ? [1, 1] : tier === 'medium' ? [1, 1.5] : [1, 2],
    shadows: tier === 'high',
    shadowMapSize: tier === 'high' ? 1024 : 512,
    starCount: tier === 'low' ? 1200 : tier === 'medium' ? 3000 : 6000,
    treeLightCount: tier === 'low' ? 28 : tier === 'medium' ? 48 : 72,
    magicParticleCount: Math.round(75 * multiplier),
    snowCount: Math.round(snowDensity * multiplier),
    sparkleCount: Math.round(700 * multiplier),
    balloonCount: Math.round(40 * multiplier),
    fireworkCount: Math.round(16 * multiplier),
    cloud: {
      enabled: tier !== 'low',
      segments: tier === 'medium' ? 10 : 14,
      // drei scales every puff by `volume`; the default of 6 produced clouds
      // ten times the size of the tree.
      volume: tier === 'medium' ? 1.1 : 1.4,
      opacity: tier === 'medium' ? 0.16 : 0.22,
    },
    environmentResolution: tier === 'low' ? 64 : 128,
    autoRotate: !reducedMotion,
  }

  return base
}
