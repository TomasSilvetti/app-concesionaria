"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { VehicleDetailView } from "@/components/stock/VehicleDetailView";
import "material-symbols/outlined.css";

export default function DetalleVehiculoPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/stock")}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Volver al listado de stock"
            >
              <span className="material-symbols-outlined text-2xl">
                arrow_back
              </span>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <span className="material-symbols-outlined text-3xl text-white">
                  directions_car
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-zinc-900">
                  Detalle del Vehículo
                </h1>
                <p className="text-sm text-zinc-500">
                  Información completa del vehículo seleccionado
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              onClick={() => router.push("/stock")}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Volver al listado de stock"
            >
              <span className="material-symbols-outlined text-xl">list</span>
              Volver al listado
            </button>
            <button
              onClick={() => router.push(`/stock/${vehicleId}/editar`)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Editar vehículo"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Editar
            </button>
          </div>
        </div>

        {/* Contenido */}
        <VehicleDetailView vehicleId={vehicleId} />
      </div>
    </AppLayout>
  );
}
