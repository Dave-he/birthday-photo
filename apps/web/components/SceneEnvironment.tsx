'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { Palette } from '@/lib/palettes'
import type { SceneQuality } from '@/lib/sceneQuality'

interface SceneEnvironmentProps {
    palette: Palette
    quality: SceneQuality
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
            // Deliberately NOT casting a shadow: a shadow-casting point
            // light has to render the whole scene six times (once per cube
            // face) on every frame it moves, and this one moves constantly.
            // That was by far the most expensive thing in the scene.
        />
    )
}

/**
 * The lighting rig.
 *
 * The image-based lighting is generated *locally* from a handful of
 * emissive shapes. drei's `<Environment preset>` downloads an HDR from a
 * public CDN, which is exactly the kind of remote dependency that used to
 * leave the whole scene blank — and without any environment map the
 * glass, the gold ribbons and the tree's "crystal" finish all rendered
 * flat and lifeless.
 */
export default function SceneEnvironment({ palette, quality }: SceneEnvironmentProps) {
    return (
        <>
            <fog attach="fog" args={[palette.fog, 14, 42]} />

            {/* Dynamic color background matching theme */}
            <color attach="background" args={[palette.fog]} />

            {/* Image-based lighting, baked from local emissive shapes. */}
            <Environment
                key={palette.accent}
                resolution={quality.environmentResolution}
                frames={1}
            >
                <color attach="background" args={[palette.fog]} />
                {/* Warm key light above and behind the stage. */}
                <Lightformer
                    form="ring"
                    intensity={3.2}
                    color={palette.accent}
                    scale={9}
                    position={[0, 7, -10]}
                    target={[0, 0, 0]}
                />
                {/* Cool fill from the left. */}
                <Lightformer
                    form="rect"
                    intensity={1.8}
                    color="#9fc4ff"
                    scale={[12, 7, 1]}
                    position={[-11, 5, 3]}
                    rotation={[0, Math.PI / 2.4, 0]}
                />
                {/* Soft rim from the right, in the palette's text colour. */}
                <Lightformer
                    form="rect"
                    intensity={1.5}
                    color={palette.text}
                    scale={[10, 6, 1]}
                    position={[11, 4, 1]}
                    rotation={[0, -Math.PI / 2.4, 0]}
                />
                {/* Bounce light from the floor. */}
                <Lightformer
                    form="circle"
                    intensity={0.8}
                    color={palette.text}
                    scale={7}
                    position={[0, -6, 4]}
                    rotation={[Math.PI / 2, 0, 0]}
                />
            </Environment>

            {/* Base ambient lighting */}
            <ambientLight intensity={0.7} />

            {/* Sky/ground gradient — cheap, and it keeps the floor from
                looking like a cut-out. */}
            <hemisphereLight args={[palette.text, palette.fog, 1.1]} />

            {/* High quality shadow-casting Key Light */}
            <directionalLight
                position={[5, 15, 5]}
                intensity={1.6}
                castShadow={quality.shadows}
                shadow-mapSize-width={quality.shadowMapSize}
                shadow-mapSize-height={quality.shadowMapSize}
                shadow-bias={-0.0005}
                shadow-camera-near={1}
                shadow-camera-far={60}
                shadow-camera-left={-14}
                shadow-camera-right={14}
                shadow-camera-top={14}
                shadow-camera-bottom={-14}
            />

            {/* Dynamic atmosphere colorful light that matches the scene accent color */}
            <DynamicAtmosphereLight accentColor={palette.accent} />

            {/* A pool of light over the stage. Without it the floor is a
                flat, evenly lit disc and the scene has no focal point. */}
            <pointLight
                position={[0, 13, 2]}
                intensity={70}
                distance={28}
                decay={1.6}
                color={palette.text}
            />

            {/* Rim fill light for highlighting glass/specular edges */}
            <pointLight position={[-10, 3, -10]} intensity={0.8} color={palette.text} />

            {/* Beautiful twinkling starry night sky */}
            <Stars
                radius={110}
                depth={50}
                count={quality.starCount}
                factor={6}
                saturation={0.5}
                fade
                speed={1.5}
            />
        </>
    )
}
