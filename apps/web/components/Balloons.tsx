/* eslint-disable */
'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { animateBalloon } from '@/lib/balloonAnimation'

interface BalloonDatum {
  startPos: { x: number; y: number; z: number }
  color: THREE.Color
  speed: number
  offset: number
  scale: number
}

/**
 * The largest number of balloons the pool can hold.
 *
 * The pool is allocated once and only `count` of the instances are drawn,
 * so changing the particle multiplier adds or removes balloons without
 * reshuffling (or re-creating) the ones that are already floating.
 */
const MAX_BALLOONS = 64

/**
 * The balloons.
 *
 * They used to be one `<Instance>` per balloon, each with its own
 * `useFrame` callback: forty balloons meant eighty frame callbacks and
 * eighty React elements per frame. They are now two instanced meshes
 * (bodies and strings) driven by a single callback.
 */
export default function Balloons({
  count = 20,
  reducedMotion = false,
}: {
  count?: number
  reducedMotion?: boolean
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const stringRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const balloonsData = useMemo<BalloonDatum[]>(() => {
    const colors = ['#ff1744', '#d500f9', '#2979ff', '#00e676', '#ffea00', '#ff9100']
    return new Array(MAX_BALLOONS).fill(0).map(() => ({
      startPos: {
        x: (Math.random() - 0.5) * 15,
        y: 0, // Y is handled in animation
        z: (Math.random() - 0.5) * 8 - 2,
      },
      color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
      speed: 0.5 + Math.random(),
      offset: Math.random() * 100,
      scale: 0.8 + Math.random() * 0.5,
    }))
  }, [])

  // Only the first `count` balloons are drawn.
  useEffect(() => {
    const visible = Math.min(MAX_BALLOONS, Math.max(0, Math.floor(count)))
    if (bodyRef.current) bodyRef.current.count = visible
    if (stringRef.current) stringRef.current.count = visible
  }, [count])

  useFrame((state) => {
    const body = bodyRef.current
    const string = stringRef.current
    if (!body || !string) return

    const time = reducedMotion ? 0 : state.clock.elapsedTime
    const visible = Math.min(MAX_BALLOONS, Math.max(0, Math.floor(count)))

    for (let i = 0; i < visible; i++) {
      const balloon = balloonsData[i]
      const { x, y, z, rotZ } = animateBalloon(time, {
        startPos: balloon.startPos,
        speed: balloon.speed,
        offset: balloon.offset,
      })

      // Body
      dummy.position.set(x, y, z)
      dummy.rotation.set(0, 0, rotZ)
      dummy.scale.set(balloon.scale, balloon.scale * 1.15, balloon.scale)
      dummy.updateMatrix()
      body.setMatrixAt(i, dummy.matrix)
      body.setColorAt(i, balloon.color)

      // String — 0.65 units below the balloon centre.
      dummy.position.set(x, y - 0.65, z)
      dummy.rotation.set(0, 0, rotZ)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      string.setMatrixAt(i, dummy.matrix)
    }

    body.instanceMatrix.needsUpdate = true
    string.instanceMatrix.needsUpdate = true
    if (body.instanceColor) body.instanceColor.needsUpdate = true
  })

  return (
    <group>
      {/* Balloon Bodies */}
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, MAX_BALLOONS]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial roughness={0.15} metalness={0.15} envMapIntensity={1.2} />
      </instancedMesh>

      {/* Strings - a separate instanced mesh because they need a different
          geometry and material than the body. */}
      <instancedMesh
        ref={stringRef}
        args={[undefined, undefined, MAX_BALLOONS]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.006, 0.006, 0.7, 6]} />
        <meshBasicMaterial color="white" opacity={0.45} transparent />
      </instancedMesh>
    </group>
  )
}
