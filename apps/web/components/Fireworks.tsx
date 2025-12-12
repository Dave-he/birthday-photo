'use client'
import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple Sound Manager for Fireworks
const playExplosionSound = (volume: number = 0.3) => {
    // Placeholder for sound logic
}

const FireworkMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffffff') },
    uSize: { value: 20.0 },
    uPixelRatio: { value: 1 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uSize;
    uniform float uPixelRatio;
    
    attribute vec3 aVelocity;
    attribute float aLife;
    
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      // Explosion physics
      // uTime here is "time since explosion started"
      
      // Gravity
      float gravity = -0.5 * uTime * uTime;
      
      modelPosition.xyz += aVelocity * uTime * 5.0;
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
  `,
  fragmentShader: `
    uniform vec3 uColor;
    
    void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      if(distanceToCenter > 0.5) discard;
      
      // Glowy center
      float strength = 0.05 / distanceToCenter - 0.1;
      
      gl_FragColor = vec4(uColor, strength);
    }
  `
}

function Firework({ position, color, delay, soundEnabled }: { position: [number, number, number], color: string, delay: number, soundEnabled: boolean }) {
  const points = useRef<THREE.Points>(null)
  const launchRef = useRef<THREE.Mesh>(null)
  
  const [exploded, setExploded] = useState(false)
  const startTimeRef = useRef<number | null>(null)

  // Particle Data
  const { positions, velocities, lifes } = useMemo(() => {
    const count = 100
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const lifes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3] = 0
        positions[i3+1] = 0
        positions[i3+2] = 0
        
        // Spherical explosion
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos((Math.random() * 2) - 1)
        const speed = 0.5 + Math.random() * 0.5 // Faster spread
        
        velocities[i3] = speed * Math.sin(phi) * Math.cos(theta)
        velocities[i3+1] = speed * Math.sin(phi) * Math.sin(theta)
        velocities[i3+2] = speed * Math.cos(phi)

        lifes[i] = 1.0 + Math.random() * 0.5 // 1.0s to 1.5s life
    }
    
    return { positions, velocities, lifes }
  }, [])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(color) },
            uSize: { value: 50.0 },
            uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 }
        },
        vertexShader: FireworkMaterial.vertexShader,
        fragmentShader: FireworkMaterial.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })
  }, [color])

  useFrame((state) => {
    if (!launchRef.current || !points.current) return

    const time = state.clock.elapsedTime
    const cycleDuration = 3.5
    const t = (time + delay) % cycleDuration
    
    // Launch Phase
    if (t < 1.0) {
        launchRef.current.visible = true
        points.current.visible = false
        if (exploded) setExploded(false)
        
        const progress = t
        // Move from y-5 to y=0 (relative to group position)
        launchRef.current.position.set(0, -5 + (progress * 5), 0)
        launchRef.current.scale.setScalar(1 - (progress * 0.5))
    } 
    // Explosion Phase
    else {
        launchRef.current.visible = false
        points.current.visible = true
        
        if (!exploded) {
            setExploded(true)
            if (soundEnabled) playExplosionSound()
        }

        const explosionTime = t - 1.0
        // Update shader time
        ;(points.current.material as THREE.ShaderMaterial).uniforms.uTime.value = explosionTime
    }
  })

  return (
    <group position={position}>
        {/* Launch Trail */}
        <mesh ref={launchRef}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>

        {/* Explosion Points */}
        <points ref={points} material={material}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aVelocity"
                    args={[velocities, 3]}
                />
                <bufferAttribute
                    attach="attributes-aLife"
                    args={[lifes, 1]}
                />
            </bufferGeometry>
        </points>
    </group>
  )
}

export default function Fireworks({ count = 5, soundEnabled = false }: { count?: number, soundEnabled?: boolean }) {
    const [fireworksData] = useState(() => {
        const colors = ['#ff0040', '#00ff40', '#0040ff', '#ffeb3b', '#ff00ff', '#00ffff']
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 20,
                8 + Math.random() * 4,
                (Math.random() - 0.5) * 10 - 5
            ] as [number, number, number],
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 4
        }))
    })

    return (
        <group>
            {fireworksData.map((data, i) => (
                <Firework key={i} {...data} soundEnabled={soundEnabled} />
            ))}
        </group>
    )
}
