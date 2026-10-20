'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

function Dancer({ color, offset, speed, radius, height }: { color: string, offset: number, speed: number, radius: number, height: number }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
        const t = state.clock.elapsedTime * speed + offset

        // Spiral motion
        const x = Math.cos(t) * radius
        const z = Math.sin(t) * radius
        // Bobbing up and down + slowly rising/falling.
        // The base height keeps the dancers inside the camera frustum: the
        // camera looks at the origin from y = 2 with a 45° fov, so anything
        // above y ≈ 4.5 is rendered off-screen.
        const y = Math.sin(t * 2) * 1 + Math.sin(t * 0.5) * height + 1.8

        ref.current.position.set(x, y, z)
    }
  })

  return (
    <group ref={ref}>
        <Trail width={1} length={8} color={new THREE.Color(color)} attenuation={(t) => t * t}>
            <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
                <pointLight distance={5} intensity={2} color={color} />
            </mesh>
        </Trail>
    </group>
  )
}

export default function DancingCouple() {
  return (
    <group>
      {/* Dancer 1 - Blue/Cyan */}
      <Dancer color="#00ffff" offset={0} speed={1} radius={4} height={1.4} />

      {/* Dancer 2 - Pink/Magenta */}
      <Dancer color="#ff00ff" offset={Math.PI} speed={1} radius={4} height={1.4} />
    </group>
  )
}
