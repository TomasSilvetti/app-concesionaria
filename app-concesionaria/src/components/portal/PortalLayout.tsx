"use client";

import React, { useState } from "react";
import "material-symbols/outlined.css";
import { Plasma } from "./Plasma";

interface PortalLayoutProps {
  children: React.ReactNode;
  empresaNombre: string;
  empresaLogo?: string | null;
}

export function PortalLayout({ children, empresaNombre, empresaLogo }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-black">
      {/* Plasma background */}
      <Plasma speed={0.005} scale={1.8} brightness={0.9} />

      {/* Navbar */}
      <header className="relative z-50 flex h-16 flex-shrink-0 items-center justify-between bg-black/40 px-6 shadow-md backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menú"
          >
            <span className="material-symbols-outlined text-white">menu</span>
          </button>
          <div className="flex items-center gap-2">
            {empresaLogo ? (
              <img
                src={empresaLogo}
                alt={empresaNombre}
                className="h-10 w-auto max-w-[140px] object-contain brightness-0 invert"
              />
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                  <span className="material-symbols-outlined text-white text-xl">directions_car</span>
                </div>
                <span className="text-xl font-bold text-white">{empresaNombre}</span>
              </>
            )}
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          Catálogo público
        </span>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-40 flex w-64 flex-col border-r border-white/10 bg-black/50 backdrop-blur-md transition-all duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:top-0 md:translate-x-0
            ${sidebarOpen ? "md:w-64" : "md:w-0 md:overflow-hidden md:border-r-0"}
          `}
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            {empresaLogo ? (
              <img
                src={empresaLogo}
                alt={empresaNombre}
                className="h-16 w-auto max-w-[120px] object-contain brightness-0 invert"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <span className="material-symbols-outlined text-3xl text-blue-300">directions_car</span>
              </div>
            )}
            <p className="text-sm font-semibold text-white">{empresaNombre}</p>
            <p className="text-xs text-white/50">Catálogo de vehículos en stock</p>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 z-30 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
