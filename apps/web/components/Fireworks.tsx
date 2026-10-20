/* eslint-disable */
'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PARTICLE_FRAGMENT_SHADER } from '@/lib/particleShader'

const FireworkVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute vec3 aVelocity;
  attribute float aLife;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Explosion physics.
    // uTime here is "time since explosion started".

    // Gravity
    float gravity = -0.5 * uTime * uTime;

    modelPosition.xyz += aVelocity * uTime * 4.0;
    modelPosition.y += gravity;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Size attenuation
    // Scale down as life fades
    float scale = max(0.0, 1.0 - (uTime / aLife));

    gl_PointSize = uSize * scale * uPixelRatio;
    gl_PointSize *= (1.0 / -viewPosition.z);
  }
`

/** How long a firework takes from launch to burst, in seconds. */
const LAUNCH_DURATION = 1.0
/** How long one full launch → burst → fade cycle takes. */
const CYCLE_DURATION = 3.5
/** How many particles a single burst has. */
const PARTICLES_PER_BURST = 100

interface Burst {
  position: [number, number, number]
  color: THREE.Color
  delay: number
  launch: THREE.Object3D | null
  points: THREE.Object3D | null
  material: THREE.ShaderMaterial
}

/**
 * The fireworks.
 *
 * Every burst used to run its own `useFrame` callback and flip a React
 * state variable to remember that it had exploded — which re-rendered the
 * component once per cycle for no visible reason. The bursts are now
 * driven by a single frame callback and the "has exploded" state lives in
 * a plain field.
 */
export default function Fireworks({
  count = 5,
  reducedMotion = false,
}: {
  count?: number
  reducedMotion?: boolean
}) {
  const gl = useThree((state) => state.gl)
  const groupRef = useRef<THREE.Group>(null)

  const bursts = useMemo<Burst[]>(() => {
    const colors = ['#ff0040', '#00ff40', '#0040ff', '#ffeb3b', '#ff00ff', '#00ffff']
    return new Array(Math.max(0, count)).fill(0).map(() => {
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: color },
          // The bursts sit well behind the stage, so the point size has
          // to be large to still read as sparks at that distance.
          uSize: { value: 200.0 },
          uPixelRatio: { value: 1 },
        },
        vertexShader: FireworkVertexShader,
        fragmentShader: PARTICLE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })

      return {
        position: [
          (Math.random() - 0.5) * 18,
          6.5 + Math.random() * 3,
          (Math.random() - 0.5) * 12 - 6,
        ],
        color,
        delay: Math.random() * CYCLE_DURATION,
        launch: null,
        points: null,
        material,
      }
    })
  }, [count])

  // The particle buffers are rebuilt whenever the number of bursts changes.
  const geometries = useMemo(() => {
    return bursts.map(() => {
      const positions = new Float32Array(PARTICLES_PER_BURST * 3)
      const velocities = new Float32Array(PARTICLES_PER_BURST * 3)
      const lifes = new Float32Array(PARTICLES_PER_BURST)

      for (let i = 0; i < PARTICLES_PER_BURST; i++) {
        const i3 = i * 3
        // Spherical explosion
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        const speed = 0.5 + Math.random() * 0.5

        velocities[i3] = speed * Math.sin(phi) * Math.cos(theta)
        velocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta)
        velocities[i3 + 2] = speed * Math.cos(phi)

        lifes[i] = 1.0 + Math.random() * 0.5 // 1.0s to 1.5s life
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3))
      geometry.setAttribute('aLife', new THREE.BufferAttribute(lifes, 1))
      return geometry
    })
  }, [bursts])

  // Dispose the GPU resources when the bursts are replaced or unmounted.
  useEffect(() => {
    return () => {
      geometries.forEach((geometry) => geometry.dispose())
      bursts.forEach((burst) => burst.material.dispose())
    }
  }, [bursts, geometries])

  // The particle size has to follow the renderer's pixel ratio, which
  // changes with the adaptive DPR — a frozen value makes the sparks the
  // wrong size on high-density screens.
  useEffect(() => {
    const ratio = gl.getPixelRatio()
    bursts.forEach((burst) => {
      burst.material.uniforms.uPixelRatio.value = ratio
    })
  }, [bursts, gl])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    for (const burst of bursts) {
      const t = ((time + burst.delay) % CYCLE_DURATION + CYCLE_DURATION) % CYCLE_DURATION

      if (t < LAUNCH_DURATION) {
        // Launch phase — the shell climbs towards the burst point.
        if (burst.launch) {
          burst.launch.visible = true
          const progress = t
          burst.launch.position.set(0, -5 + progress * 5, 0)
          burst.launch.scale.setScalar(1 - progress * 0.5)
        }
        if (burst.points) burst.points.visible = false
      } else {
        // Explosion phase.
        if (burst.launch) burst.launch.visible = false
        if (burst.points) burst.points.visible = true
        burst.material.uniforms.uTime.value = reducedMotion
          ? 0
          : Math.min(t - LAUNCH_DURATION, CYCLE_DURATION - LAUNCH_DURATION)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {bursts.map((burst, index) => (
        <group key={index} position={burst.position}>
          {/* Launch Trail */}
          <mesh
            ref={(node) => {
              burst.launch = node
            }}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>

          {/* Explosion Points */}
          <points
            ref={(node) => {
              burst.points = node
            }}
            material={burst.material}
            geometry={geometries[index]}
          />
        </group>
      ))}
    </group>
  )
}
