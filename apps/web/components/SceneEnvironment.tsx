'use client'
import { Stars } from '@react-three/drei'

interface Palette {
    bg: string[]
    fog: string
    accent: string
    text: string
}

interface SceneEnvironmentProps {
    palette: Palette
}

export default function SceneEnvironment({ palette }: SceneEnvironmentProps) {
    return (
        <>
            <fog attach="fog" args={[palette.fog, 10, 30]} />
            
            {/* Environment and Lighting */}
            {/* Using a solid color background instead of HDR to avoid loading errors */}
            <color attach="background" args={[palette.fog]} />
            
            {/* <Environment preset="night" /> - Removed to prevent CDN load errors */}
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} castShadow />
            
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    )
}
