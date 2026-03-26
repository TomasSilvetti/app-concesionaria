"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  operacionId: string | null;
  idOperacion: string | null;
  fotoId: string | null;
}

interface StockFilters {
  marcaId?: string;
  categoriaId?: string;
  precioMin?: number;
  precioMax?: number;
  anio?: number;
  kilometrosMax?: number;
  mostrarConOperacion?: boolean;
}

interface StockTableProps {
  refreshTrigger?: number;
  filters?: StockFilters;
  onSelectionChange?: (vehicles: StockVehicle[]) => void;
}

type SortField = "marca" | "modelo" | "kilometros" | "precioRevista" | "precioOferta";
type SortOrder = "asc" | "desc";

export function StockTable({ refreshTrigger, filters = {}, onSelectionChange }: StockTableProps) {
  const [vehicles, setVehicles] = useState<StockVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>("marca");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [vehicleToDelete, setVehicleToDelete] = useState<StockVehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const handleToggleSelect = (e: React.MouseEvent, vehicle: StockVehicle) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicle.id)) {
        next.delete(vehicle.id);
      } else {
        next.add(vehicle.id);
      }
      const selected = vehicles.filter((v) => next.has(v.id));
      onSelectionChange?.(selected);
      return next;
    });
  };

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(vehicles.map((v) => v.id));
      setSelectedIds(allIds);
      onSelectionChange?.(vehicles);
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const allSelected = vehicles.length > 0 && selectedIds.size === vehicles.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < vehicles.length;

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
      if (filters.mostrarConOperacion) params.append("mostrarConOperacion", "true");
      params.append("page", page.toString());
      params.append("pageSize", "20");

      const url = `${baseUrl}/api/stock?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      } else {
        setVehicles([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch {
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [refreshTrigger, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchVehicles();
    setSelectedIds(new Set());
    onSelectionChange?.([]);
  }, [page, refreshTrigger, sortBy, sortOrder, filters]);

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
    router.push(`/stock/${id}/editar`);
  };

  const handleDeleteClick = (e: React.MouseEvent, vehicle: StockVehicle) => {
    e.stopPropagation();
    setVehicleToDelete(vehicle);
  };

  const handleCancelDelete = () => {
    setVehicleToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/stock/${vehicleToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
        toast.success("Vehículo eliminado correctamente");
        setVehicleToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Error al eliminar el vehículo");
      }
    } catch {
      toast.error("Error de conexión al intentar eliminar");
    } finally {
      setIsDeleting(false);
    }
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
              <th className="px-4 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={handleToggleAll}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  aria-label="Seleccionar todos los vehículos"
                />
              </th>
              <th className="px-4 py-3 w-16" />
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
                <td colSpan={10} className="px-6 py-16">
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
                  className={`transition-colors hover:bg-zinc-50 ${selectedIds.has(vehicle.id) ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(vehicle.id)}
                      onChange={() => {}}
                      onClick={(e) => handleToggleSelect(e, vehicle)}
                      className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      aria-label={`Seleccionar ${vehicle.marca} ${vehicle.modelo}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {vehicle.fotoId ? (
                      <img
                        src={`/api/stock/${vehicle.id}/photos/${vehicle.fotoId}`}
                        alt={`${vehicle.marca} ${vehicle.modelo}`}
                        className="h-10 w-14 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-zinc-100">
                        <span className="material-symbols-outlined text-lg text-zinc-400">
                          directions_car
                        </span>
                      </div>
                    )}
                  </td>
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
                        onClick={(e) => handleDeleteClick(e, vehicle)}
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
              className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${selectedIds.has(vehicle.id) ? "border-blue-300 bg-blue-50" : "border-zinc-200 bg-white"}`}
            >
              <div className="flex items-start gap-4">
                {vehicle.fotoId ? (
                  <img
                    src={`/api/stock/${vehicle.id}/photos/${vehicle.fotoId}`}
                    alt={`${vehicle.marca} ${vehicle.modelo}`}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                    <span className="material-symbols-outlined text-3xl text-zinc-400">
                      directions_car
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">
                        {vehicle.marca} {vehicle.modelo}
                      </h3>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(vehicle.id)}
                      onChange={() => {}}
                      onClick={(e) => handleToggleSelect(e, vehicle)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      aria-label={`Seleccionar ${vehicle.marca} ${vehicle.modelo}`}
                    />
                  </div>
                  <div>
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

                  <div className="mt-3 flex justify-end gap-1 border-t border-zinc-200 pt-3">
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
                      onClick={(e) => handleDeleteClick(e, vehicle)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label={`Eliminar vehículo ${vehicle.marca} ${vehicle.modelo}`}
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-3">
          <p className="text-sm text-zinc-600">
            {total} vehículo{total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página anterior"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <span className="text-sm text-zinc-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      {vehicleToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={handleCancelDelete}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  vehicleToDelete.operacionId ? "bg-blue-100" : "bg-red-100"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    vehicleToDelete.operacionId ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {vehicleToDelete.operacionId ? "link" : "delete"}
                </span>
              </div>
              <h2
                id="delete-modal-title"
                className="text-xl font-semibold text-zinc-900"
              >
                {vehicleToDelete.operacionId
                  ? "Vehículo vinculado a una operación"
                  : "Eliminar vehículo"}
              </h2>
            </div>

            <p className="mb-4 text-sm text-zinc-600">
              {vehicleToDelete.operacionId ? (
                <>
                  Este vehículo está asociado a la operación{" "}
                  <span className="font-semibold text-zinc-900">
                    {vehicleToDelete.idOperacion}
                  </span>
                  . Primero debés desvincularlo desde la edición de la operación.
                </>
              ) : (
                <>
                  ¿Estás seguro de eliminar{" "}
                  <span className="font-semibold text-zinc-900">
                    {vehicleToDelete.marca} {vehicleToDelete.modelo}
                  </span>
                  ? Esta acción no se puede deshacer.
                </>
              )}
            </p>

            {vehicleToDelete.operacionId ? (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    router.push(`/operaciones/${vehicleToDelete.idOperacion}`);
                    setVehicleToDelete(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Ir a la operación
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">
                        progress_activity
                      </span>
                      Eliminando...
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
