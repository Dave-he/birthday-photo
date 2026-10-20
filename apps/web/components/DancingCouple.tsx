'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

function Dancer({
  color,
  offset,
  speed,
  radius,
  height,
  reducedMotion,
}: {
  color: string
  offset: number
  speed: number
  radius: number
  height: number
  reducedMotion: boolean
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offset

      // Spiral motion
      const x = Math.cos(t) * radius
      const z = Math.sin(t) * radius
      // Bobbing up and down + slowly rising/falling.
      // The base height keeps the dancers inside the camera frustum: the
      // camera looks at the middle of the stage, so anything far above
      // that is rendered off-screen.
      const y = reducedMotion ? 1.8 : Math.sin(t * 2) * 1 + Math.sin(t * 0.5) * height + 1.8

      ref.current.position.set(x, y, z)
    }
  })

  return (
    <group ref={ref}>
      <Trail
        /* drei scales the requested width by 0.1 and MeshLine divides it
         * by the view depth, so a "2.6" wide trail came out three pixels
         * across. 10 renders as a ribbon of roughly 25 pixels. */
        width={10}
        length={4}
        color={new THREE.Color(color)}
        decay={1}
        local={false}
        stride={0.01}
        /* Taper towards the tail, but never all the way to nothing. */
        attenuation={(t) => 0.22 + 0.78 * t}
      >
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <pointLight distance={6} intensity={2.4} color={color} />
      </Trail>
    </group>
  )
}

/**
 * The dancing couple.
 *
 * Their trails were drawn with a width of one unit and a length of eight
 * frames, which made them look like a hairline rather than a ribbon of
 * light. The trail now has a real width and is short enough that its
 * points are actually filled in — a long trail with too few samples per
 * frame renders as a dotted line.
 */
export default function DancingCouple({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <group>
      {/* Dancer 1 - Blue/Cyan */}
      <Dancer color="#00ffff" offset={0} speed={1} radius={3.1} height={1.2} reducedMotion={reducedMotion} />

      {/* Dancer 2 - Pink/Magenta */}
      <Dancer color="#ff00ff" offset={Math.PI} speed={1} radius={3.1} height={1.2} reducedMotion={reducedMotion} />
    </group>
  )
}
