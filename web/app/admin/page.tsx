import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/admin/DashboardContent";

export default async function AdminPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient();
    const resolvedParams = await searchParams;
    const activeTab = (resolvedParams.tab as string) || "agendamentos";

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/admin");
    }

    // 2. Comprehensive Admin Check (Email + Role in Profiles)
    const isHardcodedAdmin = user.email === "everaldocabeleireiro3@gmail.com";

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const isAdmin = isHardcodedAdmin || profile?.role === "ADMIN";

    if (!isAdmin) {
        console.warn(`Unauthorized access attempt to admin by: ${user.email}`);
        redirect("/");
    }

    // 3. Fetch all data on the server
    const [
        { data: appointments },
        { data: services },
        { data: products },
        { data: galleryData },
        { data: settingsData }
    ] = await Promise.all([
        supabase.from("appointments")
            .select(`id, start_time, profiles(name, phone), services(name, price)`)
            .order("start_time", { ascending: true }),
        supabase.from("services").select("*").order("name"),
        supabase.from("products").select("*").order("name"),
        supabase.from("gallery").select("*").order("created_at", { ascending: false }),
        supabase.from("settings").select("*")
    ]);

    const formattedSettings = settingsData?.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {}) || {};

    return (
        <DashboardContent
            initialActiveTab={activeTab}
            appointments={appointments || []}
            services={services || []}
            products={products || []}
            gallery={galleryData || []}
            settings={formattedSettings}
        />
    );
}
