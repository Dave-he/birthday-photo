'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

/**
 * A wrapped present.
 *
 * Two bugs are fixed here:
 *
 * 1. The hop used to add to `position.y` on a group whose position is
 *    owned by react-spring, so the spring and the animation fought over
 *    the same value — the box jumped around at random. The hop now runs on
 *    a child group, which nothing else writes to.
 * 2. The rotation was `+= 0.01` per *frame*, so a 144 Hz display spun the
 *    boxes twice as fast as a 60 Hz one. It is now driven by the clock.
 */
export default function Gift({
  position,
  color = "#ef5350",
  rotateSpeed = 1,
  reducedMotion = false,
}: {
  position: [number, number, number]
  color?: string
  rotateSpeed?: number
  reducedMotion?: boolean
}) {
  const spinRef = useRef<THREE.Group>(null)
  const hopRef = useRef<THREE.Group>(null)
  const hopOffset = useRef(0)
  const [active, setActive] = useState(false)
  const [picked, setPicked] = useState(false)

  const { scale } = useSpring({
    scale: active || picked ? 1.15 : 1,
    config: { tension: 300, friction: 10 },
  })

  useFrame((state, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.6 * rotateSpeed
    }
    if (hopRef.current && !reducedMotion) {
      // A small, decaying hop.
      hopOffset.current = Math.max(0, hopOffset.current - delta * 0.8)
      const bounce = Math.sin(hopOffset.current * Math.PI) * 0.18
      hopRef.current.position.y = bounce
    }
  })

  const handleClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation()
    setPicked((current) => !current)
    hopOffset.current = 1
  }

  return (
    <animated.group position={position} scale={scale}>
      <animated.group
        ref={hopRef}
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation()
          setActive(true)
        }}
        onPointerOut={() => setActive(false)}
      >
        <group ref={spinRef}>
          {/* Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} envMapIntensity={1.2} />
          </mesh>

          {/* Ribbon Vertical */}
          <mesh scale={[1.01, 1.01, 0.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gold" metalness={0.85} roughness={0.2} envMapIntensity={2} />
          </mesh>

          {/* Ribbon Horizontal */}
          <mesh scale={[0.2, 1.01, 1.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gold" metalness={0.85} roughness={0.2} envMapIntensity={2} />
          </mesh>

          {/* Bow on top */}
          <group position={[0, 0.5, 0]}>
            <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.2, 0.05, 12, 24]} />
              <meshStandardMaterial color="gold" metalness={0.85} roughness={0.25} envMapIntensity={2} />
            </mesh>
            <mesh position={[-0.2, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <torusGeometry args={[0.2, 0.05, 12, 24]} />
              <meshStandardMaterial color="gold" metalness={0.85} roughness={0.25} envMapIntensity={2} />
            </mesh>
          </group>
        </group>
      </animated.group>
    </animated.group>
  )
}
