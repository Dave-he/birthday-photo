'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

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
  const [hovered, setHover] = useState(false)
  
  // Use useTexture for caching and better performance
  const texture = useTexture(imageUrl)
  
  const { scale, rotationY } = useSpring({
    scale: isSelected ? 1.5 : hovered ? 1.1 : 1,
    rotationY: isSelected ? Math.PI * 2 : 0,
    config: { tension: 170, friction: 26 }
  })

  // Random offset for float animation to prevent sync
  // Math.random() is impure, but useMemo with empty deps makes it run once per mount, which is acceptable for init.
  // However, for strict purity, we can use id hash or similar, but random is fine here for visual effect.
  // To satisfy linter, we can move it inside useEffect or just suppress if we accept it's visual only.
  // Better: use a seed based on ID or just accept it runs once.
  // Or move to useEffect to set state.
  const [randomOffset] = useState(() => Math.random() * 100)

  useFrame((state) => {
    if (meshRef.current && !isSelected) {
      if (variant === 'sphere') {
          meshRef.current.rotation.y += 0.01
      }
      // Floating effect
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + randomOffset) * 0.05
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
        <mesh ref={meshRef}>
            {variant === 'sphere' ? (
                <>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial 
                        map={texture} 
                        color={hovered ? 'white' : '#ffffff'}
                        emissive={hovered ? 'white' : 'black'}
                        emissiveIntensity={hovered ? 0.2 : 0}
                        roughness={0.2}
                        metalness={0.1}
                    />
                    {/* Glass Shell */}
                    <mesh scale={[1.05, 1.05, 1.05]}>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshPhysicalMaterial 
                            transparent 
                            opacity={0.3} 
                            roughness={0} 
                            metalness={0.1}
                            transmission={0.5}
                            thickness={0.1}
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
                        <meshBasicMaterial map={texture} />
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
