import { test } from "node:test"
import assert from "node:assert/strict"
import { getSceneQuality } from "../../apps/web/lib/sceneQuality.ts"

const base = { isLow: false, particleMultiplier: 1, snowDensity: 300, reducedMotion: false }

test("the quality tier follows the particle multiplier", () => {
  assert.equal(getSceneQuality({ ...base, particleMultiplier: 0.2 }).tier, "low")
  assert.equal(getSceneQuality({ ...base, particleMultiplier: 0.5 }).tier, "low")
  assert.equal(getSceneQuality({ ...base, particleMultiplier: 1 }).tier, "medium")
  assert.equal(getSceneQuality({ ...base, particleMultiplier: 2 }).tier, "high")
})

test("low quality mode forces the low tier even with a high multiplier", () => {
  const quality = getSceneQuality({ ...base, isLow: true, particleMultiplier: 2 })
  assert.equal(quality.tier, "low")
  assert.equal(quality.shadows, false)
})

test("the particle counts scale with the multiplier", () => {
  const low = getSceneQuality({ ...base, particleMultiplier: 0.5 })
  const high = getSceneQuality({ ...base, particleMultiplier: 2 })
  assert.ok(high.magicParticleCount > low.magicParticleCount)
  assert.ok(high.balloonCount > low.balloonCount)
  assert.ok(high.fireworkCount > low.fireworkCount)
  assert.ok(high.snowCount > low.snowCount)
})

test("the particle counts stay inside sane bounds", () => {
  for (const multiplier of [0.1, 0.5, 1, 1.5, 2]) {
    const quality = getSceneQuality({ ...base, particleMultiplier: multiplier })
    assert.ok(quality.magicParticleCount >= 1, `magic particles at ${multiplier}`)
    assert.ok(quality.balloonCount <= 80, `balloons at ${multiplier}`)
    assert.ok(quality.fireworkCount <= 32, `fireworks at ${multiplier}`)
    assert.ok(quality.snowCount <= 6000, `snow at ${multiplier}`)
  }
})

test("a bad multiplier or density cannot produce NaN counts", () => {
  const quality = getSceneQuality({
    ...base,
    particleMultiplier: Number.NaN,
    snowDensity: Number.NaN,
  })
  for (const value of [quality.magicParticleCount, quality.snowCount, quality.balloonCount]) {
    assert.ok(Number.isFinite(value), `expected a finite count, got ${value}`)
  }
})

test("low quality turns the expensive extras off", () => {
  const low = getSceneQuality({ ...base, isLow: true })
  assert.equal(low.cloud.enabled, false)
  assert.equal(low.shadows, false)
  assert.equal(low.dpr[1], 1)
  assert.ok(low.starCount < 6000)
  assert.ok(low.treeLightCount < 72)
})

test("high quality enables shadows and the clouds", () => {
  const high = getSceneQuality({ ...base, particleMultiplier: 2 })
  assert.equal(high.shadows, true)
  assert.equal(high.cloud.enabled, true)
  assert.ok(high.dpr[1] >= 2)
})

test("reduced motion switches the automatic camera rotation off", () => {
  assert.equal(getSceneQuality({ ...base, reducedMotion: true }).autoRotate, false)
  assert.equal(getSceneQuality({ ...base, reducedMotion: false }).autoRotate, true)
})

test("the cloud volume stays small enough not to swallow the scene", () => {
  // drei scales every puff by its volume; the default of 6 produced clouds
  // ten times the size of the tree.
  for (const multiplier of [0.5, 1, 2]) {
    const quality = getSceneQuality({ ...base, particleMultiplier: multiplier })
    assert.ok(quality.cloud.volume <= 2, `cloud volume at ${multiplier}`)
  }
})
