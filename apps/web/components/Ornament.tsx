'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { useEffect } from 'react'

interface OrnamentProps {
  id: string
  imageUrl: string
  title?: string
  description?: string
  onClick: (id: string) => void
  isSelected: boolean
  variant?: 'sphere' | 'card'
}

export default function Ornament({ id, imageUrl, title, description, onClick, isSelected, variant = 'sphere' }: OrnamentProps) {
  // Description is optional and not currently used in 3D view, but passed for completeness
  const _unused = description;
  if(_unused) console.log('Ornament desc', _unused);

  const meshRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  
  // Dynamically rewrite localhost or placeholder URLs to the active Supabase URL if needed
  const getActiveImageUrl = (url: string) => {
    if (!url) return '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && (url.includes('localhost:54321') || url.includes('127.0.0.1:54321'))) {
      return url.replace(/http:\/\/localhost:54321/g, supabaseUrl)
                .replace(/http:\/\/127.0.0.1:54321/g, supabaseUrl);
    }
    return url;
  }
  
  useEffect(() => {
    const activeUrl = getActiveImageUrl(imageUrl)
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    let isMounted = true
    
    loader.load(
      activeUrl,
      (tex) => {
        if (isMounted) setTexture(tex)
      },
      undefined,
      (err) => {
        console.warn('CORS or loading error for texture:', activeUrl, err)
        loader.load(
          'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=150',
          (fallbackTex) => {
            if (isMounted) setTexture(fallbackTex)
          }
        )
      }
    )
    
    return () => {
      isMounted = false
    }
  }, [imageUrl])
  
  const { scale, rotationY } = useSpring({
    scale: isSelected ? 1.5 : hovered ? 1.1 : 1,
    rotationY: isSelected ? Math.PI * 2 : 0,
    config: { tension: 170, friction: 26 }
  })

  const [randomOffset] = useState(() => Math.random() * 100)

  useFrame((state) => {
    if (meshRef.current && !isSelected) {
      if (variant === 'sphere') {
          meshRef.current.rotation.y += 0.01
      }
      // Floating effect
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + randomOffset) * 0.05
    }
    if (haloRef.current && isSelected) {
      // Elegant spinning and floating for the halo
      haloRef.current.rotation.z += 0.03
      haloRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02
    }
  })

  return (
    <group>
      {/* String hanging the ornament (only for sphere/tree mode usually) */}
      {variant === 'sphere' && (
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.5]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
      )}

      <animated.group
        onClick={(e) => {
          e.stopPropagation()
          onClick(id)
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={scale}
        rotation-y={rotationY}
      >
        {/* Animated Golden Glowing Halo Ring surrounding the selected card or sphere */}
        {isSelected && (
          <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[variant === 'sphere' ? 0.42 : 0.62, 0.015, 8, 64]} />
            <meshStandardMaterial 
              color="#ffd700" 
              emissive="#ffeb3b" 
              emissiveIntensity={3.5} 
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        )}

        <mesh ref={meshRef}>
            {variant === 'sphere' ? (
                <>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial 
                        map={texture || undefined} 
                        color={hovered ? 'white' : '#ffffff'}
                        emissive={hovered ? 'white' : 'black'}
                        emissiveIntensity={hovered ? 0.2 : 0}
                        roughness={0.2}
                        metalness={0.1}
                    />
                    {/* Glass Shell with highly-realistic physical parameters */}
                    <mesh scale={[1.05, 1.05, 1.05]}>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshPhysicalMaterial 
                            transparent 
                            opacity={0.15} 
                            roughness={0.05} 
                            metalness={0.05}
                            transmission={0.9}
                            thickness={0.15}
                            ior={1.5}
                            clearcoat={1.0}
                            clearcoatRoughness={0.05}
                            color={hovered ? "#ffeb3b" : "white"}
                        />
                    </mesh>
                </>
            ) : (
                <>
                    {/* Card/Frame Variant for Grid Layout */}
                    <boxGeometry args={[0.8, 0.6, 0.05]} />
                    <meshStandardMaterial color="#1a1a1a" />
                    
                    {/* Image Plane */}
                    <mesh position={[0, 0, 0.03]}>
                        <planeGeometry args={[0.7, 0.5]} />
                        <meshBasicMaterial map={texture || undefined} />
                    </mesh>
                    
                    {/* Golden Border */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.82, 0.62, 0.04]} />
                        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                    </mesh>
                </>
            )}

            {/* Glow effect when hovered */}
            {hovered && (
                <pointLight distance={3} intensity={5} color="#ffeb3b" decay={2} />
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
