'use client'
import { Suspense } from 'react'
import { Sparkles, CloudInstance, Clouds } from '@react-three/drei'
import Balloons from './Balloons'
import Fireworks from './Fireworks'
import MagicParticles from './MagicParticles'
import { CLOUD_TEXTURE_URL } from '@/lib/assets'
import type { Settings, SceneMode } from '@/types'
import type { SceneQuality } from '@/lib/sceneQuality'

interface SceneEffectsProps {
    mode: SceneMode
    settings: Settings | null
    quality: SceneQuality
    reducedMotion?: boolean
}

export default function SceneEffects({
    mode,
    settings,
    quality,
    reducedMotion = false,
}: SceneEffectsProps) {
    return (
        <>
            {/* Global Magic Particles (Always active for magic feel) */}
            <MagicParticles
                count={quality.magicParticleCount}
                color={mode === 'romantic' ? '#ff69b4' : '#ffd700'}
            />

            {/* Mode Specific Effects */}
            {mode === 'christmas' && (settings?.is_snowing ?? true) && (
                <Sparkles
                    count={quality.snowCount}
                    scale={15}
                    size={3}
                    speed={0.4}
                    opacity={0.9}
                    color="#fff"
                />
            )}

            {mode === 'romantic' && (
                <Sparkles
                    count={quality.sparkleCount}
                    scale={15}
                    size={5}
                    speed={0.6}
                    opacity={0.7}
                    color="#ff69b4"
                    noise={quality.tier === 'low' ? 0.5 : 1}
                />
            )}

            {(mode === 'birthday' || mode === 'party') && (
                // Lowered so the balloons frame the scene instead of
                // crowding the title.
                <group position={[0, -2.8, 0]}>
                    <Balloons count={quality.balloonCount} reducedMotion={reducedMotion} />
                </group>
            )}

            {mode === 'party' && (
                <Fireworks count={quality.fireworkCount} reducedMotion={reducedMotion} />
            )}

            {/* Floating Clouds for atmosphere
                *
                * `<Cloud>` is only a thin wrapper that renders `<Clouds>` +
                * `<CloudInstance>`; the texture prop lives on `<Clouds>`. The
                * wrapper drops it, so the CDN default from drei would be
                * requested instead — and `useTexture` suspends forever when
                * that CDN is unreachable, which used to blank the whole scene.
                * The texture is therefore self-hosted, and the cloud sits in
                * its own Suspense boundary so a texture problem can never
                * take the gallery down.
                *
                * The puffs are also scaled down: drei multiplies every puff by
                * its `volume`, and the default of 6 made each cloud ten times
                * the size of the tree — a washed-out blob in the middle of
                * the screen. */}
            {quality.cloud.enabled && (
                <Suspense fallback={null}>
                    <Clouds texture={CLOUD_TEXTURE_URL}>
                        <CloudInstance
                            position={[-9, 5, -16]}
                            speed={0.25}
                            opacity={quality.cloud.opacity}
                            segments={quality.cloud.segments}
                            volume={quality.cloud.volume}
                            growth={0.5}
                            bounds={[3, 1, 1]}
                            color="#8fb4ff"
                        />
                        <CloudInstance
                            position={[10, 6.5, -18]}
                            speed={0.25}
                            opacity={quality.cloud.opacity}
                            segments={quality.cloud.segments}
                            volume={quality.cloud.volume}
                            growth={0.5}
                            bounds={[3, 1, 1]}
                            color="#ffc4d6"
                        />
                    </Clouds>
                </Suspense>
            )}
        </>
    )
}
