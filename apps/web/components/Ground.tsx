'use client'

import { useLocalTexture } from '@/hooks/useLocalTexture'
import { GROUND_TEXTURE_URL } from '@/lib/assets'

interface GroundProps {
    /** Tint of the floor. */
    color?: string
    /** Radius of the floor disc, in world units. */
    radius?: number
    /** Whether the floor catches the key light's shadow. */
    receiveShadow?: boolean
}

/**
 * The floor the scene stands on.
 *
 * Without it the tree, the gifts and the cake all floated in a black void
 * and the key light's shadow map had nothing to land on. The disc fades out
 * radially so it dissolves into the fog instead of ending in a hard edge.
 */
export default function Ground({
    color = '#16233b',
    radius = 34,
    receiveShadow = true,
}: GroundProps) {
    const texture = useLocalTexture(GROUND_TEXTURE_URL)

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={receiveShadow}>
            <circleGeometry args={[radius, 64]} />
            <meshStandardMaterial
                map={texture ?? undefined}
                color={color}
                transparent
                depthWrite={false}
                roughness={0.95}
                metalness={0}
                envMapIntensity={0.4}
            />
        </mesh>
    )
}
