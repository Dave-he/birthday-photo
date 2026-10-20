'use client'

import { useEffect, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { acquirePhotoTexture, releasePhotoTexture } from '@/lib/textureCache'

export interface OrnamentHandle {
  /** The photo sphere / card itself. */
  mesh: THREE.Mesh | null
  /** The glowing ring drawn around the selected ornament. */
  halo: THREE.Mesh | null
}

interface OrnamentProps {
  id: string
  imageUrl: string
  title?: string
  onClick: (id: string) => void
  isSelected: boolean
  variant?: 'sphere' | 'card'
  /**
   * Called with the ornament's meshes so the gallery can animate the whole
   * set from a single frame callback. Every ornament used to register its
   * own `useFrame`, which meant one callback per photo per frame.
   */
  register?: (handle: OrnamentHandle) => void
}

export default function Ornament({
  id,
  imageUrl,
  title,
  onClick,
  isSelected,
  variant = 'sphere',
  register,
}: OrnamentProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  // The photo textures are shared between the ornaments that show the same
  // picture: one download, one copy in GPU memory, released as soon as the
  // last ornament using it is gone.
  useEffect(() => {
    if (!imageUrl) return

    let released = false
    acquirePhotoTexture(imageUrl)
      .then((loaded) => {
        if (!released) setTexture(loaded)
      })
      .catch((error) => {
        console.warn('Could not load the photo texture:', imageUrl, error)
      })

    return () => {
      released = true
      setTexture(null)
      releasePhotoTexture(imageUrl)
    }
  }, [imageUrl])

  const { scale, rotationY } = useSpring({
    scale: isSelected ? 1.5 : hovered ? 1.1 : 1,
    rotationY: isSelected ? Math.PI * 2 : 0,
    config: { tension: 170, friction: 26 },
  })

  // Hand the meshes to the gallery, which animates them all at once.
  useEffect(() => {
    if (!register) return
    register({ mesh: meshRef.current, halo: haloRef.current })
    return () => register({ mesh: null, halo: null })
  }, [register])

  return (
    <group>
      {/* String hanging the ornament (only for sphere/tree mode usually) */}
      {variant === 'sphere' && (
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.5, 6]} />
          <meshStandardMaterial color="#cccccc" roughness={0.6} />
        </mesh>
      )}

      <animated.group
        onClick={(e) => {
          e.stopPropagation()
          onClick(id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => setHover(false)}
        scale={scale}
        rotation-y={rotationY}
      >
        {/* Animated Golden Glowing Halo Ring surrounding the selected card or sphere
            *
            * The ring stays mounted and is only hidden, so the gallery keeps a
            * valid reference to it. Unmounting it would leave the gallery
            * animating a mesh that is no longer in the scene. */}
        <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]} visible={isSelected}>
          <torusGeometry args={[variant === 'sphere' ? 0.42 : 0.62, 0.015, 8, 48]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffeb3b"
            emissiveIntensity={3.5}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        <mesh ref={meshRef}>
          {variant === 'sphere' ? (
            <>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial
                map={texture || undefined}
                emissiveMap={texture || undefined}
                emissive={hovered ? '#ffffff' : '#000000'}
                emissiveIntensity={hovered ? 0.35 : 0.12}
                roughness={0.2}
                metalness={0.1}
                envMapIntensity={1.4}
              />
              {/* Glass Shell.
                  *
                  * This used to use `transmission`, which makes three.js
                  * render the whole scene into a separate buffer on every
                  * frame — one extra full scene render, forever, just for
                  * the ornament shells. The environment map gives the same
                  * glassy highlight for free. */}
              <mesh scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[0.3, 24, 24]} />
                <meshPhysicalMaterial
                  transparent
                  opacity={0.16}
                  roughness={0.05}
                  metalness={0.05}
                  ior={1.5}
                  clearcoat={1.0}
                  clearcoatRoughness={0.05}
                  envMapIntensity={2.6}
                  color={hovered ? '#ffeb3b' : '#ffffff'}
                />
              </mesh>
            </>
          ) : (
            <>
              {/* Card/Frame Variant for Grid Layout */}
              <boxGeometry args={[0.8, 0.6, 0.05]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.7} />

              {/* Image Plane — lit like the rest of the scene, but with a
                  little self-illumination so the photo stays readable in a
                  dark scene. */}
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[0.7, 0.5]} />
                <meshStandardMaterial
                  map={texture || undefined}
                  emissiveMap={texture || undefined}
                  emissive="#ffffff"
                  emissiveIntensity={0.4}
                  roughness={0.55}
                  metalness={0}
                />
              </mesh>

              {/* Golden Border */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.82, 0.62, 0.04]} />
                <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.25} />
              </mesh>
            </>
          )}
        </mesh>
      </animated.group>

      {/* Label on hover */}
      {hovered && !isSelected && title && (
        <Html position={[0, variant === 'sphere' ? -0.5 : -0.6, 0]} center pointerEvents="none">
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/20">
            {title}
          </div>
        </Html>
      )}
    </group>
  )
}
