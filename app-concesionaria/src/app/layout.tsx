import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "material-symbols/outlined.css";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import PreventNumberInputScroll from "@/components/providers/PreventNumberInputScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nordem - Gestión de Concesionaria",
  description: "Sistema de gestión integral de operaciones vehiculares",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <PreventNumberInputScroll />
        <SessionProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
