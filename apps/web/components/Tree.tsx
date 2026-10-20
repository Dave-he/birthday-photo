'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import {
    GOLDEN_ANGLE,
    TREE_STAR_Y,
    TREE_TIERS,
    TREE_TOP,
    TREE_TRUNK_HEIGHT,
    getTreeRadiusAt,
} from '@/lib/treeLayout'
import { CLOUD_TEXTURE_URL } from '@/lib/assets'
import { useLocalTexture } from '@/hooks/useLocalTexture'

/** The festive colours the tree lights cycle through. */
const LIGHT_COLORS = ['#ffd166', '#ff6b6b', '#fff3b0', '#7ce7c4', '#8ab6ff']

interface TwinkleLight {
    position: [number, number, number]
    speed: number
    offset: number
    color: THREE.Color
}

/**
 * The twinkling lights strung around the tree.
 *
 * They used to be individual meshes, each with its own `useFrame` callback
 * and its own material: forty draw calls and forty frame callbacks for
 * what is really one instanced mesh. They are now a single
 * `InstancedMesh` driven by one callback.
 *
 * Their positions used to be filtered through a "keep the lights in a shell
 * around the cone" test that threw away almost every candidate, so the
 * tree ended up with one or two flickering specks instead of a string of
 * lights. They are now placed directly on the tree's surface, using the
 * same profile the tree mesh and the photo gallery use.
 */
function TwinkleLights({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const scratch = useMemo(() => new THREE.Color(), [])

    const lights = useMemo<TwinkleLight[]>(() => {
        const items: TwinkleLight[] = []
        for (let i = 0; i < count; i++) {
            const t = (i + 0.5) / count
            const y = TREE_TRUNK_HEIGHT + 0.55 + t * (TREE_TOP - TREE_TRUNK_HEIGHT - 1.5)
            const radius = getTreeRadiusAt(y) + 0.14
            const angle = i * GOLDEN_ANGLE
            items.push({
                position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
                speed: 0.6 + (i % 7) * 0.17,
                offset: i * 1.37,
                color: new THREE.Color(LIGHT_COLORS[i % LIGHT_COLORS.length]),
            })
        }
        return items
    }, [count])

    useFrame((state) => {
        const mesh = meshRef.current
        if (!mesh) return

        const time = reducedMotion ? 0 : state.clock.elapsedTime

        for (let i = 0; i < lights.length; i++) {
            const light = lights[i]
            // One shared material means the twinkle has to come from the
            // instance colour and the scale, not from a per-light material.
            const phase = Math.sin(time * light.speed + light.offset) * 0.5 + 0.5
            const scale = 0.085 + phase * 0.1

            dummy.position.set(light.position[0], light.position[1], light.position[2])
            dummy.scale.setScalar(scale)
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)

            scratch.copy(light.color).multiplyScalar(0.5 + phase * 1.15)
            mesh.setColorAt(i, scratch)
        }

        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, Math.max(1, count)]}
            frustumCulled={false}
        >
            <sphereGeometry args={[1, 8, 8]} />
            {/* A basic material keeps the bulbs glowing independently of the
                scene lighting, and it is the cheapest material there is. */}
            <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
    )
}

export default function Tree({
    lightCount = 40,
    reducedMotion = false,
}: {
    lightCount?: number
    reducedMotion?: boolean
}) {
    const starRef = useRef<THREE.Mesh>(null)
    const glowTexture = useLocalTexture(CLOUD_TEXTURE_URL)

    useFrame((state) => {
        if (!starRef.current || reducedMotion) return
        const time = state.clock.elapsedTime
        const pulse = 1 + Math.sin(time * 2.2) * 0.08
        starRef.current.rotation.y = time * 0.6
        starRef.current.scale.setScalar(pulse)
    })

    return (
        <group>
            {/* Tree Layers - the profile is shared with the photo gallery so
                the photos really hang on the branches. */}
            {TREE_TIERS.map((tier, index) => (
                <group key={index}>
                    <mesh position={[0, tier.base + tier.height / 2, 0]} castShadow>
                        <coneGeometry args={[tier.radius, tier.height, 32]} />
                        <meshStandardMaterial
                            color={index === 0 ? '#0e4529' : index === 1 ? '#125231' : '#175e39'}
                            roughness={0.62}
                            metalness={0.02}
                            envMapIntensity={0.75}
                        />
                    </mesh>
                    {/* A ring of branches along the bottom of the tier. Without
                        it the tree reads as a smooth plastic cone; with it,
                        the tiers separate and the silhouette looks like
                        foliage. */}
                    <mesh
                        position={[0, tier.base + 0.04, 0]}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <torusGeometry args={[tier.radius * 0.985, tier.radius * 0.075, 8, 32]} />
                        <meshStandardMaterial
                            color={index === 0 ? '#0a3a21' : '#0d4527'}
                            roughness={0.9}
                            metalness={0}
                        />
                    </mesh>
                </group>
            ))}

            {/* Trunk */}
            <mesh position={[0, TREE_TRUNK_HEIGHT / 2, 0]} castShadow>
                <cylinderGeometry args={[0.46, 0.6, TREE_TRUNK_HEIGHT, 16]} />
                <meshStandardMaterial color="#3e2723" roughness={0.85} envMapIntensity={0.6} />
            </mesh>

            {/* Star at the top */}
            <group position={[0, TREE_STAR_Y, 0]}>
                <mesh ref={starRef}>
                    <dodecahedronGeometry args={[0.42, 0]} />
                    <meshStandardMaterial
                        color="#ffd700"
                        emissive="#ffaa00"
                        emissiveIntensity={2.4}
                        roughness={0.25}
                        metalness={0.7}
                        toneMapped={false}
                    />
                </mesh>
                {/* Soft halo, so the star reads as a light source and not as
                    a yellow polygon. */}
                {glowTexture && (
                    <Billboard>
                        <mesh scale={2.6}>
                            <planeGeometry args={[1, 1]} />
                            <meshBasicMaterial
                                map={glowTexture}
                                color="#ffc861"
                                transparent
                                depthWrite={false}
                                blending={THREE.AdditiveBlending}
                                toneMapped={false}
                            />
                        </mesh>
                    </Billboard>
                )}
                <pointLight distance={12} intensity={3} color="#ffb347" decay={2} />
            </group>

            {/* Christmas Lights */}
            <TwinkleLights count={lightCount} reducedMotion={reducedMotion} />
        </group>
    )
}
