import { test } from "node:test"
import assert from "node:assert/strict"
import { describeUploadError } from "../../apps/admin/src/utility/uploadErrors.ts"

test("a missing bucket points at the setup script", () => {
  const message = describeUploadError(new Error("Bucket not found"), "music")
  assert.match(message, /bucket "music" does not exist/i)
  assert.match(message, /storage\.sql/)
})

test("a rejected MIME type names the bucket", () => {
  const message = describeUploadError(new Error("mime type audio/mpeg is not supported"), "photos")
  assert.match(message, /file type is not allowed/i)
  assert.match(message, /"photos"/)
})

test("a permission problem asks the user to sign in", () => {
  const message = describeUploadError(new Error("row-level security violation"), "photos")
  assert.match(message, /not signed in/i)
})

test("an oversized file is reported as such", () => {
  const message = describeUploadError(new Error("exceeded the maximum allowed size"), "music")
  assert.match(message, /larger than the bucket allows/i)
})

test("an unknown error keeps its original message", () => {
  assert.equal(describeUploadError(new Error("network unreachable"), "photos"), "network unreachable")
})

test("a missing error still produces a usable message", () => {
  assert.equal(describeUploadError(undefined, "photos"), "Upload failed.")
  assert.equal(describeUploadError(null, "photos"), "Upload failed.")
})
