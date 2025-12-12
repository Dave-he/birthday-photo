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
    // Get fine-grained particle settings based on multiplier and quality
    const getParticleSettings = () => {
        // Very low performance
        if (particleMultiplier < 0.3) {
            return {
                magicParticles: { count: 20, size: 0.15 },
                snow: { count: Math.floor((settings?.snow_density || 300) * 0.3), size: 3, speed: 0.3, opacity: 0.7 },
                romanticSparkles: { count: 150, size: 3, speed: 0.4, opacity: 0.5 },
                balloons: { count: 10 },
                fireworks: { count: 4 },
                clouds: { show: false, segments: 8 }
            }
        }
        // Low performance
        else if (particleMultiplier < 0.7) {
            return {
                magicParticles: { count: Math.floor(35 * particleMultiplier), size: 0.18 },
                snow: { count: Math.floor((settings?.snow_density || 300) * particleMultiplier), size: 3.5, speed: 0.35, opacity: 0.8 },
                romanticSparkles: { count: Math.floor(300 * particleMultiplier), size: 4, speed: 0.5, opacity: 0.6 },
                balloons: { count: Math.floor(20 * particleMultiplier) },
                fireworks: { count: Math.floor(8 * particleMultiplier) },
                clouds: { show: true, segments: 12 }
            }
        }
        // Medium performance
        else if (particleMultiplier < 1.5) {
            return {
                magicParticles: { count: Math.floor(50 * particleMultiplier), size: 0.2 },
                snow: { count: Math.floor((settings?.snow_density || 300) * particleMultiplier), size: 4, speed: 0.4, opacity: 0.9 },
                romanticSparkles: { count: Math.floor(500 * particleMultiplier), size: 5, speed: 0.6, opacity: 0.7 },
                balloons: { count: Math.floor(30 * particleMultiplier) },
                fireworks: { count: Math.floor(12 * particleMultiplier) },
                clouds: { show: true, segments: 16 }
            }
        }
        // High performance
        else {
            return {
                magicParticles: { count: Math.floor(75 * particleMultiplier), size: 0.25 },
                snow: { count: Math.floor((settings?.snow_density || 300) * particleMultiplier), size: 5, speed: 0.5, opacity: 1.0 },
                romanticSparkles: { count: Math.floor(700 * particleMultiplier), size: 6, speed: 0.7, opacity: 0.8 },
                balloons: { count: Math.floor(40 * particleMultiplier) },
                fireworks: { count: Math.floor(16 * particleMultiplier) },
                clouds: { show: true, segments: 20 }
            }
        }
    }

    const particleSettings = getParticleSettings()

    return (
        <>
            {/* Global Magic Particles (Always active for magic feel) */}
            <MagicParticles 
                count={particleSettings.magicParticles.count} 
                color={mode === 'romantic' ? '#ff69b4' : '#ffd700'} 
            />

            {/* Mode Specific Effects */}
            {mode === 'christmas' && (settings?.is_snowing ?? true) && (
                <Sparkles 
                    count={particleSettings.snow.count} 
                    scale={15} 
                    size={particleSettings.snow.size} 
                    speed={particleSettings.snow.speed} 
                    opacity={particleSettings.snow.opacity} 
                    color="#fff" 
                />
            )}
            
            {mode === 'romantic' && (
                <Sparkles 
                    count={particleSettings.romanticSparkles.count} 
                    scale={15} 
                    size={particleSettings.romanticSparkles.size} 
                    speed={particleSettings.romanticSparkles.speed} 
                    opacity={particleSettings.romanticSparkles.opacity} 
                    color="#ff69b4" 
                    noise={lowQuality ? 0.5 : 1}
                />
            )}

            {(mode === 'birthday' || mode === 'party') && (
                <Balloons count={particleSettings.balloons.count} />
            )}
            
            {mode === 'party' && (
                <Fireworks count={particleSettings.fireworks.count} />
            )}

            {/* Floating Clouds for atmosphere */}
            {particleSettings.clouds.show && (
                <>
                    <Cloud position={[-8, -2, -5]} speed={0.4} opacity={0.6} segments={particleSettings.clouds.segments} color="#a0c4ff" />
                    <Cloud position={[8, -2, -5]} speed={0.4} opacity={0.6} segments={particleSettings.clouds.segments} color="#ffc4d6" />
                </>
            )}
        </>
    )
}
