"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import "material-symbols/outlined.css";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isOpen, toggle, isMobile, close } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    const clienteId = session?.user?.clienteId || "admin";
    const load = () => {
      setCompanyLogo(localStorage.getItem(`company_logo_${clienteId}`) || "");
      setCompanyName(localStorage.getItem(`company_name_${clienteId}`) || "");
    };
    load();
    window.addEventListener("company_settings_updated", load);
    return () => window.removeEventListener("company_settings_updated", load);
  }, [session]);

  const isAdmin = session?.user?.rol === "admin";

  const menuItems = [
    {
      label: "Finanzas",
      icon: "receipt_long",
      path: "/gastos",
    },
    {
      label: "Cobranzas",
      icon: "payments",
      path: "/cobranzas",
    },
    {
      label: "Operaciones",
      icon: "work",
      path: "/operaciones",
    },
    {
      label: "Stock",
      icon: "directions_car",
      path: "/stock",
    },
    {
      label: "Pendientes",
      icon: "checklist",
      path: "/pendientes",
    },
    {
      label: "Métricas",
      icon: "bar_chart",
      path: "/metricas",
    },
    ...(isAdmin ? [{
      label: "Usuarios",
      icon: "group",
      path: "/usuarios",
    }, {
      label: "Documentos",
      icon: "description",
      path: "/admin/documentos",
    }] : []),
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showUserMenu]);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      close();
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login?logout=success" });
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    router.push("/perfil");
    if (isMobile) {
      close();
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between bg-primary px-6 flex-shrink-0 z-50 shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-white">menu</span>
            </button>

            <div className="flex items-center gap-2">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Logo"
                  className="h-10 w-auto max-w-[140px] object-contain brightness-0 invert"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                  <span className="material-symbols-outlined text-white text-xl">
                    directions_car
                  </span>
                </div>
              )}
              <button
                onClick={() => router.push("/gastos")}
                className="text-xl font-bold text-white hover:text-white/80 transition-colors"
              >
                {companyName || "NorDem"}
              </button>
            </div>

          </div>

          <div className="flex items-center gap-3">
            {/* Settings */}
            <button
              disabled
              className="flex h-10 w-10 items-center justify-center rounded-lg cursor-not-allowed opacity-30"
              aria-label="Configuración"
              title="Configuración (próximamente)"
            >
              <span className="material-symbols-outlined text-white text-xl">
                settings
              </span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 transition-colors hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <span className="material-symbols-outlined text-white text-lg">
                    person
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-white">
                    {session?.user?.nombre || "Admin User"}
                  </p>
                  <p className="text-xs text-white/60">
                    {session?.user?.rol === "admin" ? "Manager" : "User"}
                  </p>
                </div>
                <span className="material-symbols-outlined text-white/60 text-lg hidden sm:block">
                  {showUserMenu ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-background shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">
                      {session?.user?.nombre || "Admin User"}
                    </p>
                    <p className="text-xs text-foreground/50">
                      @{session?.user?.username || "admin"}
                    </p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <span className="material-symbols-outlined text-xl text-foreground/50">
                        account_circle
                      </span>
                      Mi perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-danger transition-colors hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-xl">
                        logout
                      </span>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 top-16 z-40 flex flex-col border-r border-border bg-background transition-all duration-300 ease-in-out w-64
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:top-0 md:translate-x-0
            ${isOpen ? "md:w-64" : "md:w-0 md:overflow-hidden md:border-r-0"}
          `}
        >
          {/* Sidebar Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Main Menu
            </div>
            <ul className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-blue-50 text-primary border-l-2 border-primary pl-[10px]"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      <span className={`material-symbols-outlined text-xl ${isActive ? "text-primary" : ""}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

        </aside>

        {/* Mobile Overlay */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 top-16 z-30 bg-black/50 md:hidden"
            onClick={close}
            aria-hidden="true"
          />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
