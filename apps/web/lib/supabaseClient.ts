import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Warning: Missing Supabase environment variables. Using placeholder values for build/fallback.')
}

/**
 * Upper bound for a single Supabase request.
 *
 * Without a timeout a request to an unreachable host blocks until the OS TCP
 * timeout expires — on a LAN that is easily a minute or two, during which the
 * visitor stares at the loading screen. Aborting early turns that into a
 * prompt, readable error instead.
 */
const REQUEST_TIMEOUT_MS = 10_000

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(new DOMException('Supabase request timed out', 'TimeoutError')),
    REQUEST_TIMEOUT_MS,
  )

  const signals = [controller.signal, init?.signal].filter(Boolean) as AbortSignal[]
  const signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0]

  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
})
