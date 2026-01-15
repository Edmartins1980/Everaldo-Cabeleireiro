"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Video, Camera, ArrowLeft, Loader2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function GalleryClient() {
    const [selectedCategory, setSelectedCategory] = useState<"PHOTO" | "VIDEO" | null>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchGallery() {
            setLoading(true)
            const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false })
            if (data) setItems(data)
            setLoading(false)
        }
        fetchGallery()
    }, [supabase])

    const filteredItems = items.filter(item => item.type === selectedCategory)

    return (
        <div className="container max-w-md mx-auto min-h-screen p-4 space-y-8 pb-24 relative">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">Galeria</h1>
                <p className="text-muted-foreground">Confira nossos cortes e estilos</p>
            </div>

            {/* Category Selection */}
            {!selectedCategory && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Button
                        variant="outline"
                        className="h-32 flex flex-col gap-2 hover:border-primary hover:text-primary transition-all shadow-sm"
                        onClick={() => setSelectedCategory("PHOTO")}
                    >
                        <Camera className="h-8 w-8" />
                        <span className="text-lg font-bold">FOTOS</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-32 flex flex-col gap-2 hover:border-primary hover:text-primary transition-all shadow-sm"
                        onClick={() => setSelectedCategory("VIDEO")}
                    >
                        <Video className="h-8 w-8" />
                        <span className="text-lg font-bold">VÍDEOS</span>
                    </Button>
                </div>
            )}

            {/* Content Display */}
            {selectedCategory && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <h2 className="text-xl font-bold">
                            {selectedCategory === "PHOTO" ? "Fotos" : "Vídeos"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {loading ? (
                            <div className="col-span-full py-10 flex justify-center">
                                <Loader2 className="animate-spin text-primary" />
                            </div>
                        ) : filteredItems.length > 0 ? filteredItems.map((item) => (
                            <div key={item.id} className="aspect-square bg-muted rounded-xl border border-border overflow-hidden cursor-pointer active:scale-95 transition-transform">
                                {selectedCategory === "PHOTO" ? (
                                    <img
                                        src={item.url}
                                        alt="Gallery"
                                        className="w-full h-full object-cover"
                                        onClick={() => setSelectedImage(item.url)}
                                    />
                                ) : (
                                    <video src={item.url} controls className="w-full h-full object-cover" />
                                )}
                            </div>
                        )) : (
                            <div className="col-span-full py-10 text-center text-muted-foreground">
                                Nenhum {selectedCategory === "PHOTO" ? "foto" : "vídeo"} encontrado.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mini Lightbox / Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-full max-h-[90vh] w-auto h-auto">
                        <img
                            src={selectedImage}
                            alt="Zoomed"
                            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-300"
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
