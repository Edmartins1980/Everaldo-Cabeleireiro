"use client"

import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Calendar } from "lucide-react"

export function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const supabase = createClient()
    const pathname = usePathname()
    const router = useRouter()

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

    const isPageAdmin = pathname?.startsWith("/admin")

    return (
        <nav className="fixed top-0 left-0 right-0 border-b border-zinc-900 bg-black/80 backdrop-blur-md z-[100] w-full h-16">
            <div className="w-full h-full flex items-center justify-between px-4 md:px-8">

                {/* Esquerda: Nome do usuário + Botões de Troca */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-muted-foreground">
                                Olá, <span className="text-primary">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
                            </span>

                            {/* Botões A e C para o Admin */}
                            {isAdmin && (
                                <div className="flex gap-1 ml-2">
                                    <button
                                        onClick={() => router.push('/')}
                                        className={`w-7 h-7 rounded-full border text-[10px] font-bold transition-all ${!isPageAdmin ? 'bg-primary border-primary text-white' : 'border-zinc-700 text-zinc-500'}`}
                                    >
                                        C
                                    </button>
                                    <button
                                        onClick={() => router.push('/admin')}
                                        className={`w-7 h-7 rounded-full border text-[10px] font-bold transition-all ${isPageAdmin ? 'bg-primary border-primary text-white' : 'border-zinc-700 text-zinc-500'}`}
                                    >
                                        A
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Direita: Ações */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
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