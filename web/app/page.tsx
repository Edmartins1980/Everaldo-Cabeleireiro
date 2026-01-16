import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Calendar, LogOut, Instagram, Facebook, MessageCircle } from "lucide-react"
import { User } from "@supabase/supabase-js"
import Link from "next/link"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <main className="relative h-screen w-full flex flex-col overflow-hidden bg-black">

      {/* IMAGEM DE FUNDO */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* CABEÇALHO */}
      <header className="relative z-20 w-full p-6 flex justify-between items-center bg-transparent">
        <h2 className="text-orange-500 font-black italic text-xl uppercase tracking-wider">HOME</h2>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-white text-sm font-medium">
                Olá, <span className="text-orange-500 font-bold">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
              </span>
              <Link href="/appointments">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Calendar className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 rounded-md flex gap-2 uppercase text-xs"
              >
                Sair <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-6 rounded-md uppercase text-xs">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* CONTEÚDO CENTRAL */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-orange-500 leading-[0.8] drop-shadow-2xl">
            EVERALDO
          </h1>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-white pt-2">
            CABELEIREIRO
          </h2>
        </div>

        <div className="w-full max-w-md mb-10">
          <p className="text-lg md:text-xl text-zinc-300 italic font-medium">
            “Estilo, técnica e identidade em cada corte.”
          </p>
        </div>

        <div className="w-full max-w-xs">
          <Link href="/book" className="w-full">
            <Button size="lg" className="w-full h-20 bg-orange-500 hover:bg-orange-600 text-black font-black text-2xl rounded-xl shadow-2xl shadow-orange-500/20 uppercase transition-transform hover:scale-105 active:scale-95">
              AGENDAR HORÁRIO
            </Button>
          </Link>
        </div>
      </div>

      {/* RODAPÉ - Z-50 PARA GARANTIR O CLIQUE */}
      <footer className="relative z-50 w-full p-8 flex justify-center items-center gap-8 bg-transparent">
        <a
          href="https://www.instagram.com/everaldo.nascimento.35"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-orange-500 transition-all transform hover:scale-110"
        >
          <Instagram size={32} />
        </a>
        <a
          href="https://www.facebook.com/share/1FdtHeBTDP/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-orange-500 transition-all transform hover:scale-110"
        >
          <Facebook size={32} />
        </a>
        <a
          href="https://wa.me/5511995130466"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-orange-500 transition-all transform hover:scale-110"
        >
          <MessageCircle size={32} />
        </a>
      </footer>

      <style jsx global>{`
        body, html { 
          overflow: hidden !important; 
          height: 100% !important;
          margin: 0;
          padding: 0;
        }
        hr, .border-y, .divider { display: none !important; }
        header, nav { border: none !important; }
      `}</style>
    </main>
  )
}