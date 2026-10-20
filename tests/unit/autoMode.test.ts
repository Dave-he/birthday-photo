import { test } from "node:test"
import assert from "node:assert/strict"
import { getNextCycleState, resolveSavedVisuals } from "../../apps/web/lib/autoMode.ts"
import { GALLERY_LAYOUTS, SCENE_MODES } from "../../apps/web/types/index.ts"

test("the cycle advances to the next scene mode", () => {
  assert.equal(getNextCycleState("christmas", "tree").mode, "birthday")
  assert.equal(getNextCycleState("birthday", "tree").mode, "romantic")
  assert.equal(getNextCycleState("romantic", "tree").mode, "party")
})

test("the cycle wraps around after the last mode", () => {
  assert.equal(getNextCycleState("party", "grid").mode, "christmas")
})

test("christmas always uses the tree layout", () => {
  const next = getNextCycleState("party", "grid")
  assert.equal(next.mode, "christmas")
  assert.equal(next.layout, "tree")
})

test("non-christmas modes rotate through the layouts", () => {
  // birthday follows party -> the layout advances from the current one
  const first = getNextCycleState("party", "tree")
  assert.equal(first.mode, "christmas")
  assert.equal(first.layout, "tree")

  const second = getNextCycleState("birthday", "tree")
  assert.equal(second.mode, "romantic")
  assert.equal(second.layout, GALLERY_LAYOUTS[1])

  const third = getNextCycleState("romantic", GALLERY_LAYOUTS[GALLERY_LAYOUTS.length - 1])
  assert.equal(third.mode, "party")
  // The layout wraps around to the first entry.
  assert.equal(third.layout, GALLERY_LAYOUTS[0])
})

test("the cycle never leaves the known mode / layout sets", () => {
  for (const mode of SCENE_MODES) {
    for (const layout of GALLERY_LAYOUTS) {
      const next = getNextCycleState(mode, layout)
      assert.ok(SCENE_MODES.includes(next.mode), `unknown mode ${next.mode}`)
      assert.ok(GALLERY_LAYOUTS.includes(next.layout), `unknown layout ${next.layout}`)
    }
  }
})

test("resolveSavedVisuals accepts known values", () => {
  assert.deepEqual(
    resolveSavedVisuals({ default_mode: "romantic", default_layout: "helix" }),
    { mode: "romantic", layout: "helix" },
  )
})

test("resolveSavedVisuals rejects unknown values instead of breaking the client", () => {
  assert.deepEqual(
    resolveSavedVisuals({ default_mode: "halloween", default_layout: "spiral" }),
    { mode: null, layout: null },
  )
  assert.deepEqual(
    resolveSavedVisuals({ default_mode: null, default_layout: null }),
    { mode: null, layout: null },
  )
})
