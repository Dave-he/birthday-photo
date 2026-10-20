'use client'

import { useEffect, useState } from 'react'
import * as THREE from 'three'

/**
 * Load a texture from our own origin without suspending.
 *
 * `useTexture` suspends the whole `<Suspense>` boundary until the file
 * arrives, and it never reports a failure — a missing asset therefore
 * blanks the scene instead of degrading. For the handful of small, local
 * textures the scene needs (the floor, the star glow) a plain loader is
 * better: the component renders immediately and the texture fades in.
 */
export function useLocalTexture(url: string, srgb = true): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let mounted = true
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')

    loader.load(
      url,
      (loaded) => {
        if (srgb) loaded.colorSpace = THREE.SRGBColorSpace
        loaded.needsUpdate = true
        if (mounted) setTexture(loaded)
      },
      undefined,
      (error) => {
        // A missing decoration is not worth breaking the scene over.
        console.warn(`Could not load the local texture "${url}"`, error)
      },
    )

    return () => {
      mounted = false
    }
  }, [url, srgb])

  return texture
}
