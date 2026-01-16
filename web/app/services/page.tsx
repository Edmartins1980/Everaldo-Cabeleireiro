import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ServicesPage() {
    const supabase = await createClient()

    // Auth Guard
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login?next=/services")
    }

    const { data: services } = await supabase.from("services").select("*").order("name")

    return (
        <div className="container max-w-md mx-auto min-h-screen py-8 px-4 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">Nossos Serviços</h1>
                <p className="text-muted-foreground">Escolha o melhor para seu estilo</p>
            </div>

            <div className="grid gap-4">
                {services && services.length > 0 ? (
                    services.map((service) => (
                        <div
                            key={service.id}
                            className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-start gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors flex-1">
                                    {service.name}
                                </h3>
                                <span className="font-bold text-primary flex-shrink-0 whitespace-nowrap ml-auto">
                                    R$ {service.price.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>{service.duration_min} min</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
                    </div>
                )}
            </div>

            <div className="pb-12 text-center">
                <Link href="/book">
                    <Button size="lg" className="w-full shadow-lg font-bold">
                        AGENDAR AGORA
                    </Button>
                </Link>
            </div>
        </div>
    )
}
