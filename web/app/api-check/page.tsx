"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ApiCheckPage() {
    const [status, setStatus] = useState<any>({
        loading: true,
        auth: null,
        db: null,
        envURL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Exists" : "MISSING",
        envKEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? "Exists" : "MISSING",
    })

    useEffect(() => {
        async function runCheck() {
            const supabase = createClient()

            // 1. Check Auth Connection
            const { data: authData, error: authError } = await supabase.auth.getSession()

            // 2. Check DB Read (Public Table or simple RPC)
            const { data: dbData, error: dbError } = await supabase.from('services').select('name').limit(1)

            setStatus((prev: any) => ({
                ...prev,
                loading: false,
                auth: authError ? `Error: ${authError.message}` : "Connected",
                db: dbError ? `Error: ${dbError.message}` : "Connected (Can read services)",
            }))
        }
        runCheck()
    }, [])

    return (
        <div className="min-h-screen bg-black text-white p-10 font-mono">
            <h1 className="text-2xl font-bold mb-6 text-orange-500 underline">SUPABASE DIAGNOSTIC</h1>

            <div className="space-y-4 border border-zinc-800 p-6 rounded-xl bg-zinc-950">
                <p>Status: {status.loading ? "Checking..." : "Done"}</p>
                <hr className="border-zinc-800" />
                <p>Env URL: <span className={status.envURL === "OK" ? "text-green-500" : "text-yellow-500"}>{status.envURL}</span></p>
                <p>Env Key: <span className={status.envKEY === "OK" ? "text-green-500" : "text-yellow-500"}>{status.envKEY}</span></p>
                <hr className="border-zinc-800" />
                <p>Auth API: <span className={status.auth === "Connected" ? "text-green-500" : "text-red-500"}>{status.auth}</span></p>
                <p>Data API: <span className={status.db?.includes("Connected") ? "text-green-500" : "text-red-500"}>{status.db}</span></p>
            </div>

            <div className="mt-8 text-xs text-zinc-500 p-4 border border-zinc-900 rounded bg-black">
                <p>If Auth API shows 401/Invalid Key, but Data API works, the key is valid for DB but not for Auth provider.</p>
                <p>If both fail, the Key/URL pair is fundamentally rejected by Supabase.</p>
            </div>

            <a href="/login" className="mt-8 inline-block text-orange-500 hover:underline">Voltar para Login</a>
        </div>
    )
}
