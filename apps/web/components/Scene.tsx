'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Text, PerformanceMonitor, Stats } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useStore } from '@/hooks/useStore'
import { useRealtime } from '@/hooks/useRealtime'
import { useAutoMode } from '@/hooks/useAutoMode'
import { Photo } from '@birthday-photo/data'
import Image from 'next/image'

// Components
import SceneEnvironment from './SceneEnvironment'
import SceneEffects from './SceneEffects'
import SceneContent from './SceneContent'
import SceneHUD from './SceneHUD'
import { Overlay, PhotoModal } from '@birthday-photo/ui'

// Color Palettes
const PALETTES = {
    christmas: {
        bg: ['#0f172a', '#000000'], // Slate to Black
        fog: '#050505',
        accent: '#c2410c', // Orange/Red
        text: '#fcd34d' // Amber
    },
    birthday: {
        bg: ['#2e1065', '#000000'], // Violet to Black
        fog: '#1e1b4b',
        accent: '#d946ef', // Fuchsia
        text: '#a855f7' // Purple
    },
    romantic: {
        bg: ['#4a044e', '#000000'], // Fuchsia Dark to Black
        fog: '#2e0225',
        accent: '#ec4899', // Pink
        text: '#f472b6'
    },
    party: {
        bg: ['#1e3a8a', '#000000'], // Blue to Black
        fog: '#172554',
        accent: '#3b82f6', // Blue
        text: '#60a5fa'
    }
}

export default function Scene() {
  const { 
      photos, scenes, settings, currentSceneId, isLoading,
      fetchInitialData, setCurrentSceneId
  } = useStore()
  
  useRealtime()

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [qualityPreset, setQualityPreset] = useState<'auto' | 'low' | 'high'>('auto')
  const [particleMultiplierOverride, setParticleMultiplierOverride] = useState<number | null>(null)
  const [rotateSpeedOverride, setRotateSpeedOverride] = useState<number | null>(null)

  // Use Custom Hook for Mode Logic
  const { mode, setMode, galleryLayout, setGalleryLayout } = useAutoMode(hasStarted)
  const isLow = (settings?.low_quality_mode === true) || qualityPreset === 'low'
  const pmBase = settings?.particle_multiplier ?? (isLow ? 0.5 : 1)
  const pm = Math.max(0.1, Math.min(particleMultiplierOverride ?? pmBase, 2))
  const rotateBase = settings?.rotate_speed ?? (isLow ? 0.5 : 0.8)
  const rotate = rotateSpeedOverride ?? rotateBase
  
  // Adaptive DPR based on device performance and screen resolution
  const getAdaptiveDpr = (): number | [number, number] => {
    if (isLow) return 1 // Low quality mode always uses DPR 1
    if (typeof window === 'undefined') return [1, 1.5] // Fallback for SSR
    
    const devicePixelRatio = window.devicePixelRatio
    const screenWidth = window.screen.width
    
    // High-end devices with high resolution
    if (devicePixelRatio >= 2.5 && screenWidth >= 1440) return 2
    // Medium-high end devices
    if (devicePixelRatio >= 2 && screenWidth >= 1024) return 1.5
    // Low-mid range devices
    if (devicePixelRatio >= 1.5) return 1.25
    // Low-end devices
    return 1
  }
  
  const adaptiveDpr = getAdaptiveDpr()
  
  // Adaptive Events configuration based on device performance
  const getAdaptiveEventsConfig = () => {
    if (isLow) {
      return {
        enableDamping: false, // Disable damping for better performance
        dampingFactor: 0.05,
        rotateSpeed: 0.5,
        zoomSpeed: 0.5,
        panSpeed: 0.5,
        enablePan: false, // Disable panning on low performance
        enableZoom: true
      }
    }
    
    return {
      enableDamping: true,
      dampingFactor: 0.05,
      rotateSpeed: 0.8,
      zoomSpeed: 0.8,
      panSpeed: 0.8,
      enablePan: true,
      enableZoom: true
    }
  }
  
  const adaptiveEventsConfig = getAdaptiveEventsConfig()
  
  const currentPalette = PALETTES[mode]

  useEffect(() => {
    // Check URL params for deep linking (Preview feature)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const sceneId = params.get('sceneId')
        
        fetchInitialData().then(() => {
            if (sceneId) {
                setCurrentSceneId(sceneId)
            }
        })
    }
  }, [fetchInitialData, setCurrentSceneId])

  const handleStart = () => {
      setHasStarted(true)
      if (audioRef.current) {
          audioRef.current.play().then(() => {
              setIsPlaying(true)
          }).catch(e => console.log("Audio play failed", e))
      }
  }

  // Handle Music
  useEffect(() => {
    if (settings?.bg_music_url) {
      audioRef.current = new Audio(settings.bg_music_url)
      audioRef.current.loop = true
      audioRef.current.volume = 0.5
    }
    
    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }
  }, [settings?.bg_music_url])

  const toggleMusic = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed (user interaction needed)", e))
    }
    setIsPlaying(!isPlaying)
  }

  const getTitle = () => {
      const sceneName = scenes.find(s => s.id === currentSceneId)?.name;
      
      switch(mode) {
          case 'birthday': return sceneName || "Happy Birthday!";
          case 'romantic': return sceneName || "Forever Love";
          case 'party': return sceneName || "Let's Party!";
          default: return sceneName || settings?.greeting_title || "Merry Christmas!";
      }
  }

  return (
    <>
      <Overlay 
         onStart={handleStart} 
         isLoading={isLoading} 
         title={settings?.greeting_title || "Merry Christmas!"} 
      />

      {/* 2D HUD Layer */}
      <SceneHUD 
        hasStarted={hasStarted}
        scenes={scenes}
        currentSceneId={currentSceneId}
        onSceneChange={setCurrentSceneId}
        mode={mode}
        onModeChange={setMode}
        galleryLayout={galleryLayout}
        onLayoutChange={setGalleryLayout}
        settings={settings}
        isPlaying={isPlaying}
        onToggleMusic={toggleMusic}
        qualityPreset={qualityPreset}
        onQualityPresetChange={setQualityPreset}
        particleMultiplier={pm}
        onParticleMultiplierChange={setParticleMultiplierOverride}
        rotateSpeed={rotate}
        onRotateSpeedChange={setRotateSpeedOverride}
      />

      <div 
        className="w-full h-screen transition-colors duration-1000 ease-in-out"
        style={{
            background: `linear-gradient(to bottom, ${currentPalette.bg[0]}, ${currentPalette.bg[1]})`
        }}
      >
        <Canvas 
          camera={{ position: [0, 2, 14], fov: 45 }} 
          gl={{ antialias: false }} 
          dpr={adaptiveDpr}
          shadows={!isLow}
          frameloop={isLow ? 'demand' : 'always'}
        >
          <Suspense fallback={null}>
            {/* Dev Performance Stats */}
            {process.env.NODE_ENV === 'development' && <Stats className="!left-auto !right-0 !top-0" />}

            <PerformanceMonitor 
              onDecline={() => setQualityPreset('low')} 
              // onAccept doesn't exist in PerformanceMonitor types in this version?
              // But we can monitor the onChange factor
              onChange={({ factor }) => {
                if (factor > 0.9 && qualityPreset === 'low') setQualityPreset('high')
              }}
            />
            
            <SceneEnvironment palette={currentPalette} />

            <SceneEffects mode={mode} settings={settings} particleMultiplier={pm} lowQuality={isLow} />
            
            <OrbitControls 
                enableZoom={adaptiveEventsConfig.enableZoom} 
                enablePan={adaptiveEventsConfig.enablePan} 
                maxPolarAngle={Math.PI / 1.4} 
                minPolarAngle={Math.PI / 3}
                autoRotate={!selectedPhoto && hasStarted}
                autoRotateSpeed={rotate}
                maxDistance={25}
                minDistance={5}
                enableDamping={adaptiveEventsConfig.enableDamping}
                dampingFactor={adaptiveEventsConfig.dampingFactor}
                rotateSpeed={adaptiveEventsConfig.rotateSpeed}
                zoomSpeed={adaptiveEventsConfig.zoomSpeed}
                panSpeed={adaptiveEventsConfig.panSpeed}
            />
            
            <SceneContent 
                mode={mode} 
                photos={photos} 
                selectedPhoto={selectedPhoto} 
                onSelectPhoto={setSelectedPhoto} 
                galleryLayout={galleryLayout} 
            />

            {/* Floating 3D Text */}
            <Float speed={4} rotationIntensity={0.5} floatIntensity={1} floatingRange={[0, 1]}>
                <Text
                    fontSize={1.5}
                    color={currentPalette.text}
                    position={[0, 6.5, 0]}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.04}
                    outlineColor={currentPalette.accent}
                    maxWidth={10}
                    textAlign="center"
                    font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                >
                    {getTitle()}
                    <meshStandardMaterial 
                        emissive={currentPalette.accent} 
                        emissiveIntensity={2} 
                        toneMapped={false} 
                        color={currentPalette.text}
                    />
                </Text>
            </Float>

            {/* Post Processing - Adaptive quality based on performance */}
            {(() => {
                // Very low quality - disable all post processing
                if (pm < 0.3) {
                    return null;
                }
                // Low quality - minimal post processing
                else if (pm < 0.7) {
                    return (
                        <EffectComposer enabled={true} enableNormalPass={false}>
                            <Vignette eskil={false} offset={0.15} darkness={1.0} />
                        </EffectComposer>
                    );
                }
                // Medium quality - standard post processing
                else if (pm < 1.5) {
                    return (
                        <EffectComposer enabled={true} enableNormalPass={false}>
                            <Bloom luminanceThreshold={0.3} mipmapBlur intensity={1.0} radius={0.3} />
                            <Vignette eskil={false} offset={0.12} darkness={1.05} />
                        </EffectComposer>
                    );
                }
                // High quality - full post processing
                else {
                    return (
                        <EffectComposer enabled={true} enableNormalPass={false}>
                            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
                            <Vignette eskil={false} offset={0.1} darkness={1.1} />
                        </EffectComposer>
                    );
                }
            })()}
          </Suspense>
        </Canvas>
      </div>

      {/* Selected Photo Modal */}
      <PhotoModal 
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        Image={Image as any}
      />
    </>
  )
}
