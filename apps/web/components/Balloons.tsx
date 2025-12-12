'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

function BalloonInstance({ position, color, speed, offset }: { position: [number, number, number], color: string, speed: number, offset: number }) {
    const ref = useRef<any>(null)
    const [startPos] = useState(() => new THREE.Vector3(...position))
    
    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.elapsedTime
            
            // Floating up logic relative to initial position
            // To loop it, we can use modulo on Y
            
            const yOffset = (time * speed * 0.5) % 15
            // Start from bottom (-5) go up to 10
            const currentY = -5 + yOffset
            
            // Swaying
            const swayX = Math.sin(time + offset) * 0.5
            const swayRot = Math.sin(time * 2 + offset) * 0.1
            
            ref.current.position.set(
                startPos.x + swayX,
                currentY,
                startPos.z
            )
            ref.current.rotation.set(0, 0, swayRot)
        }
    })

    return <Instance ref={ref} color={color} />
}

export default function Balloons({ count = 20 }: { count?: number }) {
    const [balloonsData] = useState(() => {
        const colors = ['#ff1744', '#d500f9', '#2979ff', '#00e676', '#ffea00', '#ff9100']
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 15,
                0, // Y is handled in animation
                (Math.random() - 0.5) * 8 - 2 
            ] as [number, number, number],
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 0.5 + Math.random(),
            offset: Math.random() * 100
        }))
    })

    const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.3, 16, 16), [])
    const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.005, 0.005, 1), [])
    
    // Materials
    const balloonMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 0.1 }), [])
    const stringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 'white', opacity: 0.5, transparent: true }), [])

    return (
        <group>
            {/* Balloon Bodies */}
            <Instances range={count} geometry={sphereGeo} material={balloonMat}>
                {balloonsData.map((data, i) => (
                    <BalloonInstance key={`body-${i}`} {...data} />
                ))}
            </Instances>

            {/* Strings - Need separate instances because different geometry/material */}
            {/* Simplified: For strings, we can just attach them to the same logic, 
                but Instance nesting isn't direct like Group. 
                We would need another set of Instances tracking the same positions but offset.
                For simplicity and performance balance, rendering strings as a separate Instances group 
                controlled by the same data is fine.
            */}
             <Instances range={count} geometry={cylinderGeo} material={stringMat}>
                {balloonsData.map((data, i) => (
                    <BalloonStringInstance key={`string-${i}`} {...data} />
                ))}
            </Instances>
        </group>
    )
}

function BalloonStringInstance({ position, speed, offset }: { position: [number, number, number], speed: number, offset: number }) {
    const ref = useRef<any>(null)
    const [startPos] = useState(() => new THREE.Vector3(...position))
    
    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.elapsedTime
            const yOffset = (time * speed * 0.5) % 15
            const currentY = -5 + yOffset
            
            const swayX = Math.sin(time + offset) * 0.5
            const swayRot = Math.sin(time * 2 + offset) * 0.1
            
            // String is offset by y - 0.7 (0.5 for balloon radius + 0.2 gap/center offset)
            // Balloon center is at Y, string center is at Y - 0.65 roughly
            
            // Applying rotation to string center is tricky if not parented.
            // But simple translation is fine.
            
            ref.current.position.set(
                startPos.x + swayX,
                currentY - 0.65, 
                startPos.z
            )
            ref.current.rotation.set(0, 0, swayRot)
        }
    })

    return <Instance ref={ref} />
}
