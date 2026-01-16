import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (typeof window !== 'undefined') {
    if (!url) console.error("Supabase URL is missing!")
    if (!anonKey) console.error("Supabase Anon Key is missing!")
    else if (!anonKey.startsWith('sb_') && !anonKey.startsWith('eyJ')) {
      console.warn("Supabase Key has an unusual format:", anonKey.substring(0, 10) + "...")
    }
  }

  return createBrowserClient(
    url!,
    anonKey!
  )
}
