'use client'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { SceneQuality } from '@/lib/sceneQuality'

interface PostProcessingProps {
  /**
   * The scene's quality configuration. The tier decides how much of the
   * post-processing chain is enabled:
   *
   *   low    → vignette only (one cheap full-screen pass)
   *   medium → bloom + vignette
   *   high   → bloom (stronger) + vignette
   *
   * Toggling each EffectComposer off is the cheapest way to recover frame
   * budget on low-end devices, so the chain is picked statically from the
   * tier rather than mounted and unmounted at runtime.
   */
  quality: SceneQuality
}

export default function PostProcessing({ quality }: PostProcessingProps) {
  const { tier } = quality

  if (tier === 'low') {
    return (
      <EffectComposer enabled enableNormalPass={false}>
        <Vignette eskil={false} offset={0.15} darkness={1.0} />
      </EffectComposer>
    )
  }

  if (tier === 'medium') {
    return (
      <EffectComposer enabled enableNormalPass={false}>
        {/* A quarter-height bloom buffer: the blur is by far the most
            expensive thing in the frame, and the difference between a
            240px and a 480px buffer is barely visible on the small glowing
            lights it is applied to. */}
        <Bloom luminanceThreshold={0.3} mipmapBlur intensity={0.9} radius={0.3} height={240} />
        <Vignette eskil={false} offset={0.12} darkness={1.05} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer enabled enableNormalPass={false}>
      <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.4} radius={0.4} height={480} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  )
}
