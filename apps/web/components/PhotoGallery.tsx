/* eslint-disable */
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSprings, animated, config } from '@react-spring/three'
import Ornament, { type OrnamentHandle } from './Ornament'
import * as THREE from 'three'
import type { Photo, GalleryLayout } from '@/types'
import { getGalleryPosition } from '@/lib/galleryLayouts'

interface PhotoGalleryProps {
  photos: Photo[]
  selectedPhoto: Photo | null
  onSelect: (photo: Photo) => void
  layout: GalleryLayout
  reducedMotion?: boolean
}

/**
 * The photo gallery.
 *
 * The whole set is animated by a single frame callback. Previously every
 * ornament ran its own `useFrame`, and the gallery itself rotated around
 * its own axis — which meant the photos on the christmas tree slowly
 * rotated off the branches they were supposed to hang on.
 */
export default function PhotoGallery({
  photos,
  selectedPhoto,
  onSelect,
  layout,
  reducedMotion = false,
}: PhotoGalleryProps) {
  // The meshes of every ornament, so they can all be animated at once.
  const handles = useRef<OrnamentHandle[]>([])

  // A stable callback per ornament, so the ornaments do not re-register on
  // every render.
  const registrars = useMemo(
    () =>
      photos.map(
        (_, index) =>
          (handle: OrnamentHandle) => {
            handles.current[index] = handle
          },
      ),
    [photos],
  )

  // Use Springs for smooth transitions of positions.
  const [springs, api] = useSprings(
    photos.length,
    (i) => ({
      position: getGalleryPosition(i, photos.length, layout),
      config: config.molasses, // Slow, gooey transition
    }),
  )

  // Re-target the springs when the layout or the number of photos changes,
  // so the photos glide to their new place instead of teleporting.
  useEffect(() => {
    api.start((i) => ({
      position: getGalleryPosition(i, photos.length, layout),
    }))
  }, [api, layout, photos.length])

  // Drop the handles of photos that are gone, so the frame loop does not
  // keep animating meshes that are no longer in the scene.
  useEffect(() => {
    handles.current.length = photos.length
  }, [photos.length])

  const variant = layout === 'tree' ? 'sphere' : 'card'

  useFrame((state) => {
    const time = state.clock.elapsedTime

    for (let i = 0; i < handles.current.length; i++) {
      const handle = handles.current[i]
      if (!handle) continue

      if (handle.mesh) {
        if (variant === 'sphere') {
          // Slow spin, driven by the clock so it looks the same on a
          // 30 Hz and a 144 Hz display.
          handle.mesh.rotation.y = time * 0.5 + i * 0.83
        }
        if (!reducedMotion) {
          // Floating effect
          handle.mesh.position.y = Math.sin(time * 2 + i * 1.7) * 0.055
        }
      }

      if (handle.halo) {
        // Elegant spinning and floating for the halo
        handle.halo.rotation.z = time * 1.3
        handle.halo.position.y = Math.sin(time * 3) * 0.02
      }
    }
  })

  return (
    <group>
      {springs.map(({ position }, i) => (
        <animated.group key={photos[i].id} position={position as any}>
            <Ornament
              id={photos[i].id}
              imageUrl={photos[i].image_url}
              title={photos[i].title}
              isSelected={selectedPhoto?.id === photos[i].id}
              onClick={() => onSelect(photos[i])}
              variant={variant}
              register={registrars[i]}
            />
        </animated.group>
      ))}
    </group>
  )
}
