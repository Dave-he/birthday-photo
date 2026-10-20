'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'

interface AdaptiveQualityProps {
  /** Lowest device pixel ratio the renderer may drop to. */
  min: number
  /** Highest device pixel ratio the renderer may use. */
  max: number
  /** Called when the machine cannot keep up even at the lowest quality. */
  onFallback?: () => void
}

/**
 * Keeps the render resolution in step with what the machine can actually
 * do.
 *
 * The scene used to pick one fixed device pixel ratio up front, based on
 * the screen's reported ratio, and then only react to a catastrophic
 * collapse. This measures the real frame rate and moves the pixel ratio
 * with it: a fast machine renders crisply, a slow one renders smaller
 * instead of stuttering.
 */
export default function AdaptiveQuality({ min, max, onFallback }: AdaptiveQualityProps) {
  const setDpr = useThree((state) => state.setDpr)
  const current = useRef(max)

  useEffect(() => {
    current.current = max
    setDpr(max)
  }, [max, setDpr])

  return (
    <PerformanceMonitor
      // 45 fps is the point where the motion starts to look choppy.
      bounds={() => [45, 60]}
      flipflops={3}
      onChange={({ factor }) => {
        const next = min + (max - min) * factor
        if (Math.abs(next - current.current) > 0.05) {
          current.current = next
          setDpr(next)
        }
      }}
      onFallback={onFallback}
    />
  )
}
