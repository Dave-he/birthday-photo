import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}

/**
 * Upper bound for a single Supabase request. Without a timeout a request to
 * an unreachable host blocks until the OS TCP timeout expires, which leaves
 * the admin panel spinning on a request that can never succeed.
 */
const REQUEST_TIMEOUT_MS = 10_000;

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException("Supabase request timed out", "TimeoutError")),
    REQUEST_TIMEOUT_MS,
  );

  const signals = [controller.signal, init?.signal].filter(Boolean) as AbortSignal[];
  const signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0];

  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer));
};

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});
