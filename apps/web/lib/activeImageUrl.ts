/**
 * Rewrite URLs that point at a local-Docker Supabase (localhost:54321 / 127.0.0.1:54321)
 * to whatever the active `NEXT_PUBLIC_SUPABASE_URL` env value is. This keeps demo
 * images working when the same exported `image_url` value is used in both local
 * Docker development and a deployed build without baking hostnames into the DB.
 */
export function getActiveImageUrl(url: string | undefined | null): string {
  if (!url) return ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && (url.includes('localhost:54321') || url.includes('127.0.0.1:54321'))) {
    return url
      .replace(/http:\/\/localhost:54321/g, supabaseUrl)
      .replace(/http:\/\/127.0.0.1:54321/g, supabaseUrl)
  }
  return url
}
