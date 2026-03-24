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

  const isAdmin = session?.user?.rol === "admin";

  const menuItems = [
    {
      label: "Dashboard",
      icon: "dashboard",
      path: "/dashboard",
      disabled: true,
    },
    {
      label: "Gastos",
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
    ...(isAdmin ? [{
      label: "Usuarios",
      icon: "group",
      path: "/usuarios",
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
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 flex-shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-zinc-700">menu</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="material-symbols-outlined text-white text-xl">
                  directions_car
                </span>
              </div>
              <span className="text-xl font-bold text-zinc-900">NorDem</span>
            </div>
            
          </div>

          <div className="flex items-center gap-3">
            {/* Settings */}
            <button
              disabled
              className="flex h-10 w-10 items-center justify-center rounded-lg cursor-not-allowed opacity-40"
              aria-label="Configuración"
              title="Configuración (próximamente)"
            >
              <span className="material-symbols-outlined text-zinc-400 text-xl">
                settings
              </span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 transition-colors hover:bg-zinc-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200">
                  <span className="material-symbols-outlined text-zinc-600 text-lg">
                    person
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-zinc-900">
                    {session?.user?.nombre || "Admin User"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {session?.user?.rol === "admin" ? "Manager" : "User"}
                  </p>
                </div>
                <span className="material-symbols-outlined text-zinc-500 text-lg hidden sm:block">
                  {showUserMenu ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg z-50">
                  <div className="p-3 border-b border-zinc-200">
                    <p className="text-sm font-semibold text-zinc-900">
                      {session?.user?.nombre || "Admin User"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      @{session?.user?.username || "admin"}
                    </p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      <span className="material-symbols-outlined text-xl text-zinc-500">
                        account_circle
                      </span>
                      Mi perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
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
            fixed inset-y-0 left-0 top-16 z-40 flex flex-col border-r border-zinc-200 bg-white transition-transform duration-300 ease-in-out w-64
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:top-0 md:translate-x-0
          `}
        >
          {/* Sidebar Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Main Menu
            </div>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => !item.disabled && handleNavigation(item.path)}
                      disabled={item.disabled}
                      title={item.disabled ? "Próximamente" : undefined}
                      className={`
                        flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                        ${
                          item.disabled
                            ? "cursor-not-allowed opacity-40 text-zinc-700"
                            : isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-zinc-700 hover:bg-zinc-100"
                        }
                      `}
                    >
                      <span className="material-symbols-outlined text-xl">
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
