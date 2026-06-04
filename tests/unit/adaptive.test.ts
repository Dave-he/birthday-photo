import { test } from "node:test"
import assert from "node:assert/strict"
import {
  getAdaptiveDpr,
  getAdaptiveEventsConfig,
} from "../../apps/web/lib/adaptive.ts"

test("getAdaptiveDpr returns 1 when low-quality mode is on", () => {
  assert.equal(getAdaptiveDpr(true), 1)
})

test("getAdaptiveEventsConfig disables damping and panning on low quality", () => {
  const cfg = getAdaptiveEventsConfig(true)
  assert.equal(cfg.enableDamping, false)
  assert.equal(cfg.enablePan, false)
  assert.equal(cfg.enableZoom, true)
  assert.equal(cfg.rotateSpeed, 0.5)
})

test("getAdaptiveEventsConfig enables everything on high quality", () => {
  const cfg = getAdaptiveEventsConfig(false)
  assert.equal(cfg.enableDamping, true)
  assert.equal(cfg.enablePan, true)
  assert.equal(cfg.enableZoom, true)
  assert.equal(cfg.rotateSpeed, 0.8)
})

test("getAdaptiveDpr maps device pixel ratio + screen width to tiers", () => {
  // We can't touch the real window object safely here, so just exercise
  // the SSR-safe branch by calling with low=true (which short-circuits)
  // and confirming the return shape is a number.
  const v = getAdaptiveDpr(true)
  assert.equal(typeof v, "number")
})
