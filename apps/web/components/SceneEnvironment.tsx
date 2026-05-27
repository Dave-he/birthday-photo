'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

interface Palette {
    bg: string[]
    fog: string
    accent: string
    text: string
}

interface SceneEnvironmentProps {
    palette: Palette
}

function DynamicAtmosphereLight({ accentColor }: { accentColor: string }) {
    const lightRef = useRef<THREE.PointLight>(null)

    useFrame((state) => {
        if (lightRef.current) {
            const time = state.clock.getElapsedTime()
            // Slowly rotate the light in a circle above the scene
            lightRef.current.position.x = Math.sin(time * 0.4) * 7
            lightRef.current.position.z = Math.cos(time * 0.4) * 7
            // Breathing intensity
            lightRef.current.intensity = 3.0 + Math.sin(time * 1.2) * 1.5
        }
    })

    return (
        <pointLight 
            ref={lightRef} 
            position={[0, 6, 0]} 
            intensity={3} 
            color={accentColor} 
            decay={1.2}
            distance={25}
            castShadow
        />
    )
}

export default function SceneEnvironment({ palette }: SceneEnvironmentProps) {
    return (
        <>
            <fog attach="fog" args={[palette.fog, 12, 35]} />
            
            {/* Dynamic color background matching theme */}
            <color attach="background" args={[palette.fog]} />
            
            {/* Base ambient lighting */}
            <ambientLight intensity={0.4} />
            
            {/* High quality shadow-casting Key Light */}
            <directionalLight 
                position={[5, 15, 5]} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize-width={1024} 
                shadow-mapSize-height={1024}
                shadow-bias={-0.0005}
            />

            {/* Dynamic atmosphere colorful light that matches the scene accent color */}
            <DynamicAtmosphereLight accentColor={palette.accent} />

            {/* Rim fill light for highlighting glass/specular edges */}
            <pointLight position={[-10, 3, -10]} intensity={0.6} color={palette.text} />
            
            {/* Beautiful twinkling starry night sky */}
            <Stars radius={120} depth={60} count={6000} factor={6} saturation={0.5} fade speed={1.5} />
        </>
    )
}

