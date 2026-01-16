import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim()
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim()

  if (typeof window !== 'undefined') {
    if (!url) console.error("Supabase URL is missing!");
    if (!anonKey) console.error("Supabase Key (ANON/PUBLISHABLE) is missing!");
  }

  return createBrowserClient(
    url,
    anonKey
  )
}
