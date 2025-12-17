'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSprings, animated, config } from '@react-spring/three'
import Ornament from './Ornament'
import * as THREE from 'three'
import { Photo } from '@birthday-photo/data'

export interface PhotoGalleryProps {
  photos: Photo[]
  selectedPhoto: Photo | null
  onSelect: (photo: Photo) => void
  layout: 'tree' | 'helix' | 'grid' | 'sphere'
}

export default function PhotoGallery({ photos, selectedPhoto, onSelect, layout }: PhotoGalleryProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Calculate positions based on layout
  const getPosition = (index: number, total: number, layout: string): [number, number, number] => {
      switch (layout) {
          case 'helix':
              const angleHelix = index * 0.5;
              const radiusHelix = 6;
              const yHelix = (index * 0.4) - (total * 0.2) + 1; 
              return [
                  Math.cos(angleHelix) * radiusHelix,
                  yHelix,
                  Math.sin(angleHelix) * radiusHelix
              ];
          
          case 'grid':
              const cols = 6;
              const row = Math.floor(index / cols);
              const col = index % cols;
              const angleGrid = (col / cols) * Math.PI * 1.5 - Math.PI * 0.75;
              const radiusGrid = 9;
              return [
                  Math.sin(angleGrid) * radiusGrid,
                  (row * 1.5) - 2, 
                  Math.cos(angleGrid) * radiusGrid - 6
              ];

          case 'sphere':
              const phi = Math.acos(-1 + (2 * index) / total);
              const theta = Math.sqrt(total * Math.PI) * phi;
              const r = 6;
              return [
                  r * Math.cos(theta) * Math.sin(phi),
                  r * Math.sin(theta) * Math.sin(phi) + 2, 
                  r * Math.cos(phi)
              ];

          case 'tree':
          default:
              const y = 1.5 + (index / total) * 4; 
              const radius = 2.5 * (1 - (y - 1.5) / 4.5); 
              const angle = index * 2.4; 
              return [
                  Math.cos(angle) * radius,
                  y,
                  Math.sin(angle) * radius
              ]
      }
  }

  // Use Springs for smooth transitions of positions
  const [springs] = useSprings(
    photos.length,
    (i) => ({
      position: getPosition(i, photos.length, layout),
      config: config.molasses // Slow, gooey transition
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
              description={photos[i].description}
              isSelected={selectedPhoto?.id === photos[i].id}
              onClick={() => onSelect(photos[i])}
              variant={layout === 'tree' ? 'sphere' : 'card'}
            />
        </animated.group>
      ))}
    </group>
  )
}
