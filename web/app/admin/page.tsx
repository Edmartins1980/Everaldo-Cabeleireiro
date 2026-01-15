import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/admin/DashboardContent";

export default async function AdminPage({ searchParams }: { searchParams?: { tab?: string } }) {
    const supabase = await createClient();
    const params = await searchParams;
    const activeTab = params?.tab || "agendamentos";

    // Segurança
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "everaldocabeleireiro3@gmail.com") return redirect("/");

    // Dados
    const { data: appointments } = await supabase
        .from("appointments")
        .select(`id, start_time, profiles(name, phone), services(name, price)`)
        .order("start_time", { ascending: true });

    const { data: services } = await supabase.from("services").select("*").order("name");
    const { data: products } = await supabase.from("products").select("*").order("name");
    let gallery = [];
    try {
        const { data: galleryData } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
        gallery = galleryData || [];
    } catch (e) {
        console.error("Gallery table missing or error fetching:", e);
    }
    let settings = {};
    try {
        const { data: settingsData } = await supabase.from("settings").select("*");
        settings = settingsData?.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {}) || {};
    } catch (e) {
        console.error("Settings table missing or error fetching:", e);
    }

    return (
        <DashboardContent
            initialActiveTab={activeTab}
            appointments={appointments}
            services={services}
            products={products}
            gallery={gallery}
            settings={settings}
        />
    );
}
