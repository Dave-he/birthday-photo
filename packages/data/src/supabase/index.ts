import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

export interface SupabaseClientConfig {
  url: string
  anonKey: string
}

export function createSupabaseClient(config: SupabaseClientConfig) {
  return createClient<Database>(config.url, config.anonKey)
}

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://your-project.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key'

  return createSupabaseClient({ url: supabaseUrl, anonKey: supabaseAnonKey })
}

// Default client using environment variables
export const supabase = getSupabaseClient()
