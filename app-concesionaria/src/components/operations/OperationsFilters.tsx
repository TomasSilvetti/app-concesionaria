"use client";

import React, { useState, useEffect } from "react";
import "material-symbols/outlined.css";

interface VehicleBrand {
  id: string;
  nombre: string;
}

interface OperationType {
  id: string;
  nombre: string;
}

export interface OperationFilters {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  marcaId?: string;
  tipoOperacionId?: string;
}

interface OperationsFiltersProps {
  onApplyFilters: (filters: OperationFilters) => void;
  onClearFilters: () => void;
}

export function OperationsFilters({
  onApplyFilters,
  onClearFilters,
}: OperationsFiltersProps) {
  const [estado, setEstado] = useState<string>("abierta");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [marcaId, setMarcaId] = useState<string>("");
  const [tipoOperacionId, setTipoOperacionId] = useState<string>("");
  
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${baseUrl}/api/vehicle-brands`);
        if (res.ok) {
          const data = await res.json();
          setBrands(data.brands ?? data ?? []);
        } else {
          setBrands([]);
        }
      } catch {
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };

    const fetchOperationTypes = async () => {
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${baseUrl}/api/operation-types`);
        if (res.ok) {
          const data = await res.json();
          setOperationTypes(data.types ?? data ?? []);
        } else {
          setOperationTypes([]);
        }
      } catch {
        setOperationTypes([]);
      } finally {
        setTypesLoading(false);
      }
    };

    fetchBrands();
    fetchOperationTypes();
  }, []);

  const hasActiveFilters =
    estado !== "" ||
    fechaDesde !== "" ||
    fechaHasta !== "" ||
    marcaId !== "" ||
    tipoOperacionId !== "";

  const handleApplyFilters = () => {
    const filters: OperationFilters = {};
    
    if (estado) filters.estado = estado;
    if (fechaDesde) filters.fechaDesde = fechaDesde;
    if (fechaHasta) filters.fechaHasta = fechaHasta;
    if (marcaId) filters.marcaId = marcaId;
    if (tipoOperacionId) filters.tipoOperacionId = tipoOperacionId;

    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setEstado("");
    setFechaDesde("");
    setFechaHasta("");
    setMarcaId("");
    setTipoOperacionId("");
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (estado) count++;
    if (fechaDesde || fechaHasta) count++;
    if (marcaId) count++;
    if (tipoOperacionId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="estado" className="text-sm font-medium text-zinc-700">
            Estado
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              label
            </span>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas</option>
              <option value="abierta">Abierta</option>
              <option value="cerrada">Cerrada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              expand_more
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="fechaDesde" className="text-sm font-medium text-zinc-700">
            Fecha desde
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              calendar_today
            </span>
            <input
              id="fechaDesde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="fechaHasta" className="text-sm font-medium text-zinc-700">
            Fecha hasta
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              calendar_today
            </span>
            <input
              id="fechaHasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="marca" className="text-sm font-medium text-zinc-700">
            Marca
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              directions_car
            </span>
            <select
              id="marca"
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              disabled={brandsLoading}
            >
              <option value="">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.nombre}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              expand_more
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tipoOperacion" className="text-sm font-medium text-zinc-700">
            Tipo de operación
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              category
            </span>
            <select
              id="tipoOperacion"
              value={tipoOperacionId}
              onChange={(e) => setTipoOperacionId(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              disabled={typesLoading}
            >
              <option value="">Todos los tipos</option>
              {operationTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nombre}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              expand_more
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {activeFiltersCount > 0 && (
            <>
              <span className="text-sm font-medium text-zinc-700">
                Filtros activos:
              </span>
              {estado && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    label
                  </span>
                  {estado === "abierta" ? "Abierta" : estado === "cerrada" ? "Cerrada" : "Cancelada"}
                </span>
              )}
              {(fechaDesde || fechaHasta) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    calendar_today
                  </span>
                  {fechaDesde && fechaHasta
                    ? `${fechaDesde} - ${fechaHasta}`
                    : fechaDesde
                    ? `Desde ${fechaDesde}`
                    : `Hasta ${fechaHasta}`}
                </span>
              )}
              {marcaId && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    directions_car
                  </span>
                  {brands.find((b) => b.id === marcaId)?.nombre ?? "Marca"}
                </span>
              )}
              {tipoOperacionId && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    category
                  </span>
                  {operationTypes.find((t) => t.id === tipoOperacionId)?.nombre ?? "Tipo"}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
            aria-label="Limpiar filtros"
          >
            <span className="material-symbols-outlined text-xl">
              filter_alt_off
            </span>
            Limpiar filtros
          </button>

          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={!hasActiveFilters}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
            aria-label="Aplicar filtros"
          >
            <span className="material-symbols-outlined text-xl">
              filter_alt
            </span>
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
