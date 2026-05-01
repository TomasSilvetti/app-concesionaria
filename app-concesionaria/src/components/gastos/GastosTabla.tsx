"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import "material-symbols/outlined.css";
import { MovimientoModal } from "@/components/gastos/MovimientoModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Gasto {
  id: string;
  operacionId: string | null;
  descripcion: string;
  quienPago: string;
  monto: number;
  fecha: string;
  vehiculoFotoId: string | null;
  tipo: string;
}


interface GastosTablaProps {
  desde: string;
  hasta: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const QUIEN_PAGO_COLORS: Record<string, { bg: string; text: string }> = {
  concesionaria: { bg: "bg-blue-100", text: "text-blue-700" },
  vendedor: { bg: "bg-purple-100", text: "text-purple-700" },
  socio: { bg: "bg-amber-100", text: "text-amber-700" },
};

function getQuienPagoColor(quienPago: string) {
  const key = quienPago.toLowerCase();
  return (
    QUIEN_PAGO_COLORS[key] ?? { bg: "bg-zinc-100", text: "text-zinc-600" }
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPesos(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatFecha(fechaStr: string): string {
  try {
    return format(parseISO(fechaStr), "dd/MM/yyyy");
  } catch {
    return fechaStr;
  }
}


// ─── Componente principal ────────────────────────────────────────────────────

export function GastosTabla({ desde, hasta }: GastosTablaProps) {
  const router = useRouter();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtroQuienPago, setFiltroQuienPago] = useState("");
  const [pagina, setPagina] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchGastos = useCallback(async (d: string, h: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/gastos?desde=${d}&hasta=${h}`);
      if (!res.ok) throw new Error("Error al cargar los gastos");
      const data = await res.json();
      setGastos(data);
      setPagina(1);
    } catch {
      setError("No se pudieron cargar los gastos del período");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGastos(desde, hasta);
  }, [fetchGastos, desde, hasta]);

  // Valores únicos de quienPago para el selector
  const opcionesQuienPago = useMemo(() => {
    const set = new Set(gastos.map((g) => g.quienPago));
    return Array.from(set).sort();
  }, [gastos]);

  // Flat list filtrado y ordenado por fecha desc
  const gastosFiltrados = useMemo(() => {
    return gastos
      .filter((g) => filtroQuienPago === "" || g.quienPago === filtroQuienPago)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [gastos, filtroQuienPago]);

  // Paginación sobre gastos individuales
  const totalPaginas = Math.max(1, Math.ceil(gastosFiltrados.length / PAGE_SIZE));
  const gastosPagina = gastosFiltrados.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE
  );

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPagina(1);
  }, [filtroQuienPago]);

  const handleEliminarGasto = async (gastoId: string) => {
    setConfirmDeleteId(null);
    setDeletingId(gastoId);
    try {
      const res = await fetch(`/api/gastos/${gastoId}`, { method: "DELETE" });
      if (!res.ok) return;
      setGastos((prev) => prev.filter((g) => g.id !== gastoId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
    <div className="flex flex-col gap-0 rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-zinc-900">
          Listado de Movimientos
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector quién pagó */}
          <div className="relative">
            <select
              value={filtroQuienPago}
              onChange={(e) => setFiltroQuienPago(e.target.value)}
              aria-label="Filtrar por participante"
              className="h-9 appearance-none rounded-lg border border-zinc-300 bg-white py-0 pl-3 pr-8 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Participante (Todos)</option>
              {opcionesQuienPago.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <span
              className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base text-zinc-400"
              aria-hidden="true"
            >
              expand_more
            </span>
          </div>

          {/* Agregar movimiento */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            aria-label="Agregar movimiento"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">add</span>
            Agregar movimiento
          </button>
        </div>
      </div>

      {/* Contenido */}
      {error ? (
        <div
          className="flex items-center gap-3 p-6 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">
            error
          </span>
          {error}
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col gap-0">
                {/* Header skeleton */}
                <div className="grid grid-cols-[90px_140px_1fr_120px_90px_110px_40px] gap-4 border-b border-zinc-100 px-5 py-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-zinc-200" />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[90px_140px_1fr_120px_90px_110px_40px] gap-4 border-b border-zinc-100 px-5 py-3">
                    <div className="h-4 animate-pulse rounded bg-zinc-100" />
                    <div className="h-8 w-14 animate-pulse rounded bg-zinc-100" />
                    <div className="h-4 animate-pulse rounded bg-zinc-100" />
                    <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
                    <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-100" />
                    <div className="h-4 w-16 animate-pulse rounded bg-zinc-100 ml-auto" />
                    <div className="h-6 w-6 animate-pulse rounded bg-zinc-100" />
                  </div>
                ))}
              </div>
            ) : gastosPagina.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-2 py-14 text-zinc-400"
                role="status"
              >
                <span className="material-symbols-outlined text-4xl">receipt_long</span>
                <p className="text-sm">
                  {filtroQuienPago
                    ? "No hay movimientos para el participante seleccionado"
                    : "No hay movimientos en este período"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-200 w-[90px]">Fecha</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-200 w-[140px]">Operación</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-200">Descripción</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-200 w-[120px]">Origen</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-200 w-[90px]">Tipo</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-200 w-[110px]">Monto</th>
                    <th className="px-3 py-3 w-[40px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {gastosPagina.map((gasto) => {
                    const colorQuien = getQuienPagoColor(gasto.quienPago);
                    return (
                      <tr key={gasto.id} className="group hover:bg-zinc-50 transition-colors">
                        {/* Fecha */}
                        <td className="px-5 py-3 text-sm text-zinc-500 whitespace-nowrap">
                          {formatFecha(gasto.fecha)}
                        </td>

                        {/* Operación */}
                        <td className="px-3 py-3">
                          {gasto.vehiculoFotoId ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={`/api/photos/${gasto.vehiculoFotoId}`}
                                alt="Miniatura del vehículo"
                                className="h-8 w-12 rounded-md object-cover border border-zinc-200 flex-shrink-0"
                              />
                              {gasto.operacionId != null && (
                                <button
                                  type="button"
                                  onClick={() => router.push(`/operaciones/${gasto.operacionId}`)}
                                  className="text-xs font-semibold text-blue-600 hover:underline focus:outline-none rounded"
                                >
                                  #OP-{gasto.operacionId}
                                </button>
                              )}
                            </div>
                          ) : gasto.operacionId != null ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100">
                                <span className="material-symbols-outlined text-sm text-zinc-300">directions_car</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => router.push(`/operaciones/${gasto.operacionId}`)}
                                className="text-xs font-semibold text-blue-600 hover:underline focus:outline-none rounded"
                              >
                                #OP-{gasto.operacionId}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-300">—</span>
                          )}
                        </td>

                        {/* Descripción */}
                        <td className="px-3 py-3 text-sm font-medium text-zinc-800 max-w-0">
                          <span className="block truncate">{gasto.descripcion}</span>
                        </td>

                        {/* Origen */}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colorQuien.bg} ${colorQuien.text}`}>
                            {gasto.quienPago}
                          </span>
                        </td>

                        {/* Tipo */}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${gasto.tipo === "ingreso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {gasto.tipo === "ingreso" ? "Ingreso" : "Gasto"}
                          </span>
                        </td>

                        {/* Monto */}
                        <td className={`px-3 py-3 text-right text-sm font-bold whitespace-nowrap ${gasto.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                          {gasto.tipo === "ingreso" ? "+" : "-"}{formatPesos(gasto.monto)}
                        </td>

                        {/* Eliminar (solo sin operación) */}
                        <td className="px-3 py-3">
                          {gasto.operacionId === null && (
                            confirmDeleteId === gasto.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEliminarGasto(gasto.id)}
                                  disabled={deletingId === gasto.id}
                                  aria-label="Confirmar eliminación"
                                  className="flex h-6 items-center rounded bg-red-50 px-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40 focus:outline-none"
                                >
                                  Sí
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  aria-label="Cancelar eliminación"
                                  className="flex h-6 items-center rounded bg-zinc-100 px-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-200 focus:outline-none"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(gasto.id)}
                                disabled={deletingId === gasto.id}
                                aria-label="Eliminar gasto"
                                className="flex h-7 w-7 items-center justify-center rounded text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 disabled:opacity-40 focus:outline-none"
                              >
                                <span className="material-symbols-outlined text-base" aria-hidden="true">
                                  {deletingId === gasto.id ? "hourglass_empty" : "delete"}
                                </span>
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer con conteo y paginación */}
          {!loading && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 sm:flex-row">
              <p className="text-sm text-zinc-500">
                {gastosFiltrados.length === 0
                  ? "Sin registros"
                  : `Mostrando ${Math.min(
                      (pagina - 1) * PAGE_SIZE + 1,
                      gastosFiltrados.length
                    )}–${Math.min(
                      pagina * PAGE_SIZE,
                      gastosFiltrados.length
                    )} de ${gastosFiltrados.length} movimientos`}
              </p>
              {totalPaginas > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    aria-label="Página anterior"
                    className="h-8 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-zinc-500">
                    {pagina} / {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                    aria-label="Página siguiente"
                    className="h-8 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
      {showModal && (
        <MovimientoModal
          onClose={() => setShowModal(false)}
          onSaved={() => fetchGastos(desde, hasta)}
        />
      )}
    </>
  );
}
