'use client'
import Tree from './Tree'
import Cake from './Cake'
import Gift from './Gift'
import DancingCouple from './DancingCouple'
import HeartArch from './HeartArch'
import Ground from './Ground'
import PhotoGallery from './PhotoGallery'
import type { Photo, SceneMode, GalleryLayout } from '@/types'
import type { SceneQuality } from '@/lib/sceneQuality'

interface SceneContentProps {
    mode: SceneMode
    photos: Photo[]
    selectedPhoto: Photo | null
    onSelectPhoto: (photo: Photo | null) => void
    galleryLayout: GalleryLayout
    quality: SceneQuality
    reducedMotion?: boolean
}

/**
 * Everything that stands on the stage.
 *
 * The whole scene lives in one group whose origin is the middle of the
 * stage, so every prop is placed relative to the floor. The physics world
 * that used to wrap all of this was removed: it contained no rigid bodies
 * at all, so the cannon solver ran its step every frame for nothing.
 */
export default function SceneContent({
    mode,
    photos,
    selectedPhoto,
    onSelectPhoto,
    galleryLayout,
    quality,
    reducedMotion = false,
}: SceneContentProps) {
    const isChristmas = mode === 'christmas'
    const isParty = mode === 'party'

    return (
        <>
            {/* The floor everything stands on. */}
            <Ground
                color={isChristmas ? '#2c3f63' : isParty ? '#33457a' : '#3a2c5e'}
                receiveShadow={quality.shadows}
            />

            {isChristmas && (
                <Tree lightCount={quality.treeLightCount} reducedMotion={reducedMotion} />
            )}

            {(mode === 'birthday' || mode === 'party') && (
                <group position={[0, 0, 1.8]}>
                    <Cake scale={0.95} reducedMotion={reducedMotion} />
                </group>
            )}

            {(isChristmas || mode === 'birthday' || isParty) && (
                <group position={[0, 0.45, 0]}>
                    <Gift position={[-3.4, 0, 1.2]} color="#e53935" rotateSpeed={0.5} reducedMotion={reducedMotion} />
                    <Gift position={[3.4, 0, 1.2]} color="#1e88e5" rotateSpeed={0.8} reducedMotion={reducedMotion} />
                    <Gift position={[-2.1, 0, 2.5]} color="#43a047" rotateSpeed={0.3} reducedMotion={reducedMotion} />
                    <Gift position={[2.1, 0, 2.5]} color="#fb8c00" rotateSpeed={0.6} reducedMotion={reducedMotion} />
                    <Gift position={[0, 0, 3.6]} color="#8e24aa" rotateSpeed={0.4} reducedMotion={reducedMotion} />
                </group>
            )}

            {mode === 'romantic' && (
                <>
                    <HeartArch reducedMotion={reducedMotion} />
                    <DancingCouple reducedMotion={reducedMotion} />
                </>
            )}

            <PhotoGallery
                photos={photos}
                selectedPhoto={selectedPhoto}
                onSelect={onSelectPhoto}
                layout={galleryLayout}
                reducedMotion={reducedMotion}
            />
        </>
    )
}
