import type { Scene, Settings } from '../types/index.ts'

/**
 * Pure helpers for the "first load" flow of the 3D client.
 *
 * The gallery renders inside a WebGL canvas that is fully usable without any
 * data: the tree, the cake, the balloons and the particle effects all run
 * client-side. That means a Supabase outage must never trap the visitor on a
 * loading screen — the scene has to degrade to an empty gallery instead.
 * These helpers encode that decision so it can be unit tested.
 */

/** Human readable message for a failed initial load. */
export function describeLoadError(error: unknown): string {
  if (!error) return 'Unknown error'

  if (typeof error === 'string' && error.trim()) return error

  // PostgREST rejects with a plain `{ message, details, hint, code }` object
  // rather than an Error instance, so the shape has to be probed instead of
  // relying on `instanceof`.
  const candidate = error as { name?: unknown; message?: unknown; cause?: unknown }
  const name = typeof candidate.name === 'string' ? candidate.name : ''
  const message = typeof candidate.message === 'string' ? candidate.message : ''

  const isTimeout = name === 'TimeoutError' || /timed out|timeout/i.test(message)
  if (isTimeout) {
    return 'The photo server did not respond in time. It may be unreachable — please try again.'
  }

  if (message) {
    // Supabase surfaces transport problems as plain `fetch failed`; add a hint
    // because "fetch failed" alone is meaningless to an end user.
    if (/fetch failed|network|ECONNREFUSED|Failed to fetch|Load failed/i.test(message)) {
      return 'Cannot reach the photo server. Please check the backend is running and try again.'
    }
    return message
  }

  if (error instanceof Error && error.message) return error.message

  const cause = candidate.cause
  if (cause && cause !== error) return describeLoadError(cause)

  return 'Unknown error'
}

/**
 * Decide which scene the gallery should open on.
 *
 * Priority:
 *  1. The scene saved as `default_scene_id` in settings (the HUD "Save
 *     Configuration" button writes this column).
 *  2. The first scene returned by the backend.
 *  3. `null` — meaning "All Photos".
 *
 * A `default_scene_id` pointing at a scene that no longer exists (deleted in
 * the admin panel) is ignored rather than producing an empty gallery.
 */
export function resolveInitialSceneId(
  settings: Pick<Settings, 'default_scene_id'> | null | undefined,
  scenes: Pick<Scene, 'id'>[] | null | undefined,
): string | null {
  const sceneIds = new Set((scenes ?? []).map((scene) => scene.id))

  const preferred = settings?.default_scene_id
  if (preferred && sceneIds.has(preferred)) {
    return preferred
  }

  if (sceneIds.size > 0) {
    return scenes?.[0]?.id ?? null
  }

  return null
}
