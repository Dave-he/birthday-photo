'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

export default function Gift({ position, color = "#ef5350", rotateSpeed = 1 }: { position: [number, number, number], color?: string, rotateSpeed?: number }) {
  const meshRef = useRef<THREE.Group>(null)
  const [active, setActive] = useState(false)

  const { scale } = useSpring({
    scale: active ? 1.2 : 1,
    config: { tension: 300, friction: 10 }
  })

  useFrame(() => {
    if (meshRef.current) {
        // Random slight hop
        // This is random per frame, which is impure but acceptable for visual jitter effect
        if (Math.random() > 0.99) {
            meshRef.current.position.y += 0.1
        }
        // Return to ground
        if (meshRef.current.position.y > position[1]) {
            meshRef.current.position.y -= 0.01
        }
        
        meshRef.current.rotation.y += 0.01 * rotateSpeed
    }
  })

  return (
    <animated.group 
        ref={meshRef} 
        position={position} 
        scale={scale}
        onClick={() => setActive(!active)}
        onPointerOver={() => setActive(true)}
        onPointerOut={() => setActive(false)}
    >
      {/* Box */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>

      {/* Ribbon Vertical */}
      <mesh scale={[1.01, 1.01, 0.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gold" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Ribbon Horizontal */}
      <mesh scale={[0.2, 1.01, 1.01]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gold" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Bow on top */}
      <group position={[0, 0.5, 0]}>
         <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, Math.PI/4]}>
            <torusGeometry args={[0.2, 0.05, 16, 32]} />
            <meshStandardMaterial color="gold" />
         </mesh>
         <mesh position={[-0.2, 0.1, 0]} rotation={[0, 0, -Math.PI/4]}>
            <torusGeometry args={[0.2, 0.05, 16, 32]} />
            <meshStandardMaterial color="gold" />
         </mesh>
      </group>
    </animated.group>
  )
}
