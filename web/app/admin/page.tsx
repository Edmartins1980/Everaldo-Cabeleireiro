'use client'

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardContent from "@/components/admin/DashboardContent";

export default function AdminPage() {
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
            // 1. Verificação de Segurança (Client Side)
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user || user.email !== "everaldocabeleireiro3@gmail.com") {
                router.push("/");
                return;
            }

            // 2. Busca de Dados
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