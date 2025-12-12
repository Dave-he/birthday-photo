'use client'
import { Sparkles, Cloud } from '@react-three/drei'
import Balloons from './Balloons'
import Fireworks from './Fireworks'
import MagicParticles from './MagicParticles'
import { Settings } from '@/types'

type SceneMode = 'christmas' | 'birthday' | 'romantic' | 'party'

interface SceneEffectsProps {
    mode: SceneMode
    settings: Settings | null
    particleMultiplier?: number
    lowQuality?: boolean
}

export default function SceneEffects({ mode, settings, particleMultiplier = 1, lowQuality = false }: SceneEffectsProps) {
    // Optimization: Skip clouds entirely on very low quality/multiplier settings to save draw calls
    const showClouds = particleMultiplier > 0.3
    const cloudSegments = lowQuality ? 10 : 20

    return (
        <>
            {/* Global Magic Particles (Always active for magic feel) */}
            <MagicParticles count={Math.floor(50 * particleMultiplier)} color={mode === 'romantic' ? '#ff69b4' : '#ffd700'} />

            {/* Mode Specific Effects */}
            {mode === 'christmas' && (settings?.is_snowing ?? true) && (
                <Sparkles 
                    count={Math.floor((settings?.snow_density || 300) * particleMultiplier)} 
                    scale={15} 
                    size={4} 
                    speed={0.4} 
                    opacity={0.9} 
                    color="#fff" 
                />
            )}
            
            {mode === 'romantic' && (
                <Sparkles 
                    count={Math.floor(500 * particleMultiplier)} 
                    scale={15} 
                    size={5} 
                    speed={0.6} 
                    opacity={0.7} 
                    color="#ff69b4" 
                    noise={1}
                />
            )}

            {(mode === 'birthday' || mode === 'party') && (
                <Balloons count={Math.floor(30 * particleMultiplier)} />
            )}
            
            {mode === 'party' && (
                <Fireworks count={Math.floor(12 * particleMultiplier)} />
            )}

            {/* Floating Clouds for atmosphere */}
            {showClouds && (
                <>
                    <Cloud position={[-8, -2, -5]} speed={0.4} opacity={0.6} segments={cloudSegments} color="#a0c4ff" />
                    <Cloud position={[8, -2, -5]} speed={0.4} opacity={0.6} segments={cloudSegments} color="#ffc4d6" />
                </>
            )}
        </>
    )
}
