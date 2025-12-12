import { useRef } from 'react'
import * as THREE from 'three'

export default function Tree() {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {/* Tree Layers - Simple Cone Stack for now */}
      {/* Base Layer */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[2.5, 3, 16]} />
        <meshStandardMaterial color="#0f5c2e" roughness={0.8} />
      </mesh>
      
      {/* Middle Layer */}
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[2, 2.5, 16]} />
        <meshStandardMaterial color="#146b38" roughness={0.8} />
      </mesh>
      
      {/* Top Layer */}
      <mesh position={[0, 5, 0]}>
        <coneGeometry args={[1.5, 2, 16]} />
        <meshStandardMaterial color="#1a7a42" roughness={0.8} />
      </mesh>
      
      {/* Trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>

      {/* Star at the top */}
      <mesh position={[0, 6.2, 0]}>
         <dodecahedronGeometry args={[0.4, 0]} />
         <meshStandardMaterial color="gold" emissive="yellow" emissiveIntensity={0.5} />
         <pointLight distance={5} intensity={2} color="yellow" />
      </mesh>
    </group>
  )
}
