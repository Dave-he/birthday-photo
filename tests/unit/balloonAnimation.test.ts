import { test } from "node:test"
import assert from "node:assert/strict"
import { animateBalloon } from "../../apps/web/lib/balloonAnimation.ts"

const start = { x: 1.2, y: 0, z: -0.4 }

test("animateBalloon places the body at start.x plus a sin sway", () => {
  const { x, y, z, rotZ } = animateBalloon(0, { startPos: start, speed: 1, offset: 0 })
  // sin(0) = 0 → no horizontal sway
  assert.equal(x, 1.2)
  assert.equal(y, -5) // (0 * 1 * 0.5) % 15 == 0
  assert.equal(z, -0.4)
  // sin(0) = 0 → no roll
  assert.equal(rotZ, 0)
})

test("animateBalloon Y wraps every 30 / speed seconds", () => {
  // yRange = (t * speed * 0.5) % 15
  // For speed=1: yRange wraps at t=30.
  const atZero = { x: 0, y: 0, z: 0 }
  const wrap = animateBalloon(30, { startPos: atZero, speed: 1, offset: 0 })
  const t0 = animateBalloon(0, { startPos: atZero, speed: 1, offset: 0 })
  assert.equal(wrap.y, t0.y, "y should be the same at t=0 and t=30 for speed=1")
})

test("animateBalloon string lags 0.65 units behind the body when yOffset is -0.65", () => {
  const t = 2.0
  const speed = 0.8
  const offset = 1.5
  const atZero = { x: 0, y: 0, z: 0 }
  const body = animateBalloon(t, { startPos: atZero, speed, offset })
  const string = animateBalloon(t, { startPos: atZero, speed, offset, yOffset: -0.65 })
  assert.equal(string.x, body.x)
  assert.equal(string.z, body.z)
  assert.equal(string.rotZ, body.rotZ)
  assert.equal(string.y, body.y - 0.65)
})
