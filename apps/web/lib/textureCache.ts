'use client'

import * as THREE from 'three'
import { ResourceCache } from '@/lib/resourceCache'
import { PLACEHOLDER_TEXTURE_URL } from '@/lib/assets'

/**
 * Shared photo textures.
 *
 * Every ornament used to load its own copy of the photo: the same URL was
 * fetched once per ornament (a gallery of twelve photos meant twelve
 * downloads of the same files) and the textures were never disposed, so the
 * GPU memory grew for as long as the page was open.
 *
 * The cache hands out one texture per URL, reference-counts it and disposes
 * it once the last ornament using it is gone.
 */
const cache = new ResourceCache<THREE.Texture>()

/** In-flight loads, so concurrent ornaments share a single request. */
const pending = new Map<string, Promise<THREE.Texture>>()

/**
 * Textures already configured for correct colour space and filtering.
 *
 * Photos are sRGB encoded. Without this the renderer treats them as linear
 * data and the whole gallery looks washed out and too dark.
 */
function prepare(texture: THREE.Texture, renderer?: THREE.WebGLRenderer): THREE.Texture {
  texture.colorSpace = THREE.SRGBColorSpace
  if (renderer) {
    // Keeps the photos sharp when an ornament is viewed at an angle.
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  }
  texture.needsUpdate = true
  return texture
}

function loadWith(
  url: string,
  renderer?: THREE.WebGLRenderer,
): Promise<THREE.Texture> {
  const existing = pending.get(url)
  if (existing) return existing

  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')

  const promise = new Promise<THREE.Texture>((resolve) => {
    loader.load(
      url,
      (texture) => resolve(prepare(texture, renderer)),
      undefined,
      () => {
        // Self-hosted placeholder: a remote fallback would fail exactly when
        // the network is the problem, leaving the ornament blank.
        loader.load(
          PLACEHOLDER_TEXTURE_URL,
          (texture) => resolve(prepare(texture, renderer)),
          undefined,
          () => resolve(prepare(new THREE.Texture(), renderer)),
        )
      },
    )
  }).finally(() => {
    pending.delete(url)
  })

  pending.set(url, promise)
  return promise
}

/**
 * Acquire the shared texture for a photo.
 *
 * The caller owns one reference and must call `releasePhotoTexture` for the
 * same URL when it is done with it.
 */
export async function acquirePhotoTexture(
  url: string,
  renderer?: THREE.WebGLRenderer,
): Promise<THREE.Texture> {
  return cache.acquire(url, () => loadWith(url, renderer))
}

/** Release one use of a photo texture. */
export function releasePhotoTexture(url: string): void {
  cache.release(url, (texture) => texture.dispose())
}

/** Number of photo textures currently held in GPU memory. */
export function getPhotoTextureCount(): number {
  return cache.size
}
