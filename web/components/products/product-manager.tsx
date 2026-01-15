"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
}

interface ProductManagerProps {
    initialProducts: Product[];
    isAdmin?: boolean;
}

export default function ProductManager({ initialProducts }: ProductManagerProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {initialProducts.map((product) => (
                    <div
                        key={product.id}
                        className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-500 flex flex-col"
                    >
                        {/* Status Tag */}
                        <div className="absolute top-3 left-3 z-10">
                            <span className="bg-orange-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-xl">
                                Premium
                            </span>
                        </div>

                        {/* Image Section */}
                        <div
                            className="relative aspect-square overflow-hidden cursor-zoom-in flex-shrink-0"
                            onClick={() => setSelectedImage(product.image_url)}
                        >
                            <img
                                src={product.image_url || "https://via.placeholder.com/300x100?text=Barbearia"}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out grayscale-[0.2] group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                        </div>

                        {/* Info Section */}
                        <div className="p-4 pt-5 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-white uppercase tracking-tight italic group-hover:text-orange-500 transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="h-0.5 w-6 bg-orange-500/50 group-hover:w-12 transition-all duration-500" />
                            </div>

                            <div className="flex items-center justify-between mt-4 bg-black/40 p-2 rounded-xl border border-zinc-800/50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Preço</span>
                                    <span className="text-base font-black text-white tracking-tighter">
                                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedImage(product.image_url)}
                                    className="bg-orange-500 text-black p-2 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    <Search size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm transition-all duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[210]">
                        <X size={32} />
                    </button>
                    <div className="relative max-w-4xl w-full max-h-[80vh] flex items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Zoom"
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-zinc-800"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
