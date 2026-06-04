export interface BalloonAnimationParams {
  /** Initial spawn position. Only `x` and `z` are read; Y is animated. */
  startPos: { x: number; y: number; z: number }
  speed: number
  offset: number
  /**
   * Static Y offset added to the result, used by the string renderer to
   * place the string 0.65 units below the balloon body. Defaults to 0.
   */
  yOffset?: number
}

export interface BalloonTransform {
  x: number
  y: number
  z: number
  rotZ: number
}

/**
 * Pure computation of a balloon's current world transform at `time` seconds.
 *
 * Kept in a `.ts` (not `.tsx`) module so it can be unit-tested with
 * `node --test --experimental-strip-types` without pulling in a JSX runner.
 */
export function animateBalloon(time: number, params: BalloonAnimationParams): BalloonTransform {
  const { startPos, speed, offset, yOffset = 0 } = params
  const yRange = (time * speed * 0.5) % 15
  const y = -5 + yRange + yOffset
  const x = startPos.x + Math.sin(time + offset) * 0.5
  const z = startPos.z
  const rotZ = Math.sin(time * 2 + offset) * 0.1
  return { x, y, z, rotZ }
}
