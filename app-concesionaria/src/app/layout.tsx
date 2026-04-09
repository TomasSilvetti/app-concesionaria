import type { Metadata } from "next";
import { Geist_Mono, Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "material-symbols/outlined.css";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import PreventNumberInputScroll from "@/components/providers/PreventNumberInputScroll";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${geistMono.variable} ${archivBlack.variable} ${spaceGrotesk.variable} antialiased`}
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
