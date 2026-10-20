'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A heart drawn in light.
 *
 * The romantic scene used to be two glowing dots in an empty void: the
 * whole middle of the screen was nothing but fog. The heart gives the
 * scene a subject, and the orbiting lights read as the two of them moving
 * around each other.
 */
export default function HeartArch({
  count = 72,
  color = '#ff5da2',
  reducedMotion = false,
}: {
  count?: number
  color?: string
  reducedMotion?: boolean
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const scratch = useMemo(() => new THREE.Color(), [])

  const lights = useMemo(() => {
    const base = new THREE.Color(color)
    return new Array(Math.max(1, count)).fill(0).map((_, index) => {
      // The classic heart curve.
      const t = (index / count) * Math.PI * 2
      const x = 16 * Math.sin(t) ** 3
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      return {
        // Scale the curve down to the stage and lift it into the air.
        position: [x * 0.145, y * 0.145 + 4.3, 0] as [number, number, number],
        speed: 0.5 + (index % 9) * 0.12,
        offset: index * 0.9,
        color: base.clone().offsetHSL(0, 0, (index % 5) * 0.04),
      }
    })
  }, [count, color])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const time = reducedMotion ? 0 : state.clock.elapsedTime
    // The whole heart breathes.
    const breath = 1 + Math.sin(time * 0.7) * 0.015

    for (let i = 0; i < lights.length; i++) {
      const light = lights[i]
      const phase = Math.sin(time * light.speed + light.offset) * 0.5 + 0.5
      const scale = (0.055 + phase * 0.05) * breath

      dummy.position.set(light.position[0], light.position[1], light.position[2])
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      scratch.copy(light.color).multiplyScalar(0.5 + phase * 0.8)
      mesh.setColorAt(i, scratch)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, Math.max(1, count)]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
