'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MagicParticlesMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffd700') },
    uSize: { value: 0.2 },
    uPixelRatio: { value: 1 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    
    attribute float aScale;
    attribute vec3 aRandomness;
    attribute float aSpeed;
    
    varying vec3 vColor;
    
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
  `,
  fragmentShader: `
    uniform vec3 uColor;
    
    void main() {
      // Circular particle
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      if(distanceToCenter > 0.5) discard;
      
      // Soft edge
      float strength = 0.05 / distanceToCenter - 0.1;
      
      gl_FragColor = vec4(uColor, strength);
    }
  `
}

interface MagicParticlesProps {
  count?: number
  color?: string
}

export default function MagicParticles({ count = 100, color = '#ffd700' }: MagicParticlesProps) {
  const points = useRef<THREE.Points>(null)
  
  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: 50.0 }, // Base size
        uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 }
      },
      vertexShader: MagicParticlesMaterial.vertexShader,
      fragmentShader: MagicParticlesMaterial.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [color])

  // Generate attributes
  const { positions, scales, randomness, speeds } = useMemo(() => {
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

    return { positions, scales, randomness, speeds }
  }, [count])

  useFrame((state) => {
    if (points.current && points.current.material instanceof THREE.ShaderMaterial) {
      points.current.material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points ref={points} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          args={[randomness, 3]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
      </bufferGeometry>
    </points>
  )
}
