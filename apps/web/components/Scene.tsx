'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Stats } from '@react-three/drei'
import { useCallback, useEffect, useMemo, useState, useRef, Suspense } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '@/hooks/useStore'
import { useRealtime } from '@/hooks/useRealtime'
import { useAutoMode } from '@/hooks/useAutoMode'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Photo } from '@/types'
import { PALETTES, getSceneTitle } from '@/lib/palettes'
import { getAdaptiveEventsConfig } from '@/lib/adaptive'
import { getSceneQuality } from '@/lib/sceneQuality'
import { getCameraFraming } from '@/lib/cameraFraming'
import { GROUND_Y } from '@/lib/stage'

// Components
import SceneEnvironment from './SceneEnvironment'
import SceneEffects from './SceneEffects'
import SceneContent from './SceneContent'
import SceneHUD from './SceneHUD'
import SceneTitle from './SceneTitle'
import SceneErrorBoundary from './SceneErrorBoundary'
import AdaptiveQuality from './AdaptiveQuality'
import CameraRig from './CameraRig'
import Overlay from './Overlay'
import PhotoModal from './PhotoModal'
import PostProcessing from './PostProcessing'

export default function Scene() {
  const {
      photos, scenes, settings, currentSceneId, isLoading, error,
      fetchInitialData, setCurrentSceneId
  } = useStore(useShallow((state) => ({
      photos: state.photos,
      scenes: state.scenes,
      settings: state.settings,
      currentSceneId: state.currentSceneId,
      isLoading: state.isLoading,
      error: state.error,
      fetchInitialData: state.fetchInitialData,
      setCurrentSceneId: state.setCurrentSceneId,
  })))

  useRealtime()

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [musicError, setMusicError] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [qualityPreset, setQualityPreset] = useState<'auto' | 'low' | 'high'>('auto')
  const [particleMultiplierOverride, setParticleMultiplierOverride] = useState<number | null>(null)
  const [rotateSpeedOverride, setRotateSpeedOverride] = useState<number | null>(null)

  // Use Custom Hook for Mode Logic
  const { mode, setMode, galleryLayout, setGalleryLayout } = useAutoMode(hasStarted)
  const reducedMotion = usePrefersReducedMotion()

  const isLow = (settings?.low_quality_mode === true) || qualityPreset === 'low'
  const pmBase = settings?.particle_multiplier ?? (isLow ? 0.5 : 1)
  const pm = Math.max(0.1, Math.min(particleMultiplierOverride ?? pmBase, 2))
  const rotateBase = settings?.rotate_speed ?? (isLow ? 0.5 : 0.8)
  const rotate = rotateSpeedOverride ?? rotateBase

  // One object decides how expensive the scene is allowed to be.
  const quality = useMemo(
    () =>
      getSceneQuality({
        isLow,
        particleMultiplier: pm,
        snowDensity: settings?.snow_density ?? 300,
        reducedMotion,
      }),
    [isLow, pm, settings?.snow_density, reducedMotion],
  )

  const adaptiveEventsConfig = getAdaptiveEventsConfig(isLow)
  const currentPalette = PALETTES[mode]

  useEffect(() => {
    // Check URL params for deep linking (Preview feature)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const sceneId = params.get('sceneId')

        // `fetchInitialData` swallows backend errors into the store's `error`
        // field, so the scene keeps rendering even when Supabase is down.
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
      const audio = new Audio(settings.bg_music_url)
      audio.loop = true
      audio.volume = 0.5
      // A track that cannot be loaded (404, unreachable host) would otherwise
      // fail silently - the toggle would just do nothing.
      audio.addEventListener('error', () => {
        console.warn('Background music could not be loaded:', settings.bg_music_url)
        setMusicError(true)
      })
      audioRef.current = audio
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

  // Browse the open gallery with the arrow keys / the modal's prev-next buttons.
  const stepPhoto = useCallback((delta: number) => {
    setSelectedPhoto((current) => {
      if (!current || photos.length === 0) return current
      const index = photos.findIndex((photo) => photo.id === current.id)
      if (index === -1) return current
      const nextIndex = (index + delta + photos.length) % photos.length
      return photos[nextIndex]
    })
  }, [photos])

  const selectedPosition = useMemo(() => {
    if (!selectedPhoto) return null
    const index = photos.findIndex((photo) => photo.id === selectedPhoto.id)
    if (index === -1) return null
    return { index: index + 1, total: photos.length }
  }, [selectedPhoto, photos])

  const title = getSceneTitle(mode, scenes, currentSceneId, settings)

  // The camera starts where the framing module says it should, and the
  // camera rig keeps it there as the viewport changes.
  const initialFraming = useMemo(() => getCameraFraming(16 / 9), [])

  return (
    <>
      <Overlay 
         onStart={handleStart} 
         isLoading={isLoading} 
         title={settings?.greeting_title || "Merry Christmas!"}
         error={error}
         onRetry={fetchInitialData}
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
        musicError={musicError}
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
        <SceneErrorBoundary>
          <Canvas
            className="scene-canvas"
            camera={{
              position: initialFraming.position,
              fov: initialFraming.fov,
              near: 0.1,
              far: 220,
            }}
            gl={{ antialias: false }} 
            dpr={quality.dpr[1]}
            shadows={quality.shadows}
            // The scene is fully animation-driven: every ornament, balloon,
            // particle and the auto-rotation run inside `useFrame`. A `demand`
            // frameloop only renders on invalidate, which freezes the whole
            // scene in low-quality mode. Quality is instead controlled through
            // DPR, shadows, particle counts and input damping.
            frameloop="always"
          >
            {/* The boundary around the whole scene is a last line of defence.
                Everything that can suspend (the clouds) has its own
                boundary, so this one should never trigger — and when it
                does, the visitor sees a loader instead of a blank screen. */}
            <Suspense fallback={<SceneLoadingStage />}>
              {/* Dev Performance Stats */}
              {process.env.NODE_ENV === 'development' && <Stats className="!left-auto !right-0 !top-0" />}

              <AdaptiveQuality
                min={quality.dpr[0]}
                max={quality.dpr[1]}
                onFallback={() => setQualityPreset('low')}
              />

              <CameraRig />

              <SceneEnvironment palette={currentPalette} quality={quality} />

              <SceneEffects
                mode={mode}
                settings={settings}
                quality={quality}
                reducedMotion={reducedMotion}
              />
              
              <OrbitControls 
                  enableZoom={adaptiveEventsConfig.enableZoom} 
                  enablePan={adaptiveEventsConfig.enablePan} 
                  maxPolarAngle={Math.PI / 1.4} 
                  minPolarAngle={Math.PI / 3}
                  target={initialFraming.target}
                  autoRotate={quality.autoRotate && !selectedPhoto && hasStarted}
                  autoRotateSpeed={rotate}
                  maxDistance={30}
                  minDistance={6}
                  enableDamping={adaptiveEventsConfig.enableDamping}
                  dampingFactor={adaptiveEventsConfig.dampingFactor}
                  rotateSpeed={adaptiveEventsConfig.rotateSpeed}
                  zoomSpeed={adaptiveEventsConfig.zoomSpeed}
                  panSpeed={adaptiveEventsConfig.panSpeed}
              />

              {/* Everything below stands on the stage, whose origin is the
                  middle of the floor. */}
              <group position={[0, GROUND_Y, 0]}>
                <SceneContent
                    mode={mode}
                    photos={photos}
                    selectedPhoto={selectedPhoto}
                    onSelectPhoto={setSelectedPhoto}
                    galleryLayout={galleryLayout}
                    quality={quality}
                    reducedMotion={reducedMotion}
                />

                {/* Floating 3D Title
                    *
                    * Rendered as a DOM overlay anchored in 3D space rather than a
                    * troika mesh: troika has to build SDF glyphs for the whole
                    * 3.4 MB Chinese font and never reports failures back to
                    * React, so a slow or unreachable font suspended the title
                    * forever — and, while it shared the outer Suspense boundary,
                    * it blanked the entire scene. */}
                <Float speed={4} rotationIntensity={0.2} floatIntensity={1} floatingRange={[0, 0.6]}>
                    <SceneTitle
                        title={title}
                        color={currentPalette.text}
                        accent={currentPalette.accent}
                    />
                </Float>
              </group>

              {/* Post Processing - the bloom makes the tree lights and the
                  star read as real light sources. The tier decides how
                  much of the chain is worth its frame budget. */}
              <PostProcessing quality={quality} />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      </div>

      {/* Selected Photo Modal */}
      <PhotoModal 
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onNext={photos.length > 1 ? () => stepPhoto(1) : undefined}
        onPrev={photos.length > 1 ? () => stepPhoto(-1) : undefined}
        position={selectedPosition}
      />
    </>
  )
}

/**
 * A visible placeholder for the (unlikely) case that the whole scene
 * suspends.
 *
 * The old boundary had `fallback={null}`, which meant any suspended
 * component left the visitor staring at an empty screen.
 */
function SceneLoadingStage() {
  return (
    <mesh position={[0, 0, 0]}>
      <icosahedronGeometry args={[0.6, 1]} />
      <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={1.2} wireframe />
    </mesh>
  )
}
