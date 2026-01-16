"use server"

import { createClient } from "@supabase/supabase-js"

// Note: This uses the SERVICE_ROLE key if available in process.env, 
// strictly for checking availability to bypass RLS issues cleanly.
// If SERVICE KEY is not set, it acts as a helper for the client.

export async function getBusySlots(dateStart: string, dateEnd: string) {
    // If you have a service role key, use it here. 
    // Otherwise we rely on the public RLS policy being fixed.

    // For now, let's assume we are just running this query server-side.
    // If the RLS is fixed (public select), this works with a normal client too.
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim()
    const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim()

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .gte("start_time", dateStart)
        .lte("start_time", dateEnd)
        .neq("status", "CANCELLED")

    if (error) {
        console.error("Error fetching slots:", error)
        return []
    }

    return data || []
}
