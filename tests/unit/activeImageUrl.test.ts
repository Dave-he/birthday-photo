import { test } from "node:test"
import assert from "node:assert/strict"
import { getActiveImageUrl } from "../../apps/web/lib/activeImageUrl.ts"

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL

test.after(() => {
  // Restore the env so other test files / processes see the same state.
  if (ORIGINAL_ENV === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_ENV
  }
})

test("returns empty string for null / undefined / empty input", () => {
  assert.equal(getActiveImageUrl(undefined), "")
  assert.equal(getActiveImageUrl(null), "")
  assert.equal(getActiveImageUrl(""), "")
})

test("returns the original URL when it does not target a local Supabase", () => {
  const url = "https://cdn.example.com/photo.jpg"
  assert.equal(getActiveImageUrl(url), url)
})

test("rewrites localhost:54321 URLs to the active Supabase URL", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://active.supabase.co"
  const result = getActiveImageUrl("http://localhost:54321/storage/v1/photo.jpg")
  assert.equal(result, "https://active.supabase.co/storage/v1/photo.jpg")
})

test("rewrites 127.0.0.1:54321 URLs to the active Supabase URL", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://active.supabase.co"
  const result = getActiveImageUrl("http://127.0.0.1:54321/storage/v1/photo.jpg")
  assert.equal(result, "https://active.supabase.co/storage/v1/photo.jpg")
})

test("leaves localhost URLs alone when NEXT_PUBLIC_SUPABASE_URL is unset", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  const url = "http://localhost:54321/storage/v1/photo.jpg"
  assert.equal(getActiveImageUrl(url), url)
})
