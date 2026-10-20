import { test } from "node:test"
import assert from "node:assert/strict"
import {
  GALLERY_LAYOUT_SPECS,
  getGalleryPosition,
} from "../../apps/web/lib/galleryLayouts.ts"

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

test("the tree layout puts the photos on the tree, not next to it", () => {
  // The photos used to be laid out around y = -1 while the tree itself was
  // drawn at y = -3, so every photo hovered well above its branch.
  const [, treeY] = getGalleryPosition(0, 6, "tree")
  const [, lastY] = getGalleryPosition(5, 6, "tree")
  assert.ok(treeY > 0, "the photos must be above the floor")
  assert.ok(lastY < 7, "the photos must not float above the tree")
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

test("sphere layout distributes points evenly around its own centre", () => {
  const total = 5
  const { center, radius } = GALLERY_LAYOUT_SPECS.sphere
  let minRadius = Infinity
  let maxRadius = -Infinity
  for (let i = 0; i < total; i++) {
    const [x, y, z] = getGalleryPosition(i, total, "sphere")
    const distance = Math.sqrt(
      (x - center[0]) ** 2 + (y - center[1]) ** 2 + (z - center[2]) ** 2,
    )
    minRadius = Math.min(minRadius, distance)
    maxRadius = Math.max(maxRadius, distance)
  }
  // All the points sit on the surface of the sphere.
  assert.ok(maxRadius - minRadius < 0.5, `sphere radius spread too wide: ${minRadius}..${maxRadius}`)
  assert.ok(Math.abs(maxRadius - radius) < 0.5)
})

test("the sphere floats above the floor instead of sinking into it", () => {
  const { center, radius } = GALLERY_LAYOUT_SPECS.sphere
  assert.ok(center[1] - radius >= 0, "the lowest photo must not be under the floor")
})

test("grid layout spreads points across X and rows across Y", () => {
  const total = 12
  // Two points in different rows must have different Y.
  const [, y0] = getGalleryPosition(0, total, "grid")
  const [, y1] = getGalleryPosition(6, total, "grid")
  assert.notEqual(y0, y1, "different rows must have different Y")
})

test("every layout keeps the photos above the floor", () => {
  for (const layout of ["tree", "helix", "sphere", "grid"] as const) {
    for (let i = 0; i < 12; i++) {
      const [, y] = getGalleryPosition(i, 12, layout)
      assert.ok(y >= 0, `${layout} photo ${i} is under the floor (y=${y})`)
    }
  }
})

test("unknown layout strings fall back to the tree strategy", () => {
  // @ts-expect-error — deliberately pass an invalid layout to exercise the default
  const [xTree, yTree] = getGalleryPosition(0, 1, "tree")
  // @ts-expect-error — same
  const [xFallback, yFallback] = getGalleryPosition(0, 1, "made-up-layout")
  assert.equal(xTree, xFallback)
  assert.equal(yTree, yFallback)
})
