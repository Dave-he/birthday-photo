import { test } from "node:test"
import assert from "node:assert/strict"
import { PALETTES, getSceneTitle } from "../../apps/web/lib/palettes.ts"

test("PALETTES has an entry for every scene mode", () => {
  const required: Array<keyof typeof PALETTES> = ["christmas", "birthday", "romantic", "party"]
  for (const mode of required) {
    assert.ok(PALETTES[mode], `PALETTES missing entry for ${mode}`)
    const p = PALETTES[mode]
    assert.equal(p.bg.length, 2, `${mode}.bg must be a 2-stop gradient`)
    assert.ok(p.fog.startsWith("#"), `${mode}.fog must be a hex string`)
    assert.ok(p.accent.startsWith("#"), `${mode}.accent must be a hex string`)
    assert.ok(p.text.startsWith("#"), `${mode}.text must be a hex string`)
  }
})

test("getSceneTitle prefers the active scene name when one matches", () => {
  const title = getSceneTitle(
    "birthday",
    [{ id: "scene-1", name: "Alice's 30th", description: "" }],
    "scene-1",
    null,
  )
  assert.equal(title, "Alice's 30th")
})

test("getSceneTitle falls back to mode-specific default when no scene is active", () => {
  assert.equal(getSceneTitle("birthday", [], null, null), "Happy Birthday!")
  assert.equal(getSceneTitle("romantic", [], null, null), "Forever Love")
  assert.equal(getSceneTitle("party", [], null, null), "Let's Party!")
})

test("getSceneTitle uses greeting_title only as a last resort and only for christmas", () => {
  // Non-christmas modes ignore greeting_title completely.
  assert.equal(
    getSceneTitle("birthday", [], null, { greeting_title: "ignored" }),
    "Happy Birthday!",
  )
  // Christmas prefers the scene name, then the greeting, then the default.
  assert.equal(
    getSceneTitle("christmas", [], null, { greeting_title: "Happy Holidays!" }),
    "Happy Holidays!",
  )
  assert.equal(getSceneTitle("christmas", [], null, null), "Merry Christmas!")
})

test("getSceneTitle ignores scenes whose id does not match", () => {
  const title = getSceneTitle(
    "party",
    [{ id: "scene-1", name: "Wrong Scene", description: "" }],
    "scene-999",
    null,
  )
  assert.equal(title, "Let's Party!")
})
