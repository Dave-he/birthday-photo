'use client'
import { ThreeElements } from '@react-three/fiber'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * The birthday cake.
 *
 * The flame used to be animated by writing `position.y` on a group whose
 * position was already set by the props, so the flicker fought with the
 * layout. The flame now scales in place, and the candlelight flickers with
 * it, which reads much better.
 */
export default function Cake({
  scale = 1,
  reducedMotion = false,
  ...props
}: ThreeElements['group'] & { scale?: number; reducedMotion?: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (reducedMotion) return
    const time = state.clock.elapsedTime
    // Two frequencies beating against each other look like a real flame.
    const flicker = 0.88 + Math.sin(time * 11) * 0.07 + Math.sin(time * 26) * 0.05

    if (flameRef.current) {
      flameRef.current.scale.set(0.85 + flicker * 0.2, flicker, 0.85 + flicker * 0.2)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.6 * flicker
    }
  })

  return (
    <group {...props} scale={scale}>
      <Float speed={2} rotationIntensity={0.15} floatIntensity={0.35} floatingRange={[-0.05, 0.05]}>
        {/* Base Plate */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.16, 40]} />
          <meshStandardMaterial color="silver" metalness={0.9} roughness={0.18} envMapIntensity={2.2} />
        </mesh>

        {/* Bottom Tier */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.3, 1.3, 0.9, 40]} />
          <meshStandardMaterial color="#fce4ec" roughness={0.45} envMapIntensity={1.1} />
        </mesh>

        {/* Icing band */}
        <mesh position={[0, 1.02, 0]}>
          <torusGeometry args={[1.3, 0.055, 10, 48]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} envMapIntensity={1.2} />
        </mesh>

        {/* Middle Tier */}
        <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.95, 0.95, 0.75, 40]} />
          <meshStandardMaterial color="#f8bbd0" roughness={0.45} envMapIntensity={1.1} />
        </mesh>

        {/* Top Tier */}
        <mesh position={[0, 1.95, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.55, 40]} />
          <meshStandardMaterial color="#f48fb1" roughness={0.45} envMapIntensity={1.1} />
        </mesh>

        {/* Cherries around the bottom tier */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 1.24, 1.12, Math.sin(angle) * 1.24]}
              castShadow
            >
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color="#d81b60" roughness={0.12} metalness={0.1} envMapIntensity={1.6} />
            </mesh>
          )
        })}

        {/* Candle */}
        <group position={[0, 2.2, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.6, 12]} />
            <meshStandardMaterial color="#fff8e7" roughness={0.5} />
          </mesh>
          {/* Candle stripes */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.12, 12]} />
            <meshStandardMaterial color="#ef5350" roughness={0.5} />
          </mesh>

          {/* Flame */}
          <mesh ref={flameRef} position={[0, 0.72, 0]}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial
              color="#ffb347"
              emissive="#ff8c00"
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <pointLight ref={lightRef} position={[0, 0.75, 0]} distance={5} intensity={2.6} color="#ff9d47" />
        </group>
      </Float>
    </group>
  )
}
