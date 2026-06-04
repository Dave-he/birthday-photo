'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Text, PerformanceMonitor, Stats } from '@react-three/drei'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useStore } from '@/hooks/useStore'
import { useRealtime } from '@/hooks/useRealtime'
import { useAutoMode } from '@/hooks/useAutoMode'
import { Photo } from '@/types'
import { PALETTES, getSceneTitle } from '@/lib/palettes'
import { getAdaptiveDpr, getAdaptiveEventsConfig } from '@/lib/adaptive'

// Components
import SceneEnvironment from './SceneEnvironment'
import SceneEffects from './SceneEffects'
import SceneContent from './SceneContent'
import SceneHUD from './SceneHUD'
import Overlay from './Overlay'
import PhotoModal from './PhotoModal'
import PostProcessing from './PostProcessing'

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

  const adaptiveDpr = getAdaptiveDpr(isLow)
  const adaptiveEventsConfig = getAdaptiveEventsConfig(isLow)
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

  const title = getSceneTitle(mode, scenes, currentSceneId, settings)

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
                    font="https://fonts.gstatic.com/s/zcoolqingkehuangyou/v5/nqyJcc1t_c2bVf5t3-8k9BdfGv1C7G_A.woff"
                >
                    {title}
                    <meshStandardMaterial 
                        emissive={currentPalette.accent} 
                        emissiveIntensity={2} 
                        toneMapped={false} 
                        color={currentPalette.text}
                    />
                </Text>
            </Float>

            {/* Post Processing - Adaptive quality based on performance */}
            <PostProcessing particleMultiplier={pm} />
          </Suspense>
        </Canvas>
      </div>

      {/* Selected Photo Modal */}
      <PhotoModal 
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  )
}
