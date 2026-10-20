/* eslint-disable */
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PARTICLE_FRAGMENT_SHADER } from '@/lib/particleShader'

const MagicParticlesVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute vec3 aRandomness;
  attribute float aSpeed;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Add complex movement based on time and randomness
    float t = uTime * aSpeed;

    modelPosition.x += sin(t * aRandomness.x) * 0.5 + cos(t * 0.5) * aRandomness.z * 2.0;
    modelPosition.y += cos(t * aRandomness.y) * 0.5 + sin(t * 0.5) * 2.0;
    modelPosition.z += sin(t * aRandomness.z) * 0.5 + cos(t * 0.3) * aRandomness.x * 2.0;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Size attenuation
    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / -viewPosition.z);
  }
`

interface MagicParticlesProps {
  count?: number
  color?: string
  size?: number
}

/**
 * The ambient gold sparkles that drift through the whole scene.
 *
 * The particle size used to be frozen at whatever the device pixel ratio
 * was when the material was created. The renderer changes its pixel ratio
 * with the adaptive DPR, so the sparkles ended up the wrong size on
 * high-density screens.
 */
export default function MagicParticles({ count = 100, color = '#ffd700', size = 0.2 }: MagicParticlesProps) {
  const points = useRef<THREE.Points>(null)
  const gl = useThree((state) => state.gl)

  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: size * 250 }, // Scale size to appropriate range
        uPixelRatio: { value: 1 },
      },
      vertexShader: MagicParticlesVertexShader,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [color, size])

  // Generate attributes
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const randomness = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Spread particles in a large area
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 10
      positions[i3 + 2] = (Math.random() - 0.5) * 20

      scales[i] = Math.random()

      randomness[i3] = Math.random()
      randomness[i3 + 1] = Math.random()
      randomness[i3 + 2] = Math.random()

      speeds[i] = 0.2 + Math.random() * 0.8
    }

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    buffer.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    buffer.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return buffer
  }, [count])

  // Dispose the GPU resources when the particle set is replaced.
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  // Follow the renderer's pixel ratio, which the adaptive DPR changes at
  // runtime.
  useEffect(() => {
    material.uniforms.uPixelRatio.value = gl.getPixelRatio()
  }, [material, gl])

  useFrame((state) => {
    if (points.current && points.current.material instanceof THREE.ShaderMaterial) {
      points.current.material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return <points ref={points} material={material} geometry={geometry} />
}
