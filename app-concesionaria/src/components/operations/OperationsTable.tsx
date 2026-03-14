"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import "material-symbols/outlined.css";

interface Operation {
  idOperacion: number;
  fechaInicio: string;
  fechaVenta: string | null;
  modelo: string;
  anio: number;
  patente: string;
  precioVentaTotal: number | null;
  ingresosNetos: number | null;
  estado: "abierta" | "cerrada" | "cancelada";
  marcaNombre: string;
  categoriaNombre: string;
  tipoOperacionNombre: string;
}

export interface OperationFilters {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  marcaId?: string;
  tipoOperacionId?: string;
}

interface OperationsTableProps {
  refreshTrigger?: number;
  filters?: OperationFilters;
}

type SortField = "fechaInicio" | "fechaVenta" | "modelo" | "anio" | "marca" | "estado" | "precioVentaTotal" | "ingresosNetos";
type SortOrder = "asc" | "desc";

export function OperationsTable({ refreshTrigger, filters }: OperationsTableProps) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("fechaInicio");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchOperations = async (cursor?: number | null) => {
    const isInitialLoad = cursor === undefined;
    
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      let url = `${baseUrl}/api/operations?sortBy=${sortBy}&sortOrder=${sortOrder}&limit=20`;
      
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      if (filters?.estado) {
        url += `&estado=${filters.estado}`;
      }
      if (filters?.fechaDesde) {
        url += `&fechaDesde=${filters.fechaDesde}`;
      }
      if (filters?.fechaHasta) {
        url += `&fechaHasta=${filters.fechaHasta}`;
      }
      if (filters?.marcaId) {
        url += `&marcaId=${filters.marcaId}`;
      }
      if (filters?.tipoOperacionId) {
        url += `&tipoOperacionId=${filters.tipoOperacionId}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newOperations = data.operations ?? [];
        
        if (isInitialLoad) {
          setOperations(newOperations);
        } else {
          setOperations((prev) => [...prev, ...newOperations]);
        }
        
        setNextCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore ?? false);
      } else {
        if (isInitialLoad) {
          setOperations([]);
        }
        setHasMore(false);
      }
    } catch {
      if (isInitialLoad) {
        setOperations([]);
      }
      setHasMore(false);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [refreshTrigger, sortBy, sortOrder, filters]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && nextCursor) {
      fetchOperations(nextCursor);
    }
  }, [isLoadingMore, hasMore, nextCursor, sortBy, sortOrder]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "abierta":
        return {
          color: "bg-green-50 text-green-700",
          dotColor: "bg-green-600",
          label: "Abierta",
        };
      case "cerrada":
        return {
          color: "bg-zinc-100 text-zinc-600",
          dotColor: "bg-zinc-400",
          label: "Cerrada",
        };
      case "cancelada":
        return {
          color: "bg-red-50 text-red-700",
          dotColor: "bg-red-600",
          label: "Cancelada",
        };
      default:
        return {
          color: "bg-zinc-100 text-zinc-600",
          dotColor: "bg-zinc-400",
          label: estado,
        };
    }
  };

  const handleOperationClick = (idOperacion: number) => {
    router.push(`/operaciones/${idOperacion}`);
  };

  const handleEditClick = (
    e: React.MouseEvent,
    idOperacion: number
  ) => {
    e.stopPropagation();
    router.push(`/operaciones/${idOperacion}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
          progress_activity
        </span>
        <p className="mt-4 text-sm text-zinc-600">Cargando operaciones...</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-zinc-200 lg:block">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                ID Operación
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("fechaInicio")}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Fecha Inicio
                  {sortBy === "fechaInicio" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("fechaVenta")}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Fecha Venta
                  {sortBy === "fechaVenta" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("marca")}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Vehículo
                  {sortBy === "marca" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Tipo de Operación
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("estado")}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Estado
                  {sortBy === "estado" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort("precioVentaTotal")}
                  className="flex items-center justify-end gap-1 w-full text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Precio Venta
                  {sortBy === "precioVentaTotal" && (
                    <span className="material-symbols-outlined text-sm">
                      {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => handleSort("ingresosNetos")}
                  className="flex items-center justify-end gap-1 w-full text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Ganancia Neta
                  {sortBy === "ingresosNetos" && (
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
            {operations.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                      <span className="material-symbols-outlined text-4xl text-zinc-400">
                        inventory_2
                      </span>
                    </div>
                    <p className="mt-4 text-base font-medium text-zinc-900">
                      No hay operaciones registradas
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Comenzá creando una nueva operación
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {operations.map((operation) => {
                  const estadoBadge = getEstadoBadge(operation.estado);
                  return (
                    <tr
                      key={operation.idOperacion}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOperationClick(operation.idOperacion)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                        >
                          #{operation.idOperacion}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-900">
                          {formatDate(operation.fechaInicio)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-900">
                          {formatDate(operation.fechaVenta)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-900">
                            {operation.marcaNombre} {operation.modelo}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {operation.anio}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-900">
                          {operation.tipoOperacionNombre}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${estadoBadge.color}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${estadoBadge.dotColor}`}
                          />
                          {estadoBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-zinc-900">
                          {formatCurrency(operation.precioVentaTotal)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            operation.ingresosNetos && operation.ingresosNetos > 0
                              ? "text-green-600"
                              : "text-zinc-900"
                          }`}
                        >
                          {formatCurrency(operation.ingresosNetos)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={(e) =>
                              handleEditClick(e, operation.idOperacion)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={`Editar operación ${operation.idOperacion}`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {isLoadingMore && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">
                          progress_activity
                        </span>
                        <p className="mt-2 text-xs text-zinc-600">Cargando más operaciones...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
        {!isLoading && operations.length > 0 && hasMore && (
          <div ref={observerTarget} className="h-4" />
        )}
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <span className="material-symbols-outlined text-4xl text-zinc-400">
                inventory_2
              </span>
            </div>
            <p className="mt-4 text-base font-medium text-zinc-900">
              No hay operaciones registradas
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Comenzá creando una nueva operación
            </p>
          </div>
        ) : (
          <>
            {operations.map((operation) => {
              const estadoBadge = getEstadoBadge(operation.estado);
              return (
                <div
                  key={operation.idOperacion}
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
                          <button
                            onClick={() =>
                              handleOperationClick(operation.idOperacion)
                            }
                            className="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                          >
                            #{operation.idOperacion}
                          </button>
                          <h3 className="mt-1 text-sm font-medium text-zinc-900">
                            {operation.marcaNombre} {operation.modelo}
                          </h3>
                          <p className="text-xs text-zinc-500">
                            Año {operation.anio}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${estadoBadge.color}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${estadoBadge.dotColor}`}
                          />
                          {estadoBadge.label}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500">Fecha Inicio:</span>
                          <p className="font-medium text-zinc-900">
                            {formatDate(operation.fechaInicio)}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Fecha Venta:</span>
                          <p className="font-medium text-zinc-900">
                            {formatDate(operation.fechaVenta)}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Tipo de Operación:</span>
                          <p className="font-medium text-zinc-900">
                            {operation.tipoOperacionNombre}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Precio Venta:</span>
                          <p className="font-medium text-zinc-900">
                            {formatCurrency(operation.precioVentaTotal)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-zinc-500">Ganancia Neta:</span>
                          <p
                            className={`font-semibold ${
                              operation.ingresosNetos && operation.ingresosNetos > 0
                                ? "text-green-600"
                                : "text-zinc-900"
                            }`}
                          >
                            {formatCurrency(operation.ingresosNetos)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end border-t border-zinc-200 pt-3">
                        <button
                          onClick={(e) =>
                            handleEditClick(e, operation.idOperacion)
                          }
                          className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Editar operación ${operation.idOperacion}`}
                        >
                          <span className="material-symbols-outlined text-base">
                            edit
                          </span>
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoadingMore && (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">
                  progress_activity
                </span>
                <p className="mt-2 text-xs text-zinc-600">Cargando más operaciones...</p>
              </div>
            )}
          </>
        )}
        {!isLoading && operations.length > 0 && hasMore && (
          <div ref={observerTarget} className="h-4" />
        )}
      </div>
    </>
  );
}
