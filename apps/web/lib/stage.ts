// The explicit `.ts` extension keeps this module importable by the Node test
// runner (`node --test --experimental-strip-types`), which does not resolve
// the `@/` alias or extensionless relative paths.

/**
 * The physical stage the scene is built on.
 *
 * Every mode used to place its props at its own hard-coded offset, and the
 * gallery carried yet another one. The numbers drifted apart: the christmas
 * tree was drawn at `y = -3` while the photos that were supposed to hang on
 * it were laid out around `y = -1`, so every photo hovered a metre and a
 * half above the branch it belonged to.
 *
 * One stage fixes the reference frame:
 *
 *   - `GROUND_Y` is the world-space height of the floor. Everything inside
 *     the stage group is expressed relative to it, so `y = 0` always means
 *     "on the floor".
 *   - `TITLE_Y` is the world-space height of the floating title.
 */

/** World-space Y of the floor the scene stands on. */
export const GROUND_Y = -4.2

/** World-space Y of the floating 3D title. */
export const TITLE_Y = 4.4

/**
 * Height of the title in stage space (the floor is `y = 0`).
 */
export const TITLE_LOCAL_Y = TITLE_Y - GROUND_Y

/**
 * Height of the content the camera has to frame, in world units.
 *
 * Used to pull the camera back on screens that are too small to show the
 * whole stage at once.
 */
export const CONTENT_HEIGHT = 11.5

/**
 * Width of the core content the camera has to frame, in world units.
 *
 * This is the christmas tree, the presents and the cake. The balloons and
 * the grid layout spread much further to either side, but they are
 * background decoration and may spill off the edges.
 */
export const CONTENT_WIDTH = 9
