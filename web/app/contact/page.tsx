import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Clock, Facebook, Instagram } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
    const supabase = await createClient()

    // Auth Guard
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login?next=/contact")
    }

    const { data: settingsData } = await supabase.from('settings').select('*')
    const address = settingsData?.find(s => s.key === 'address')?.value || "Rua Exemplo, 123 - Centro, São Paulo - SP";
    const whatsapp = settingsData?.find(s => s.key === 'whatsapp')?.value || "+5511999999999";
    const instagram = settingsData?.find(s => s.key === 'instagram_url')?.value || "";
    const facebook = settingsData?.find(s => s.key === 'facebook_url')?.value || "";

    return (
        <div className="container max-w-md mx-auto min-h-screen p-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">Contato</h1>
                <p className="text-muted-foreground">Estamos prontos para te atender</p>
            </div>

            <div className="space-y-6">

                {/* WhatsApp Action */}
                <Link href="https://wa.me/5511995130466" target="_blank" className="block">
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 shadow-lg shadow-green-900/20 gap-2">
                        <Phone className="h-5 w-5" />
                        Chamar no WhatsApp
                    </Button>
                </Link>

                {/* Address */}
                <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold">Endereço</h3>
                            <p className="text-muted-foreground text-sm">{address}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold">Horário de Funcionamento</h3>
                            <p className="text-muted-foreground text-sm">Segunda a Sábado<br />08:00 às 18:00</p>
                        </div>
                    </div>
                </div>

                {/* Socials */}
                <div className="flex justify-center gap-4">
                    {facebook && (
                        <Link href={facebook} target="_blank">
                            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full hover:text-blue-600 hover:border-blue-600">
                                <Facebook className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    {instagram && (
                        <Link href={instagram} target="_blank">
                            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full hover:text-pink-600 hover:border-pink-600">
                                <Instagram className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                </div>

            </div>
        </div>
    )
}
