'use client'
import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function TwinkleLights({ count = 20 }: { count?: number }) {
    // Use useState to initialize random values once (pure)
    const [lightsData] = useState(() => {
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 4,
                1 + Math.random() * 4,
                (Math.random() - 0.5) * 4
            ] as [number, number, number],
            speed: 0.5 + Math.random(),
            offset: Math.random() * 100
        })).filter(pos => {
            // Simple filter to keep lights roughly within cone shape
            const r = Math.sqrt(pos.position[0]**2 + pos.position[2]**2)
            const maxR = 2.5 * (1 - (pos.position[1] - 1) / 5)
            return r < maxR + 0.2 && r > maxR - 0.5
        })
    })

    return (
        <group>
            {lightsData.map((data, i) => (
                <Light key={i} {...data} />
            ))}
        </group>
    )
}

function Light({ position, speed, offset }: { position: [number, number, number], speed: number, offset: number }) {
    const ref = useRef<THREE.Mesh>(null)
    const [color] = useState(() => Math.random() > 0.5 ? "red" : "gold")
    
    useFrame((state) => {
        if (ref.current) {
            const s = Math.sin(state.clock.elapsedTime * speed + offset)
            const scale = (s + 1) / 2 // 0 to 1
            ref.current.scale.setScalar(scale * 0.1 + 0.05)
            // @ts-expect-error - material.emissiveIntensity exists on MeshStandardMaterial
            ref.current.material.emissiveIntensity = scale * 2
        }
    })

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={color} emissive="orange" toneMapped={false} />
        </mesh>
    )
}

export default function Tree() {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {/* Tree Layers - Crystal/Glass Look */}
      {/* Base Layer */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[2.5, 3, 32]} />
        <meshPhysicalMaterial 
          color="#0f5c2e" 
          roughness={0.2} 
          metalness={0.1}
          transmission={0.6}
          thickness={2}
        />
      </mesh>
      
      {/* Middle Layer */}
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[2, 2.5, 32]} />
        <meshPhysicalMaterial 
          color="#146b38" 
          roughness={0.2} 
          metalness={0.1}
          transmission={0.6}
          thickness={2}
        />
      </mesh>
      
      {/* Top Layer */}
      <mesh position={[0, 5, 0]}>
        <coneGeometry args={[1.5, 2, 32]} />
        <meshPhysicalMaterial 
          color="#1a7a42" 
          roughness={0.2} 
          metalness={0.1}
          transmission={0.6}
          thickness={2}
        />
      </mesh>
      
      {/* Trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
        <meshStandardMaterial color="#3e2723" roughness={0.8} />
      </mesh>

      {/* Star at the top */}
      <mesh position={[0, 6.2, 0]}>
         <dodecahedronGeometry args={[0.4, 0]} />
         <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
         <pointLight distance={10} intensity={2} color="#ffaa00" decay={2} />
      </mesh>

      {/* Christmas Lights */}
      <TwinkleLights count={30} />
    </group>
  )
}
