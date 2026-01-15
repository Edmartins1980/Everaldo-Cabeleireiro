import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GalleryClient from "@/components/gallery/gallery-client"

export default async function GalleryPage() {
    const supabase = await createClient()

    // Auth Guard
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login?next=/gallery")
    }

    return <GalleryClient />
}
