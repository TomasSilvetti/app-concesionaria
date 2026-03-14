"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "material-symbols/outlined.css";

interface StockVehicle {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  categoria: string;
  version: string | null;
  color: string | null;
  kilometros: number | null;
  precioRevista: number | null;
  precioOferta: number | null;
  tipoIngreso: string;
  operacionId: string | null;
}

interface StockFilters {
  marcaId?: string;
  categoriaId?: string;
  precioMin?: number;
  precioMax?: number;
  anio?: number;
  kilometrosMax?: number;
  tipoIngreso?: string;
}

interface StockTableProps {
  refreshTrigger?: number;
  filters?: StockFilters;
}

type SortField = "marca" | "modelo" | "kilometros" | "precioRevista" | "precioOferta";
type SortOrder = "asc" | "desc";

export function StockTable({ refreshTrigger, filters = {} }: StockTableProps) {
  const [vehicles, setVehicles] = useState<StockVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>("marca");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const router = useRouter();

  const fetchVehicles = async () => {
    setIsLoading(true);

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      
      const params = new URLSearchParams();
      params.append("orderBy", sortBy);
      params.append("order", sortOrder);
      
      if (filters.marcaId) params.append("marcaId", filters.marcaId);
      if (filters.categoriaId) params.append("categoriaId", filters.categoriaId);
      if (filters.precioMin !== undefined) params.append("precioMin", filters.precioMin.toString());
      if (filters.precioMax !== undefined) params.append("precioMax", filters.precioMax.toString());
      if (filters.anio !== undefined) params.append("anio", filters.anio.toString());
      if (filters.kilometrosMax !== undefined) params.append("kilometrosMax", filters.kilometrosMax.toString());
      if (filters.tipoIngreso) params.append("tipoIngreso", filters.tipoIngreso);

      const url = `${baseUrl}/api/stock?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles ?? []);
      } else {
        setVehicles([]);
      }
    } catch {
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger, sortBy, sortOrder, filters]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatKilometers = (km: number | null) => {
    if (km === null) return "—";
    return new Intl.NumberFormat("es-AR").format(km) + " km";
  };

  const handleViewDetails = (id: string) => {
    router.push(`/stock/${id}`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/stock/${id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // TODO: Implementar lógica de eliminación
    console.log("Eliminar vehículo:", id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
          progress_activity
        </span>
        <p className="mt-4 text-sm text-zinc-600">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista Desktop */}
      <div className="hidden overflow-hidden rounded-lg border border-zinc-200 lg:block">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("marca")}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Marca
                  {sortBy === "marca" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("modelo")}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Modelo
                  {sortBy === "modelo" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Versión
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Color
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort("kilometros")}
                  className="flex items-center justify-end gap-1 w-full text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Kilómetros
                  {sortBy === "kilometros" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort("precioRevista")}
                  className="flex items-center justify-end gap-1 w-full text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Precio Revista
                  {sortBy === "precioRevista" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort("precioOferta")}
                  className="flex items-center justify-end gap-1 w-full text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Precio Oferta
                  {sortBy === "precioOferta" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                      <span className="material-symbols-outlined text-4xl text-zinc-400">
                        directions_car
                      </span>
                    </div>
                    <p className="mt-4 text-base font-medium text-zinc-900">
                      No hay vehículos en stock
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Agrega el primero
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="transition-colors hover:bg-zinc-50"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-zinc-900">
                      {vehicle.marca}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-900">
                      {vehicle.modelo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600">
                      {vehicle.version || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600">
                      {vehicle.color || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-zinc-900">
                      {formatKilometers(vehicle.kilometros)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-zinc-900">
                      {formatCurrency(vehicle.precioRevista)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(vehicle.precioOferta)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleViewDetails(vehicle.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Ver detalles del vehículo ${vehicle.marca} ${vehicle.modelo}`}
                        title="Ver detalles"
                      >
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleEdit(e, vehicle.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Editar vehículo ${vehicle.marca} ${vehicle.modelo}`}
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, vehicle.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label={`Eliminar vehículo ${vehicle.marca} ${vehicle.modelo}`}
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="flex flex-col gap-3 lg:hidden">
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <span className="material-symbols-outlined text-4xl text-zinc-400">
                directions_car
              </span>
            </div>
            <p className="mt-4 text-base font-medium text-zinc-900">
              No hay vehículos en stock
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Agrega el primero
            </p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <span className="material-symbols-outlined text-3xl text-zinc-400">
                    directions_car
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">
                        {vehicle.marca} {vehicle.modelo}
                      </h3>
                      {vehicle.version && (
                        <p className="text-sm text-zinc-600">
                          {vehicle.version}
                        </p>
                      )}
                      {vehicle.color && (
                        <p className="text-xs text-zinc-500">
                          Color: {vehicle.color}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Kilómetros:</span>
                      <p className="font-medium text-zinc-900">
                        {formatKilometers(vehicle.kilometros)}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Precio Revista:</span>
                      <p className="font-medium text-zinc-900">
                        {formatCurrency(vehicle.precioRevista)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-500">Precio Oferta:</span>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(vehicle.precioOferta)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-2 border-t border-zinc-200 pt-3">
                    <button
                      onClick={() => handleViewDetails(vehicle.id)}
                      className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`Ver detalles del vehículo ${vehicle.marca} ${vehicle.modelo}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        visibility
                      </span>
                      Ver detalles
                    </button>
                    <button
                      onClick={(e) => handleEdit(e, vehicle.id)}
                      className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`Editar vehículo ${vehicle.marca} ${vehicle.modelo}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                      Editar
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, vehicle.id)}
                      className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label={`Eliminar vehículo ${vehicle.marca} ${vehicle.modelo}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
