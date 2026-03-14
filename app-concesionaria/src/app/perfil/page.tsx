"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "material-symbols/outlined.css";

interface UserProfile {
  id: string;
  username: string;
  nombre: string;
  rol: "admin" | "usuario";
  activo: boolean;
  cliente: {
    id: string;
    nombre: string;
  } | null;
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/users/me`);

      if (res.status === 401) {
        router.push("/login?expired=1");
        return;
      }

      if (!res.ok) {
        if (session?.user) {
          const mockProfile: UserProfile = {
            id: session.user.id || "1",
            username: session.user.username || "usuario",
            nombre: session.user.nombre || "Usuario",
            rol: (session.user.rol as "admin" | "usuario") || "usuario",
            activo: true,
            cliente: session.user.clienteId
              ? {
                  id: session.user.clienteId,
                  nombre: "Cliente Asociado",
                }
              : null,
          };
          setProfile(mockProfile);
          setIsLoading(false);
          return;
        }
        throw new Error("Error al cargar el perfil");
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      if (session?.user) {
        const mockProfile: UserProfile = {
          id: session.user.id || "1",
          username: session.user.username || "usuario",
          nombre: session.user.nombre || "Usuario",
          rol: (session.user.rol as "admin" | "usuario") || "usuario",
          activo: true,
          cliente: session.user.clienteId
            ? {
                id: session.user.clienteId,
                nombre: "Cliente Asociado",
              }
            : null,
        };
        setProfile(mockProfile);
      } else {
        setError("No se pudo cargar la información del perfil");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-5xl text-blue-600">
              progress_activity
            </span>
            <p className="text-sm text-zinc-500">Cargando perfil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="material-symbols-outlined text-4xl text-red-600">
                error
              </span>
            </div>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchProfile}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              Reintentar
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="material-symbols-outlined text-3xl text-white">
              account_circle
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Mi Perfil</h1>
            <p className="text-sm text-zinc-500">
              Información de tu cuenta
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                person
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Información Personal
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Nombre de usuario
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-3">
                  <span className="material-symbols-outlined text-xl text-zinc-400">
                    badge
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    {profile.username}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Nombre completo
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-3">
                  <span className="material-symbols-outlined text-xl text-zinc-400">
                    person_outline
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    {profile.nombre}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                admin_panel_settings
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Permisos y Acceso
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Rol
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                      profile.rol === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {profile.rol === "admin" ? "shield" : "person"}
                    </span>
                    {profile.rol === "admin" ? "Admin" : "Usuario"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Estado de cuenta
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                      profile.activo
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {profile.activo ? "check_circle" : "cancel"}
                    </span>
                    {profile.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Cliente asociado
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-3">
                  <span className="material-symbols-outlined text-xl text-zinc-400">
                    group
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    {profile.cliente ? profile.cliente.nombre : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              info
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">
              Información Adicional
            </h2>
          </div>
          <p className="text-sm text-zinc-600">
            Si necesitás modificar tu información personal o cambiar tu contraseña, contactá al administrador del sistema.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
