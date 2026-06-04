'use client'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

interface PostProcessingProps {
  /**
   * Particle multiplier (0.1–2.0) used to pick the post-processing tier:
   *   pm < 0.3  → no post processing
   *   pm < 0.7  → vignette only
   *   pm < 1.5  → bloom + vignette (medium)
   *   pm >= 1.5 → bloom + vignette (high)
   */
  particleMultiplier: number
}

/**
 * Adaptive post-processing chain. Toggling each EffectComposer off is the
 * cheapest way to recover frame budget on low-end devices, so we pick the
 * chain statically off `particleMultiplier` rather than dynamically
 * mounting/unmounting effects at runtime.
 */
export default function PostProcessing({ particleMultiplier }: PostProcessingProps) {
  if (particleMultiplier < 0.3) return null

  if (particleMultiplier < 0.7) {
    return (
      <EffectComposer enabled enableNormalPass={false}>
        <Vignette eskil={false} offset={0.15} darkness={1.0} />
      </EffectComposer>
    )
  }

  if (particleMultiplier < 1.5) {
    return (
      <EffectComposer enabled enableNormalPass={false}>
        <Bloom luminanceThreshold={0.3} mipmapBlur intensity={1.0} radius={0.3} />
        <Vignette eskil={false} offset={0.12} darkness={1.05} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer enabled enableNormalPass={false}>
      <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  )
}
