"use client";

import React, { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import "material-symbols/outlined.css";

export default function ClienteDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const clienteId = params.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.rol === "usuario" && session.user.clienteId !== clienteId) {
        router.push(`/cliente/${session.user.clienteId}/dashboard`);
      }
    }
  }, [status, session, router, clienteId]);

  if (status === "loading") {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-5xl text-blue-600">
              progress_activity
            </span>
            <p className="text-sm text-zinc-500">Cargando dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="material-symbols-outlined text-3xl text-white">
              dashboard
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-500">
              Panel de control de tu concesionaria
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Operaciones Activas */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Operaciones Activas
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">—</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="material-symbols-outlined text-2xl text-blue-600">
                  work
                </span>
              </div>
            </div>
          </div>

          {/* Vehículos en Stock */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Vehículos en Stock
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">—</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <span className="material-symbols-outlined text-2xl text-purple-600">
                  directions_car
                </span>
              </div>
            </div>
          </div>

          {/* Gastos del Mes */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Gastos del Mes
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">—</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <span className="material-symbols-outlined text-2xl text-orange-600">
                  receipt_long
                </span>
              </div>
            </div>
          </div>

          {/* Ingresos del Mes */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Ingresos del Mes
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">—</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <span className="material-symbols-outlined text-2xl text-green-600">
                  trending_up
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Acciones Rápidas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => router.push("/operaciones")}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left transition-colors hover:bg-zinc-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="material-symbols-outlined text-xl text-white">
                  add
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Nueva Operación
                </p>
                <p className="text-xs text-zinc-500">Registrar venta</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/stock")}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left transition-colors hover:bg-zinc-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                <span className="material-symbols-outlined text-xl text-white">
                  add
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Agregar Vehículo
                </p>
                <p className="text-xs text-zinc-500">Al inventario</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/gastos")}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left transition-colors hover:bg-zinc-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600">
                <span className="material-symbols-outlined text-xl text-white">
                  add
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Registrar Gasto
                </p>
                <p className="text-xs text-zinc-500">Nuevo gasto</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/operaciones")}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left transition-colors hover:bg-zinc-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                <span className="material-symbols-outlined text-xl text-white">
                  search
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Ver Operaciones
                </p>
                <p className="text-xs text-zinc-500">Historial</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Actividad Reciente
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Ver todo
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <span className="material-symbols-outlined text-4xl text-zinc-400">
                history
              </span>
            </div>
            <p className="mt-4 text-sm text-zinc-600">
              No hay actividad reciente
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
