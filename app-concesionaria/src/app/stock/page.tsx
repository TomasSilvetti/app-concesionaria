"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { StockTable } from "@/components/stock/StockTable";
import { StockFilters, StockFilters as StockFiltersType } from "@/components/stock/StockFilters";
import "material-symbols/outlined.css";

export default function StockPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<StockFiltersType>({});
  const router = useRouter();

  const handleAgregarVehiculo = () => {
    router.push("/stock/nuevo");
  };

  const handleApplyFilters = (newFilters: StockFiltersType) => {
    setFilters(newFilters);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <span className="material-symbols-outlined text-3xl text-white">
                directions_car
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">
                Stock de Vehículos
              </h1>
              <p className="text-sm text-zinc-500">
                Administrá el inventario de vehículos disponibles
              </p>
            </div>
          </div>

          <button
            onClick={handleAgregarVehiculo}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Agregar nuevo vehículo"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Agregar vehículo
          </button>
        </div>

        {/* Filtros */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <StockFilters
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <StockTable refreshTrigger={refreshTrigger} filters={filters} />
        </div>
      </div>
    </AppLayout>
  );
}
