import type { GalleryLayout } from '@/types'

/**
 * Compute a 3D position for a photo given the current layout strategy.
 * Pure function — no React, no hooks, safe to call inside `useSprings`.
 */
export function getGalleryPosition(
  index: number,
  total: number,
  layout: GalleryLayout,
): [number, number, number] {
  switch (layout) {
    case 'helix': {
      const angle = index * 0.5
      const radius = 6
      const y = index * 0.4 - total * 0.2 + 1
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
    }
    case 'grid': {
      const cols = 6
      const row = Math.floor(index / cols)
      const col = index % cols
      const angle = (col / cols) * Math.PI * 1.5 - Math.PI * 0.75
      const radius = 9
      return [
        Math.sin(angle) * radius,
        row * 1.5 - 2,
        Math.cos(angle) * radius - 6,
      ]
    }
    case 'sphere': {
      const phi = Math.acos(-1 + (2 * index) / total)
      const theta = Math.sqrt(total * Math.PI) * phi
      const r = 6
      return [
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi) + 2,
        r * Math.cos(phi),
      ]
    }
    case 'tree':
    default: {
      const y = 1.5 + (index / total) * 4
      const radius = 2.5 * (1 - (y - 1.5) / 4.5)
      const angle = index * 2.4
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
    }
  }
}
