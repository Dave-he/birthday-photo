// The explicit `.ts` extension keeps this module importable by the Node test
// runner (`node --test --experimental-strip-types`), which does not resolve
// the `@/` alias or extensionless relative paths.
import type { GalleryLayout } from '../types/index.ts'
import { getTreeSurfacePosition } from './treeLayout.ts'

/**
 * Where a layout lives on the stage.
 *
 * `center` is the middle of the volume the photos are spread through and
 * `radius` its size. The camera and the tests both need to know where the
 * content is, so the numbers live here instead of being spread over the
 * individual formulas.
 */
export interface GalleryLayoutSpec {
  /** Centre of the layout, in stage space (the floor is `y = 0`). */
  center: [number, number, number]
  /** Radius of the volume the photos are spread through. */
  radius: number
}

export const GALLERY_LAYOUT_SPECS: Record<GalleryLayout, GalleryLayoutSpec> = {
  // The photos hang on the christmas tree.
  tree: { center: [0, 3.5, 0], radius: 2.6 },
  // A spiral of photos climbing through the air.
  helix: { center: [0, 3.7, 0], radius: 5.5 },
  // A balloon of photos floating above the stage.
  sphere: { center: [0, 4.2, 0], radius: 4.0 },
  // A curved wall of photos behind the stage.
  grid: { center: [0, 3.2, 0], radius: 8.0 },
}

/**
 * Compute a 3D position for a photo given the current layout strategy.
 *
 * Positions are returned in stage space: the floor is `y = 0` and the
 * christmas tree's base sits at the origin.
 *
 * Pure function — no React, no hooks, safe to call inside `useSprings`.
 */
export function getGalleryPosition(
  index: number,
  total: number,
  layout: GalleryLayout,
): [number, number, number] {
  const count = Math.max(1, total)
  switch (layout) {
    case 'helix': {
      // A spiral that climbs: every photo is a step higher and further round.
      const angle = index * 0.55
      const radius = GALLERY_LAYOUT_SPECS.helix.radius
      const t = count === 1 ? 0.5 : index / (count - 1)
      const y = 0.8 + t * 5.8
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
    }
    case 'grid': {
      // A shallow arc of rows, like a photo wall behind the stage.
      const cols = 6
      const row = Math.floor(index / cols)
      const col = index % cols
      const angle = (col / cols) * Math.PI * 1.5 - Math.PI * 0.75
      const radius = GALLERY_LAYOUT_SPECS.grid.radius
      return [
        Math.sin(angle) * radius,
        0.9 + row * 1.45,
        Math.cos(angle) * radius - 7,
      ]
    }
    case 'sphere': {
      // Evenly distributed points on a sphere (the Fibonacci spiral).
      const { center, radius } = GALLERY_LAYOUT_SPECS.sphere
      const phi = Math.acos(-1 + (2 * index) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      return [
        center[0] + radius * Math.cos(theta) * Math.sin(phi),
        center[1] + radius * Math.sin(theta) * Math.sin(phi),
        center[2] + radius * Math.cos(phi),
      ]
    }
    case 'tree':
    default: {
      // Straight onto the branches of the christmas tree.
      return getTreeSurfacePosition(index, count)
    }
  }
}
