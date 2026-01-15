import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import BookingClient from "@/components/booking/booking-client"

export default async function BookingPage() {
    const supabase = await createClient()

    // 1. Server-side Auth Check
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/book")
    }

    // 2. Pre-fetch services
    let { data: services, error } = await supabase
        .from("services")
        .select("*")
        .order("name")

    if (error) {
        console.error("Error fetching services:", error)
    }

    // FALLBACK: If DB is empty or error, verify if we have data. If not, provide defaults.
    // This prevents the "empty list" issue if the user hasn't seeded the DB yet.
    if (!services || services.length === 0) {
        console.warn("No services found in DB. Using fallback defaults.")
        services = [
            { id: 1, name: "Corte de Cabelo", price: 40.00, duration_min: 30 },
            { id: 2, name: "Barba Completa", price: 30.00, duration_min: 30 },
            { id: 3, name: "Corte + Barba", price: 60.00, duration_min: 50 },
            { id: 4, name: "Pezinho / Acabamento", price: 15.00, duration_min: 15 },
        ]
    }

    const { data: settingsData } = await supabase.from("settings").select("*");
    const settings = settingsData?.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {}) || {};

    // 3. Pass data to Client Component
    return <BookingClient user={user} initialServices={services} settings={settings} />
}
