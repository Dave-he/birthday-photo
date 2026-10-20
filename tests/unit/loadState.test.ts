import { test } from "node:test"
import assert from "node:assert/strict"
import { describeLoadError, resolveInitialSceneId } from "../../apps/web/lib/loadState.ts"

test("describeLoadError explains a transport failure in plain language", () => {
  const message = describeLoadError(new Error("fetch failed"))
  assert.match(message, /Cannot reach the photo server/i)
  assert.doesNotMatch(message, /fetch failed/)
})

test("describeLoadError keeps an unexpected error message intact", () => {
  assert.equal(describeLoadError(new Error("row level security violation")), "row level security violation")
})

test("describeLoadError reads the PostgREST error shape (a plain object, not an Error)", () => {
  // PostgREST rejects with `{ message, details, hint, code }` — a plain
  // object. `instanceof Error` is false here.
  const postgrestError = {
    message: "TimeoutError: Supabase request timed out",
    details: "",
    hint: "",
    code: "",
  }
  const message = describeLoadError(postgrestError)
  assert.match(message, /did not respond in time/i)
})

test("describeLoadError explains a network failure in a plain object shape", () => {
  assert.match(
    describeLoadError({ message: "TypeError: Failed to fetch" }),
    /Cannot reach the photo server/i,
  )
})

test("describeLoadError unwraps a nested cause", () => {
  const message = describeLoadError({ cause: new Error("socket hang up") })
  assert.equal(message, "socket hang up")
})

test("describeLoadError handles strings and unknown values", () => {
  assert.equal(describeLoadError("boom"), "boom")
  assert.equal(describeLoadError(undefined), "Unknown error")
  assert.equal(describeLoadError(null), "Unknown error")
  assert.equal(describeLoadError({ weird: true }), "Unknown error")
})

test("resolveInitialSceneId prefers the saved default scene", () => {
  const scenes = [{ id: "scene-1" }, { id: "scene-2" }]
  assert.equal(
    resolveInitialSceneId({ default_scene_id: "scene-2" }, scenes),
    "scene-2",
  )
})

test("resolveInitialSceneId falls back to the first scene when no default is saved", () => {
  const scenes = [{ id: "scene-1" }, { id: "scene-2" }]
  assert.equal(resolveInitialSceneId({ default_scene_id: null }, scenes), "scene-1")
  assert.equal(resolveInitialSceneId({}, scenes), "scene-1")
  assert.equal(resolveInitialSceneId(null, scenes), "scene-1")
})

test("resolveInitialSceneId ignores a default scene that no longer exists", () => {
  const scenes = [{ id: "scene-1" }]
  // The scene was deleted in the admin panel — fall back instead of showing
  // an empty gallery.
  assert.equal(
    resolveInitialSceneId({ default_scene_id: "deleted-scene" }, scenes),
    "scene-1",
  )
})

test("resolveInitialSceneId returns null when there is nothing to show", () => {
  assert.equal(resolveInitialSceneId({ default_scene_id: "scene-1" }, []), null)
  assert.equal(resolveInitialSceneId(null, []), null)
  assert.equal(resolveInitialSceneId(null, null), null)
})
