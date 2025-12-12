'use client'
import { ThreeElements } from '@react-three/fiber'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

export default function Cake(props: ThreeElements['group']) {
  const candleRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (candleRef.current) {
      // Candle flickering effect
      candleRef.current.position.y = 1.6 + Math.sin(state.clock.elapsedTime * 10) * 0.02
    }
  })

  return (
    <group {...props}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Base Plate */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 0.2, 32]} />
          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Bottom Tier */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 1, 32]} />
          <meshStandardMaterial color="#fce4ec" /> {/* Pinkish vanilla */}
        </mesh>
        
        {/* Middle Tier */}
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[1, 1, 0.8, 32]} />
          <meshStandardMaterial color="#f8bbd0" />
        </mesh>

        {/* Top Tier */}
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.6, 32]} />
          <meshStandardMaterial color="#f48fb1" />
        </mesh>

        {/* Decorations (Cherries/Cream) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1.1, 1.15, Math.sin(i * Math.PI / 3) * 1.1]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#d81b60" roughness={0.1} />
            </mesh>
        ))}

        {/* Candle */}
        <group ref={candleRef} position={[0, 1.6, 0]}>
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Flame */}
            <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={2} />
                <pointLight distance={3} intensity={3} color="orange" />
            </mesh>
        </group>
      </Float>
    </group>
  )
}
