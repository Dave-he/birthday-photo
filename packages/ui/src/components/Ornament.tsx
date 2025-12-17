'use client'

import { useRef, useState } from 'react'
import { useFrame, MeshProps } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

export interface OrnamentProps {
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
                    <planeGeometry args={[0.6, 0.6]} />
                    <meshStandardMaterial 
                        map={texture} 
                        side={THREE.DoubleSide}
                        color={hovered ? 'white' : '#ffffff'}
                        emissive={hovered ? 'white' : 'black'}
                        emissiveIntensity={hovered ? 0.2 : 0}
                        roughness={0.3}
                        metalness={0.1}
                    />
                    {/* Border */}
                    <mesh scale={[1.1, 1.1, 1.1]} position={[0, 0, -0.001]}>
                        <planeGeometry args={[0.6, 0.6]} />
                        <meshBasicMaterial 
                            color="white" 
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </>
            )}
        </mesh>

        {/* Info text (only visible on hover in card mode) */}
        {variant !== 'sphere' && hovered && (
            <Html distanceFactor={100}>
                <div className="bg-black/70 text-white p-2 rounded text-xs max-w-xs">
                    <div className="font-bold">{title}</div>
                </div>
            </Html>
        )}
      </animated.group>
    </group>
  )
}
