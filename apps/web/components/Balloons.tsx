/* eslint-disable */
'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { animateBalloon } from '@/lib/balloonAnimation'

interface BalloonDatum {
  position: [number, number, number]
  color: string
  speed: number
  offset: number
}

function BalloonInstance({ position, color, speed, offset }: BalloonDatum) {
    const ref = useRef<any>(null)
    const [startPos] = useState(() => new THREE.Vector3(...position))

    useFrame((state) => {
      if (!ref.current) return
      const { x, y, z, rotZ } = animateBalloon(state.clock.elapsedTime, {
        startPos, speed, offset,
      })
      ref.current.position.set(x, y, z)
      ref.current.rotation.set(0, 0, rotZ)
    })

    return <Instance ref={ref} color={color} />
}

function BalloonStringInstance({ position, speed, offset }: BalloonDatum) {
    const ref = useRef<any>(null)
    const [startPos] = useState(() => new THREE.Vector3(...position))

    useFrame((state) => {
      if (!ref.current) return
      const { x, y, z, rotZ } = animateBalloon(state.clock.elapsedTime, {
        startPos,
        speed,
        offset,
        // String sits 0.65 units below the balloon center.
        yOffset: -0.65,
      })
      ref.current.position.set(x, y, z)
      ref.current.rotation.set(0, 0, rotZ)
    })

    return <Instance ref={ref} />
}

export default function Balloons({ count = 20 }: { count?: number }) {
    const [balloonsData] = useState<BalloonDatum[]>(() => {
        const colors = ['#ff1744', '#d500f9', '#2979ff', '#00e676', '#ffea00', '#ff9100']
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 15,
                0, // Y is handled in animation
                (Math.random() - 0.5) * 8 - 2
            ] as [number, number, number],
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 0.5 + Math.random(),
            offset: Math.random() * 100
        }))
    })

    const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.3, 16, 16), [])
    const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.005, 0.005, 1), [])

    // Materials
    const balloonMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 0.1 }), [])
    const stringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 'white', opacity: 0.5, transparent: true }), [])

    return (
        <group>
            {/* Balloon Bodies */}
            <Instances range={count} geometry={sphereGeo} material={balloonMat}>
                {balloonsData.map((data, i) => (
                    <BalloonInstance key={`body-${i}`} {...data} />
                ))}
            </Instances>

            {/* Strings - separate Instances because they need a different
                geometry/material than the body. */}
            <Instances range={count} geometry={cylinderGeo} material={stringMat}>
                {balloonsData.map((data, i) => (
                    <BalloonStringInstance key={`string-${i}`} {...data} />
                ))}
            </Instances>
        </group>
    )
}
