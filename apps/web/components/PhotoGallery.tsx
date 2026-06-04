/* eslint-disable */
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSprings, animated, config } from '@react-spring/three'
import Ornament from './Ornament'
import * as THREE from 'three'
import type { Photo, GalleryLayout } from '@/types'
import { getGalleryPosition } from '@/lib/galleryLayouts'

interface PhotoGalleryProps {
  photos: Photo[]
  selectedPhoto: Photo | null
  onSelect: (photo: Photo) => void
  layout: GalleryLayout
}

export default function PhotoGallery({ photos, selectedPhoto, onSelect, layout }: PhotoGalleryProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Use Springs for smooth transitions of positions
  const [springs] = useSprings(
    photos.length,
    (i) => ({
      position: getGalleryPosition(i, photos.length, layout),
      config: config.molasses, // Slow, gooey transition
    }),
    [layout, photos]
  )

  useFrame(() => {
      if (groupRef.current) {
          // Subtle rotation for the entire gallery
          groupRef.current.rotation.y += 0.0005
      }
  })

  return (
    <group ref={groupRef}>
      {springs.map(({ position }, i) => (
        <animated.group key={photos[i].id} position={position as any}>
            <Ornament
              id={photos[i].id}
              imageUrl={photos[i].image_url}
              title={photos[i].title}
              isSelected={selectedPhoto?.id === photos[i].id}
              onClick={() => onSelect(photos[i])}
              variant={layout === 'tree' ? 'sphere' : 'card'}
            />
        </animated.group>
      ))}
    </group>
  )
}
