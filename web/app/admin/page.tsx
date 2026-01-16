'use client'

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardContent from "@/components/admin/DashboardContent";

// Criamos um componente interno para lidar com a lógica que usa searchParams
function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        appointments: [],
        services: [],
        products: [],
        gallery: [],
        settings: {}
    });
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "agendamentos";
    const supabase = createClient();

    useEffect(() => {
        async function loadAdminData() {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user || user.email !== "everaldocabeleireiro3@gmail.com") {
                router.push("/");
                return;
            }

            const [
                { data: appointments },
                { data: services },
                { data: products },
                { data: galleryData },
                { data: settingsData }
            ] = await Promise.all([
                supabase.from("appointments").select(`id, start_time, profiles(name, phone), services(name, price)`).order("start_time", { ascending: true }),
                supabase.from("services").select("*").order("name"),
                supabase.from("products").select("*").order("name"),
                supabase.from("gallery").select("*").order("created_at", { ascending: false }),
                supabase.from("settings").select("*")
            ]);

            const formattedSettings = settingsData?.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {}) || {};

            setData({
                appointments: appointments || [],
                services: services || [],
                products: products || [],
                gallery: galleryData || [],
                settings: formattedSettings
            });
            
            setLoading(false);
        }

        loadAdminData();
    }, [router, supabase]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando Painel...</div>;
    }

    return (
        <DashboardContent
            initialActiveTab={activeTab}
            appointments={data.appointments}
            services={data.services}
            products={data.products}
            gallery={data.gallery}
            settings={data.settings}
        />
    );
}

// O componente principal exporta o dashboard dentro de um Suspense
export default function AdminPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
            <AdminDashboard />
        </Suspense>
    );
}