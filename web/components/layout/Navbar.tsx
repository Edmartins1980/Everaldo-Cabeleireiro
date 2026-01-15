"use client"

import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Calendar, User as UserIcon } from "lucide-react"

export function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const supabase = createClient()
    const pathname = usePathname()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                if (user.email === "everaldocabeleireiro3@gmail.com") {
                    setIsAdmin(true)
                } else {
                    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
                    setIsAdmin(profile?.role === "ADMIN")
                }
            }
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) {
                if (currentUser.email === "everaldocabeleireiro3@gmail.com") {
                    setIsAdmin(true)
                } else {
                    setIsAdmin(false)
                }
            } else {
                setIsAdmin(false)
                setUser(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [pathname, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setIsAdmin(false)
        window.location.href = '/login'
    }

    // Esconde o navbar em páginas de admin
    if (pathname?.startsWith("/admin")) {
        return null
    }

    return (
        <nav className="fixed top-0 left-0 right-0 border-b border-zinc-900 bg-black/80 backdrop-blur-md z-[100] w-full h-16">
            <div className="w-full h-full flex items-center justify-between px-4 md:px-8">

                {/* Esquerda: Apenas o Link HOME limpo */}
                <div className="flex items-center">
                    <Link href="/" className="font-bold text-xl tracking-tighter text-primary hover:text-white transition-all uppercase italic">
                        HOME
                    </Link>
                </div>

                {/* Direita: Ações e Perfil */}
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link href="/admin">
                            <Button variant="outline" size="sm" className="hidden sm:flex border-primary text-primary hover:bg-primary hover:text-white">
                                PAINEL ADMIN
                            </Button>
                        </Link>
                    )}

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden md:inline text-sm font-bold text-muted-foreground">
                                Olá, <span className="text-primary">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
                            </span>

                            <Link href="/appointments">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary" title="Meus Agendamentos">
                                    <Calendar className="h-5 w-5" />
                                </Button>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer"
                            >
                                SAIR
                            </button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="h-9 px-5 font-bold">
                                ENTRAR
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}