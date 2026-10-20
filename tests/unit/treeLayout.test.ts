import { test } from "node:test"
import assert from "node:assert/strict"
import {
  GOLDEN_ANGLE,
  TREE_TIERS,
  TREE_TOP,
  getTreeRadiusAt,
  getTreeSurfacePosition,
} from "../../apps/web/lib/treeLayout.ts"

test("the tree tapers: every tier is narrower than the one below it", () => {
  for (let i = 1; i < TREE_TIERS.length; i++) {
    assert.ok(
      TREE_TIERS[i].radius < TREE_TIERS[i - 1].radius,
      `tier ${i} must be narrower than tier ${i - 1}`,
    )
  }
})

test("the radius falls off linearly inside a tier and is zero outside the foliage", () => {
  const tier = TREE_TIERS[0]
  assert.equal(getTreeRadiusAt(tier.base), tier.radius)
  assert.ok(Math.abs(getTreeRadiusAt(tier.base + tier.height) - 0) < 1e-9)
  // Half way up the tier the radius is half of the base radius.
  const middle = getTreeRadiusAt(tier.base + tier.height / 2)
  assert.ok(Math.abs(middle - tier.radius / 2) < 1e-9)
  // Above the tree and below the first branch there is no foliage.
  assert.equal(getTreeRadiusAt(TREE_TOP + 1), 0)
  assert.equal(getTreeRadiusAt(0), 0)
})

test("a photo on the tree sits just outside the foliage", () => {
  const offset = 0.34
  for (let i = 0; i < 12; i++) {
    const [x, y, z] = getTreeSurfacePosition(i, 12, offset)
    const distanceFromAxis = Math.sqrt(x * x + z * z)
    const surface = getTreeRadiusAt(y)
    assert.ok(surface > 0, `photo ${i} is not on the tree`)
    assert.ok(
      Math.abs(distanceFromAxis - (surface + offset)) < 1e-9,
      `photo ${i} is not ${offset} outside the surface`,
    )
  }
})

test("the photos climb the tree and spread around it", () => {
  let previousY = -Infinity
  const angles = new Set<number>()
  for (let i = 0; i < 10; i++) {
    const [, y] = getTreeSurfacePosition(i, 10)
    assert.ok(y > previousY, `photo ${i} must be higher than the one before it`)
    previousY = y
  }

  // The golden angle keeps the photos from clumping on one side.
  for (let i = 0; i < 10; i++) {
    const [x, , z] = getTreeSurfacePosition(i, 10)
    angles.add(Math.round((Math.atan2(z, x) * 180) / Math.PI))
  }
  assert.ok(angles.size > 4, `the photos are clumped (${angles.size} distinct angles)`)
  assert.ok(GOLDEN_ANGLE > 2 && GOLDEN_ANGLE < 2.5)
})

test("a single photo does not end up on the tip of the tree", () => {
  const [, y] = getTreeSurfacePosition(0, 1)
  assert.ok(y < TREE_TOP, "the only photo must not be at the very top")
  assert.ok(y > 0)
})
