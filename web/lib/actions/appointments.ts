"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteAppointment(id: number) {
    const supabase = await createClient()

    // 1. Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Não autorizado." }
    }

    // 2. Perform delete (RLS should allow if policy is correct, 
    // but we can also double check ownership here if needed)
    const { error } = await supabase.from("appointments").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
        return { error: error.message }
    }

    // 3. Revalidate the page
    revalidatePath("/appointments")
    return { success: true }
}

export async function deleteAppointmentsBulk(ids: number[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado." }

    const { error } = await supabase
        .from("appointments")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id) // Security check

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/appointments")
    return { success: true }
}
