"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg("")

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setErrorMsg(error.message)
        } else {
            if (data.user) {
                // ATUALIZADO: Novo e-mail de admin
                const isSpecificAdmin = data.user.email === "everaldocabeleireiro3@gmail.com"

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .single()

                if (isSpecificAdmin || profile?.role === "ADMIN") {
                    window.location.href = "/admin"
                } else {
                    window.location.href = "/"
                }
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-primary">Login</h1>
                    <p className="text-muted-foreground">Entre com sua conta</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 rounded-lg border border-border p-6 shadow-xl bg-card">
                    {errorMsg && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        {/* CORRIGIDO: Removido type="text" da label que causava erro */}
                        <label htmlFor="password" className="text-sm font-medium">Senha</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Ainda não tem conta?{" "}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Cadastre-se
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}