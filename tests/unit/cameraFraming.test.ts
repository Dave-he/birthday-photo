import { test } from "node:test"
import assert from "node:assert/strict"
import { getCameraFraming, BASE_DISTANCE, BASE_FOV } from "../../apps/web/lib/cameraFraming.ts"
import { CONTENT_HEIGHT, CONTENT_WIDTH, GROUND_Y } from "../../apps/web/lib/stage.ts"

const DEG = Math.PI / 180

/** The half-height of the frustum at the target plane, for a given framing. */
function visibleHeight(distance: number, fov: number): number {
  return 2 * distance * Math.tan((fov * DEG) / 2)
}

/** The full width of the frustum at the target plane, for a given aspect. */
function visibleWidth(distance: number, fov: number, aspect: number): number {
  const halfFov = (fov * DEG) / 2
  return 2 * distance * Math.tan(halfFov) * aspect
}

test("a wide desktop viewport uses the base distance and field of view", () => {
  const framing = getCameraFraming(16 / 9)
  assert.equal(framing.distance, BASE_DISTANCE)
  assert.equal(framing.fov, BASE_FOV)
})

test("the camera always looks at the middle of the stage", () => {
  const framing = getCameraFraming(16 / 9)
  assert.deepEqual(framing.target, [0, GROUND_Y + 3.9, 0])
  // The target has to sit between the floor and the title, otherwise the
  // bottom of the scene disappears behind the control bar.
  assert.ok(framing.target[1] > GROUND_Y)
})

test("a narrow viewport still fits the stage horizontally", () => {
  const narrow = getCameraFraming(0.5)
  assert.ok(
    visibleWidth(narrow.distance, narrow.fov, 0.5) >= CONTENT_WIDTH - 1e-6,
    "the stage must still fit horizontally on a portrait screen",
  )
})

test("the subject stays large enough to look at on every screen", () => {
  // Opening the lens up shrinks the subject just as much as backing off
  // does, so the framing has to keep the content filling a good part of
  // the frame — otherwise the scene is a tiny speck in the middle of an
  // empty screen.
  for (const aspect of [0.4, 0.56, 0.75, 1, 1.78, 2.4]) {
    const framing = getCameraFraming(aspect)
    const height = visibleHeight(framing.distance, framing.fov)
    const fill = CONTENT_HEIGHT / height
    assert.ok(fill > 0.45, `aspect ${aspect}: the content only fills ${(fill * 100).toFixed(0)}%`)
    assert.ok(fill <= 1.001, `aspect ${aspect}: the content does not fit`)
  }
})

test("the whole stage fits in the frame at every viewport shape", () => {
  for (const aspect of [0.4, 0.56, 0.75, 1, 1.33, 1.78, 2.4, 3]) {
    const framing = getCameraFraming(aspect)
    const height = visibleHeight(framing.distance, framing.fov)
    const width = visibleWidth(framing.distance, framing.fov, aspect)
    // A small tolerance: the framing solves for exactly this size, so
    // floating point lands a hair below it.
    const epsilon = 1e-6
    assert.ok(
      height >= CONTENT_HEIGHT - epsilon,
      `aspect ${aspect}: visible height ${height.toFixed(2)} < ${CONTENT_HEIGHT}`,
    )
    assert.ok(
      width >= CONTENT_WIDTH - epsilon,
      `aspect ${aspect}: visible width ${width.toFixed(2)} < ${CONTENT_WIDTH}`,
    )
  }
})

test("a broken aspect ratio does not produce NaN", () => {
  for (const aspect of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    const framing = getCameraFraming(aspect)
    assert.ok(Number.isFinite(framing.distance), `distance for aspect ${aspect}`)
    assert.ok(Number.isFinite(framing.fov), `fov for aspect ${aspect}`)
    assert.ok(framing.distance > 0)
  }
})

test("the camera never gets absurdly close or far away", () => {
  for (const aspect of [0.3, 1, 4]) {
    const framing = getCameraFraming(aspect)
    assert.ok(framing.distance >= 5 && framing.distance <= 30, `distance for aspect ${aspect}`)
    assert.ok(framing.fov >= 40 && framing.fov <= 80, `fov for aspect ${aspect}`)
  }
})
