import { createClient } from "@/lib/supabase/server"
import ProductManager from "@/components/products/product-manager"

export default async function ProductsPage() {
    const supabase = await createClient()

    // Verificação de Usuário
    const { data: { user } } = await supabase.auth.getUser()

    let isAdmin = false
    if (user) {
        if (user.email === "com.eveviola@gmail.com") {
            isAdmin = true
        } else {
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
            if (profile?.role === "ADMIN") {
                isAdmin = true
            }
        }
    }

    // Busca de produtos
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <main className="relative min-h-screen w-full bg-black overflow-x-hidden">
            {/* FUNDO COM IMAGEM MODERNA - SEM FUNDO PRETO PURO */}
            <div 
                className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1512690196236-d5a743f4f0bb?q=80&w=2070&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div className="relative z-10 container max-w-6xl mx-auto p-6 space-y-12 pb-24 pt-32 text-center">
                {/* CABEÇALHO: PRODUTOS - SEM AS LINHAS BRANCAS */}
                <div className="space-y-4">
                    <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter text-white leading-none">
                        PRODUTOS
                    </h1>
                    
                    <p className="text-orange-500 font-bold uppercase text-sm md:text-base tracking-[0.4em]">
                        Cuidado e Estilo para o seu Dia a Dia
                    </p>
                </div>

                {/* GRID DE PRODUTOS */}
                <ProductManager initialProducts={products || []} isAdmin={isAdmin} />
            </div>
        </main>
    )
}