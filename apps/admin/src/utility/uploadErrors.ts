/**
 * Translate a Supabase Storage failure into something an operator can act on.
 *
 * Supabase reports a missing bucket, a rejected MIME type and a missing
 * session in ways that mean nothing to the person clicking "upload"
 * ("row-level security violation", "mime type ... not supported"), so the
 * raw message is not shown as-is.
 *
 * Pure function - no React, no Supabase - so it can be unit tested.
 */
export function describeUploadError(error: unknown, bucket: string): string {
  const message = error instanceof Error ? error.message : String(error ?? "")

  if (/bucket not found|not found|404/i.test(message)) {
    return `Storage bucket "${bucket}" does not exist. Run database/storage.sql in the Supabase SQL editor.`
  }
  if (/mime|content type|not allowed|unsupported/i.test(message)) {
    return `The file type is not allowed in the "${bucket}" bucket.`
  }
  if (/row[ -]level security|permission|forbidden|401|403/i.test(message)) {
    return "You are not signed in, or you are not allowed to upload to this bucket."
  }
  if (/exceeded the maximum allowed size|too large|413/i.test(message)) {
    return "The file is larger than the bucket allows."
  }
  return message || "Upload failed."
}
