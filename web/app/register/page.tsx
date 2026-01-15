"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg("")

        try {
            // 1. Sign up with Supabase Auth
            // We pass the prompt data just in case a trigger wants to use it.
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone,
                    }
                }
            })

            if (authError) {
                throw new Error(authError.message)
            }

            if (authData.user) {
                // 2. Explicitly UPSERT the profile.
                // We use a try-catch here specifically for the profile part.
                // If this fails (e.g. RLS issue), we STILL redirect the user because Auth succeeded.
                try {
                    const { error: profileError } = await supabase
                        .from("profiles")
                        .upsert({
                            id: authData.user.id,
                            name: name,
                            phone: phone,
                            role: "CLIENT",
                        })

                    if (profileError) {
                        console.error("Profile creation warning:", profileError)
                        // We do NOT throw here. We let the user proceed.
                        // The trigger might have worked, or they can contact admin.
                    }
                } catch (innerErr) {
                    console.error("Profile creation exception:", innerErr)
                }

                // Success - Redirect regardless of strict profile success to avoid locking user out
                router.push("/")
                router.refresh()
            }
        } catch (err: any) {
            console.error(err)
            setErrorMsg(err.message || "Erro desconhecido")
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-primary">Criar Conta</h1>
                    <p className="text-muted-foreground">Preencha seus dados para agendar</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 rounded-lg border border-border p-6 shadow-xl bg-card">
                    {errorMsg && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Ex: João da Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Telefone / WhatsApp</label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

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
                        <label htmlFor="password" typeof="text" className="text-sm font-medium">Senha</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Criando..." : "Cadastrar"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Já tem conta?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Fazer login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
