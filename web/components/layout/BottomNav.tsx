"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, ShoppingBag, Phone, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    const items = [
        { href: "/", label: "Início", icon: Home },
        { href: "/gallery", label: "Galeria", icon: ImageIcon },
        { href: "/services", label: "Serviços", icon: Calendar },
        { href: "/products", label: "Produtos", icon: ShoppingBag },
        { href: "/contact", label: "Contato", icon: Phone },
    ]

    // Hide on auth pages or admin pages
    if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
        return null
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 pb-safe">
            {/* 
               STRICT REQUIREMENT: 
               Wrap icons in a div with max-w-md mx-auto so they stay centered and grouped.
            */}
            <div className="container max-w-md mx-auto h-16 flex items-center justify-around px-2">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative group",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                            <span className="text-[10px] uppercase font-medium tracking-wide">{item.label}</span>

                            {/* Active Indicator Dot */}
                            {isActive && (
                                <span className="absolute -top-0.5 w-1 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
