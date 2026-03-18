"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import "material-symbols/outlined.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Gasto {
  id: number;
  operacionId: number;
  descripcion: string;
  quienPago: string;
  monto: number;
  fecha: string;
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
    return format(parseISO(fechaStr), "dd MMM yyyy", { locale: es });
  } catch {
    return fechaStr;
  }
}

function exportarCSV(gastos: Gasto[]) {
  const headers = ["ID Operación", "Descripción", "Quién pagó", "Monto", "Fecha"];
  const rows = gastos.map((g) => [
    `#OP-${g.operacionId}`,
    `"${g.descripcion.replace(/"/g, '""')}"`,
    g.quienPago,
    g.monto,
    g.fecha,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gastos.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente principal ────────────────────────────────────────────────────

export function GastosTabla({ desde, hasta }: GastosTablaProps) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtroOperacion, setFiltroOperacion] = useState("");
  const [filtroQuienPago, setFiltroQuienPago] = useState("");
  const [pagina, setPagina] = useState(1);

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

  // Filtrado
  const gastosFiltrados = useMemo(() => {
    return gastos.filter((g) => {
      const matchOp =
        filtroOperacion.trim() === "" ||
        String(g.operacionId).includes(filtroOperacion.trim());
      const matchQuien =
        filtroQuienPago === "" || g.quienPago === filtroQuienPago;
      return matchOp && matchQuien;
    });
  }, [gastos, filtroOperacion, filtroQuienPago]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(gastosFiltrados.length / PAGE_SIZE));
  const gastosPagina = gastosFiltrados.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE
  );

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPagina(1);
  }, [filtroOperacion, filtroQuienPago]);

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-zinc-900">
          Listado de Gastos
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador operación */}
          <div className="relative">
            <span
              className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-zinc-400"
              aria-hidden="true"
            >
              search
            </span>
            <input
              type="text"
              value={filtroOperacion}
              onChange={(e) => setFiltroOperacion(e.target.value)}
              placeholder="ID Operación..."
              aria-label="Filtrar por ID de operación"
              className="h-9 w-44 rounded-lg border border-zinc-300 bg-white pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Selector quién pagó */}
          <div className="relative">
            <select
              value={filtroQuienPago}
              onChange={(e) => setFiltroQuienPago(e.target.value)}
              aria-label="Filtrar por quién pagó"
              className="h-9 appearance-none rounded-lg border border-zinc-300 bg-white py-0 pl-3 pr-8 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Quién pagó (Todos)</option>
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

          {/* Exportar CSV */}
          <button
            type="button"
            onClick={() => exportarCSV(gastosFiltrados)}
            disabled={gastosFiltrados.length === 0}
            aria-label="Exportar gastos a CSV"
            className="h-9 rounded-lg px-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Exportar CSV
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
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    ID Operación
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Descripción
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Quién pagó
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Monto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Fecha
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-zinc-100" aria-hidden="true">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 animate-pulse rounded bg-zinc-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : gastosPagina.length === 0 ? (
                  // Estado vacío
                  <tr>
                    <td colSpan={6}>
                      <div
                        className="flex flex-col items-center justify-center gap-2 py-14 text-zinc-400"
                        role="status"
                        aria-label="Sin gastos para los filtros aplicados"
                      >
                        <span className="material-symbols-outlined text-4xl">
                          receipt_long
                        </span>
                        <p className="text-sm">
                          {filtroOperacion || filtroQuienPago
                            ? "No hay gastos para los filtros aplicados"
                            : "No hay gastos en este período"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  gastosPagina.map((gasto) => {
                    const colorQuien = getQuienPagoColor(gasto.quienPago);
                    return (
                      <tr
                        key={gasto.id}
                        className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                      >
                        <td className="px-5 py-4">
                          <span className="font-medium text-blue-600">
                            #OP-{gasto.operacionId}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-zinc-700">
                          {gasto.descripcion}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorQuien.bg} ${colorQuien.text}`}
                          >
                            {gasto.quienPago}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-zinc-900">
                          {formatPesos(gasto.monto)}
                        </td>
                        <td className="px-5 py-4 text-zinc-500">
                          {formatFecha(gasto.fecha)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <AccionesMenu gastoId={gasto.id} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
                    )} de ${gastosFiltrados.length} registros`}
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
  );
}

// ─── Menú de acciones ─────────────────────────────────────────────────────────

function AccionesMenu({ gastoId }: { gastoId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Acciones para gasto ${gastoId}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          more_vert
        </span>
      </button>

      {open && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-10"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-36 origin-top-right rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none"
            >
              <span className="material-symbols-outlined text-base text-zinc-400" aria-hidden="true">
                edit
              </span>
              Editar
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
            >
              <span className="material-symbols-outlined text-base text-red-400" aria-hidden="true">
                delete
              </span>
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
