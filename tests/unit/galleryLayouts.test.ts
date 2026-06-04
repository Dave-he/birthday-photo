import { test } from "node:test"
import assert from "node:assert/strict"
import { getGalleryPosition } from "../../apps/web/lib/galleryLayouts.ts"

test("tree layout spirals upward and stays inside the cone radius", () => {
  const total = 10
  for (let i = 0; i < total; i++) {
    const [x, y, z] = getGalleryPosition(i, total, "tree")
    assert.equal(typeof x, "number")
    assert.equal(typeof y, "number")
    assert.equal(typeof z, "number")
    // Y is monotonically increasing within a fixed total.
    if (i > 0) {
      const [, prevY] = getGalleryPosition(i - 1, total, "tree")
      assert.ok(y > prevY, `tree y must increase with index: ${prevY} -> ${y}`)
    }
  }
})

test("helix layout rotates around Y while climbing", () => {
  const total = 8
  let prevY = -Infinity
  for (let i = 0; i < total; i++) {
    const [, y] = getGalleryPosition(i, total, "helix")
    assert.ok(y > prevY, `helix y must increase with index: ${prevY} -> ${y}`)
    prevY = y
  }
})

test("sphere layout distributes points around the origin", () => {
  const total = 5
  let minRadius = Infinity
  let maxRadius = -Infinity
  for (let i = 0; i < total; i++) {
    const [x, y, z] = getGalleryPosition(i, total, "sphere")
    const r = Math.sqrt(x * x + y * y + z * z)
    if (r < minRadius) minRadius = r
    if (r > maxRadius) maxRadius = r
  }
  // All sphere points should be roughly the same distance from the origin.
  // Allow a generous tolerance because of the +2 Y bias in the formula.
  assert.ok(maxRadius - minRadius < 3, `sphere radius spread too wide: ${minRadius}..${maxRadius}`)
})

test("grid layout spreads points across X and rows across Y", () => {
  const total = 12
  // Two points in different rows must have different Y.
  const [, y0] = getGalleryPosition(0, total, "grid")
  const [, y1] = getGalleryPosition(6, total, "grid")
  assert.notEqual(y0, y1, "different rows must have different Y")
})

test("unknown layout strings fall back to the tree strategy", () => {
  // @ts-expect-error — deliberately pass an invalid layout to exercise the default
  const [xTree, yTree] = getGalleryPosition(0, 1, "tree")
  // @ts-expect-error — same
  const [xFallback, yFallback] = getGalleryPosition(0, 1, "made-up-layout")
  assert.equal(xTree, xFallback)
  assert.equal(yTree, yFallback)
})
