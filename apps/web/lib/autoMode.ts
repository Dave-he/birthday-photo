// The explicit `.ts` extension keeps this module importable by the Node test
// runner (`node --test --experimental-strip-types`), which does not resolve
// the `@/` alias or extensionless relative paths.
import { GALLERY_LAYOUTS, SCENE_MODES, type GalleryLayout, type SceneMode } from '../types/index.ts'

export interface CycleState {
  mode: SceneMode
  layout: GalleryLayout
}

/**
 * Pick the next mode/layout pair of the auto-cycle.
 *
 * The result is derived from the *current* state rather than from a private
 * counter, so a scene that was restored from `settings.default_mode` continues
 * the cycle from where it actually is instead of snapping back to the first
 * entry of the list.
 *
 * Christmas always uses the `tree` layout — the other layouts are meant for
 * the non-seasonal scenes.
 */
export function getNextCycleState(currentMode: SceneMode, currentLayout: GalleryLayout): CycleState {
  const modeIndex = SCENE_MODES.indexOf(currentMode)
  const nextIndex = (modeIndex + 1) % SCENE_MODES.length
  const mode = SCENE_MODES[nextIndex] ?? SCENE_MODES[0]

  if (mode === 'christmas') {
    return { mode, layout: 'tree' }
  }

  const layoutIndex = GALLERY_LAYOUTS.indexOf(currentLayout)
  const nextLayoutIndex = (layoutIndex + 1) % GALLERY_LAYOUTS.length
  const layout = GALLERY_LAYOUTS[nextLayoutIndex] ?? GALLERY_LAYOUTS[0]

  return { mode, layout }
}

/**
 * Validate a persisted `default_mode` / `default_layout` pair coming from the
 * database. Unknown values are ignored so a typo in the admin panel can never
 * break the 3D client.
 */
export function resolveSavedVisuals(settings: {
  default_mode?: string | null
  default_layout?: string | null
}): { mode: SceneMode | null; layout: GalleryLayout | null } {
  const mode = SCENE_MODES.includes(settings.default_mode as SceneMode)
    ? (settings.default_mode as SceneMode)
    : null
  const layout = GALLERY_LAYOUTS.includes(settings.default_layout as GalleryLayout)
    ? (settings.default_layout as GalleryLayout)
    : null
  return { mode, layout }
}
