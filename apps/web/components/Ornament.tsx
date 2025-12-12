import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import { motion } from 'framer-motion-3d'
import * as THREE from 'three'

interface OrnamentProps {
  id: string
  position: [number, number, number]
  imageUrl: string
  title?: string
  description?: string
  onClick: (id: string) => void
  isSelected: boolean
}

export default function Ornament({ id, position, imageUrl, title, description, onClick, isSelected }: OrnamentProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  
  // Load texture
  const texture = new THREE.TextureLoader().load(imageUrl)
  
  // Gentle rotation animation
  useFrame((state) => {
    if (meshRef.current && !isSelected) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.002
    }
  })

  return (
    <group position={position}>
      {/* String hanging the ornament */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      <motion.mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick(id)
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
        animate={{
            scale: isSelected ? 2 : hovered ? 1.2 : 1
        }}
      >
        {/* Sphere Ornament */}
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
            map={texture} 
            color={hovered ? 'white' : '#eeeeee'}
            roughness={0.2}
            metalness={0.1}
        />
        
        {/* Glow effect when hovered */}
        {hovered && (
             <pointLight distance={2} intensity={2} color="gold" />
        )}
      </motion.mesh>
      
      {/* Label on hover (only if not selected) */}
      {hovered && !isSelected && title && (
        <Html position={[0, -0.5, 0]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm">
            {title}
          </div>
        </Html>
      )}
    </group>
  )
}
