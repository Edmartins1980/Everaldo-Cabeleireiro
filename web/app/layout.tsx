import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import OneSignalInit from "@/components/admin/OneSignalInit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Everaldo Cabeleireiro",
  description: "Estilo, técnica e identidade em cada corte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased pb-20`}>
        <OneSignalInit />
        <Navbar />
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
