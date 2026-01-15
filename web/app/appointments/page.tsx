import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AppointmentsList from "@/components/appointments/appointments-list"

export default async function MyAppointmentsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          start_time,
          status,
          services (
            name,
            price,
            duration_min
          )
        `)
        .eq("user_id", user.id)
        .neq("status", "CANCELLED")
        .order("start_time", { ascending: true })

    return (
        <div className="container max-w-md mx-auto min-h-screen p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center mb-6">Meus Agendamentos</h1>
            <AppointmentsList initialAppointments={appointments || []} />
        </div>
    )
}
