'use client'

import { useEffect, useState } from 'react'

/**
 * Whether the visitor asked the system to reduce motion.
 *
 * The scene is almost entirely animation: a rotating camera, floating
 * ornaments, rising balloons, a spinning tree. That is exactly what
 * `prefers-reduced-motion: reduce` is about, and the setting was previously
 * ignored entirely.
 *
 * The value is read on the client and defaults to "no preference" so the
 * server-rendered markup matches the first client render.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    // Safari < 14 only has the deprecated listener API.
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    }
    query.addListener(onChange)
    return () => query.removeListener(onChange)
  }, [])

  return reduced
}
