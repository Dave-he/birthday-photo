'use client'
import { Physics } from '@react-three/cannon'
import Tree from './Tree'
import Cake from './Cake'
import Gift from './Gift'
import DancingCouple from './DancingCouple'
import { PhotoGallery } from '@birthday-photo/ui'
import { Photo } from '@birthday-photo/data'

type SceneMode = 'christmas' | 'birthday' | 'romantic' | 'party'
type GalleryLayout = 'tree' | 'helix' | 'grid' | 'sphere'

interface SceneContentProps {
    mode: SceneMode
    photos: Photo[]
    selectedPhoto: Photo | null
    onSelectPhoto: (photo: Photo | null) => void
    galleryLayout: GalleryLayout
}

export default function SceneContent({ 
    mode, 
    photos, 
    selectedPhoto, 
    onSelectPhoto, 
    galleryLayout 
}: SceneContentProps) {
    return (
        <Physics gravity={[0, -2, 0]}>
            <group position={[0, -1, 0]}>
                {mode === 'christmas' && <Tree />}
            </group>
            
            <group position={[0, -2, 3.5]}>
                {(mode === 'birthday' || mode === 'party') && <Cake scale={0.5} />}
            </group>

            {(mode === 'christmas' || mode === 'birthday' || mode === 'party') && (
                <group position={[0, -3, 0]}>
                    <Gift position={[-2.5, 0.5, 2]} color="#e53935" rotateSpeed={0.5} />
                    <Gift position={[2.5, 0.5, 2]} color="#1e88e5" rotateSpeed={0.8} />
                    <Gift position={[-1.5, 0.5, 3]} color="#43a047" rotateSpeed={0.3} />
                    <Gift position={[1.5, 0.5, 3]} color="#fb8c00" rotateSpeed={0.6} />
                    <Gift position={[0, 0.5, 4.5]} color="#8e24aa" rotateSpeed={0.4} />
                </group>
            )}

            {mode === 'romantic' && <DancingCouple />}

            <group position={[0, -1, 0]}>
                <PhotoGallery 
                    photos={photos} 
                    selectedPhoto={selectedPhoto} 
                    onSelect={onSelectPhoto} 
                    layout={galleryLayout} 
                />
            </group>
        </Physics>
    )
}
