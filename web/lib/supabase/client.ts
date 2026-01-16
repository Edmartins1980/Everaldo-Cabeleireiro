import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (typeof window !== 'undefined') {
    console.log("Supabase Client Init!");
    if (!url) console.error("Supabase URL is missing!");
    if (!anonKey) console.error("Supabase Key (ANON/PUBLISHABLE) is missing!");
    else {
      console.log("Using Key starting with:", anonKey.substring(0, 10));
    }
  }

  return createBrowserClient(
    url!,
    anonKey!
  )
}
