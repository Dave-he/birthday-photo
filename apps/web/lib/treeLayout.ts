// The explicit `.ts` extension keeps this module importable by the Node test
// runner (`node --test --experimental-strip-types`), which does not resolve
// the `@/` alias or extensionless relative paths.

/**
 * The christmas tree's geometry.
 *
 * The tree mesh and the photo gallery must agree on where the tree's surface
 * is, otherwise the photos float next to the tree instead of hanging on it.
 * Both read this module, so the two can never drift apart again.
 *
 * All coordinates are tree-local: `y = 0` is the floor, `y` grows upwards.
 */

/** One cone tier of the tree. */
export interface TreeTier {
  /** Height of the tier's base. */
  base: number
  /** Height of the tier. */
  height: number
  /** Radius of the tier at its base. */
  radius: number
}

/** Height of the trunk, from the floor to the first tier. */
export const TREE_TRUNK_HEIGHT = 0.9

/** The cone tiers, bottom to top. */
export const TREE_TIERS: readonly TreeTier[] = [
  { base: 0.9, height: 3.0, radius: 2.6 },
  { base: 3.0, height: 2.5, radius: 2.1 },
  { base: 4.6, height: 2.2, radius: 1.6 },
]

/** Height of the top of the uppermost tier. */
export const TREE_TOP =
  TREE_TIERS[TREE_TIERS.length - 1].base + TREE_TIERS[TREE_TIERS.length - 1].height

/** Height of the star that sits on top of the tree. */
export const TREE_STAR_Y = TREE_TOP + 0.4

/**
 * The golden angle.
 *
 * Successive rotations by this angle spread points evenly around a cone
 * instead of clumping them, which is what the tree lights and the hanging
 * photos both rely on.
 */
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Radius of the tree's surface at a given height.
 *
 * Returns 0 above the top tier and below the first one, where the tree has
 * no foliage.
 */
export function getTreeRadiusAt(y: number): number {
  for (const tier of TREE_TIERS) {
    if (y >= tier.base && y <= tier.base + tier.height) {
      return tier.radius * (1 - (y - tier.base) / tier.height)
    }
  }
  return 0
}

/**
 * A point on (or just outside) the tree's surface.
 *
 * `radialOffset` pushes the point outwards from the axis, which is how the
 * photo ornaments end up resting *on* the branches instead of inside them.
 */
export function getTreeSurfacePosition(
  index: number,
  total: number,
  radialOffset = 0.34,
): [number, number, number] {
  const count = Math.max(1, total)
  // A single photo sits in the middle of the tree instead of at its tip.
  const t = count === 1 ? 0.45 : index / (count - 1)
  const bottom = TREE_TRUNK_HEIGHT + 0.35
  const top = TREE_TOP - 0.85
  const y = bottom + t * (top - bottom)
  const radius = getTreeRadiusAt(y) + radialOffset
  const angle = index * GOLDEN_ANGLE
  return [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
}
