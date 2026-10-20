// The explicit `.ts` extension keeps this module importable by the Node test
// runner (`node --test --experimental-strip-types`), which does not resolve
// the `@/` alias or extensionless relative paths.
import { CONTENT_HEIGHT, CONTENT_WIDTH, GROUND_Y } from './stage.ts'

/**
 * How the camera has to be placed for a given viewport shape.
 */
export interface CameraFraming {
  /** Distance from the target along the ground plane. */
  distance: number
  /** Vertical field of view, in degrees. */
  fov: number
  /** The point the camera looks at. */
  target: [number, number, number]
  /** The camera's resting position (the rig keeps the user's orbit angle). */
  position: [number, number, number]
}

/** Field of view used on a normal, wide desktop viewport. */
export const BASE_FOV = 45

/** Distance used on a normal, wide desktop viewport. */
export const BASE_DISTANCE = 18

/** How far the camera may ever pull back. */
export const MAX_DISTANCE = 26

/** How far above the target the camera sits. */
const CAMERA_LIFT = 2.0

/**
 * The point the camera always looks at.
 *
 * It sits a little below the middle of the stage on purpose: the tree's
 * base and the presents are on the floor, and the title floats well above
 * the tree. Aiming at the true centre pushed the bottom of the scene
 * behind the control bar.
 */
export const CAMERA_TARGET: [number, number, number] = [0, GROUND_Y + 3.9, 0]

/**
 * Fit the whole stage into the viewport.
 *
 * The scene used to be framed for a 16:9 desktop and simply cropped on a
 * phone: the title ran off the top and the gifts off the bottom. The camera
 * now derives its distance from the viewport's aspect ratio and widens its
 * field of view on narrow screens, so the stage stays complete everywhere.
 *
 * The order matters: the camera pulls back first and only opens the lens
 * up when pulling back is not enough. A wider lens shrinks the subject just
 * as much as backing off does — and it flattens the scene besides — so it
 * is the last resort.
 */
export function getCameraFraming(aspect: number): CameraFraming {
  const safeAspect =
    Number.isFinite(aspect) && aspect > 0 ? Math.min(Math.max(aspect, 0.4), 3) : 16 / 9

  // The vertical field of view, in radians.
  let halfFov = (BASE_FOV * Math.PI) / 360
  let tanHalf = Math.tan(halfFov)

  // Distance needed for the content to fit vertically...
  const distanceForHeight = CONTENT_HEIGHT / 2 / tanHalf
  // ...and horizontally (the horizontal field of view shrinks with the aspect).
  const distanceForWidth = CONTENT_WIDTH / 2 / (tanHalf * safeAspect)

  let distance = Math.min(
    MAX_DISTANCE,
    Math.max(BASE_DISTANCE, distanceForHeight, distanceForWidth),
  )

  // Still too close? Open the lens up instead of backing off further.
  if (distanceForWidth > MAX_DISTANCE) {
    tanHalf = CONTENT_WIDTH / 2 / (safeAspect * MAX_DISTANCE)
    halfFov = Math.atan(tanHalf)
    distance = MAX_DISTANCE
  }

  const fov = (halfFov * 360) / Math.PI

  return {
    distance,
    fov,
    target: CAMERA_TARGET,
    position: [0, CAMERA_TARGET[1] + CAMERA_LIFT, distance],
  }
}
