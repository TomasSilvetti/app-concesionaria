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

interface GrupoOperacion {
  operacionId: string | null;
  gastos: Gasto[];
  totalGastado: number;
  fechaUltimoGasto: string;
  vehiculoFotoId: string | null;
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Valores únicos de quienPago para el selector
  const opcionesQuienPago = useMemo(() => {
    const set = new Set(gastos.map((g) => g.quienPago));
    return Array.from(set).sort();
  }, [gastos]);

  // Agrupar gastos por operacionId
  const grupos = useMemo(() => {
    const mapa = new Map<string, GrupoOperacion>();

    gastos.forEach((g) => {
      const key = g.operacionId ?? "__sin_operacion__";
      if (!mapa.has(key)) {
        mapa.set(key, {
          operacionId: g.operacionId,
          gastos: [],
          totalGastado: 0,
          fechaUltimoGasto: g.fecha,
          vehiculoFotoId: g.vehiculoFotoId,
        });
      }
      const grupo = mapa.get(key)!;
      grupo.gastos.push(g);
      if (g.tipo === "gasto") grupo.totalGastado += g.monto;
      if (g.fecha > grupo.fechaUltimoGasto) {
        grupo.fechaUltimoGasto = g.fecha;
      }
    });

    return Array.from(mapa.values());
  }, [gastos]);

  // Filtrado sobre grupos
  const gruposFiltrados = useMemo(() => {
    return grupos.filter((gr) => {
      const matchQuien =
        filtroQuienPago === "" ||
        gr.gastos.some((g) => g.quienPago === filtroQuienPago);
      return matchQuien;
    });
  }, [grupos, filtroQuienPago]);

  // Paginación sobre grupos
  const totalPaginas = Math.max(1, Math.ceil(gruposFiltrados.length / PAGE_SIZE));
  const gruposPagina = gruposFiltrados.slice(
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
          {/* Cards */}
          <div className="flex flex-col gap-3 p-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4" aria-hidden="true">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 animate-pulse rounded-md bg-zinc-200 flex-shrink-0" />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                      <div className="h-3 w-32 animate-pulse rounded bg-zinc-200" />
                    </div>
                    <div className="h-5 w-20 animate-pulse rounded bg-zinc-200" />
                  </div>
                </div>
              ))
            ) : gruposPagina.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-2 py-14 text-zinc-400"
                role="status"
                aria-label="Sin gastos para los filtros aplicados"
              >
                <span className="material-symbols-outlined text-4xl">
                  receipt_long
                </span>
                <p className="text-sm">
                  {filtroQuienPago
                    ? "No hay movimientos para el participante seleccionado"
                    : "No hay movimientos en este período"}
                </p>
              </div>
            ) : (
              gruposPagina.map((grupo) => {
                const key = grupo.operacionId ?? "__sin_operacion__";
                const isExpanded = expanded.has(key);
                const gastosVisibles = filtroQuienPago
                  ? grupo.gastos.filter((g) => g.quienPago === filtroQuienPago)
                  : grupo.gastos;

                return (
                  <div
                    key={key}
                    className={`rounded-xl border shadow-sm transition-colors ${
                      isExpanded ? "border-blue-200 bg-blue-50/20" : "border-zinc-200 bg-white"
                    }`}
                  >
                    {/* Cabecera card */}
                    <button
                      onClick={() => toggleExpand(key)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                      aria-expanded={isExpanded}
                      aria-label={`Expandir grupo ${grupo.operacionId ?? "sin operación"}`}
                    >
                      <span
                        className={`material-symbols-outlined text-xl text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>

                      {/* Thumbnail */}
                      {grupo.vehiculoFotoId ? (
                        <img
                          src={`/api/photos/${grupo.vehiculoFotoId}`}
                          alt="Miniatura del vehículo"
                          className="h-10 w-14 rounded-md object-cover border border-zinc-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100">
                          <span className="material-symbols-outlined text-base text-zinc-300">
                            directions_car
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        {grupo.operacionId != null ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/operaciones/${grupo.operacionId}`);
                            }}
                            className="w-fit text-base font-semibold text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                          >
                            #OP-{grupo.operacionId}
                          </button>
                        ) : (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                            <span className="material-symbols-outlined text-xs" aria-hidden="true">link_off</span>
                            Sin operación
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">
                          Último movimiento: {formatFecha(grupo.fechaUltimoGasto)}
                        </span>
                      </div>

                      {/* Total */}
                      <span className="flex-shrink-0 text-sm font-semibold text-red-800">
                        {formatPesos(grupo.totalGastado)}
                      </span>
                    </button>

                    {/* Gastos expandidos */}
                    {isExpanded && (
                      <div className="border-t border-blue-100 bg-blue-50/20 px-4 pb-4 pt-3">
                        <div className="flex flex-col gap-2">
                          {gastosVisibles.map((gasto) => {
                            const colorQuien = getQuienPagoColor(gasto.quienPago);
                            return (
                              <div
                                key={gasto.id}
                                className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-3"
                              >
                                <div className="flex flex-1 items-start gap-4 min-w-0">
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700/60">Fecha</span>
                                    <span className="text-sm text-zinc-700 whitespace-nowrap">{formatFecha(gasto.fecha)}</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700/60">Categoría</span>
                                    <span className="text-sm text-zinc-700 truncate">{gasto.descripcion}</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700/60">Participante</span>
                                    <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colorQuien.bg} ${colorQuien.text}`}>
                                      {gasto.quienPago}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700/60">Tipo</span>
                                    <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold ${gasto.tipo === "ingreso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                      {gasto.tipo === "ingreso" ? "Ingreso" : "Gasto"}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-0.5 items-end">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700/60">Monto</span>
                                    <span className={`text-sm font-medium whitespace-nowrap ${gasto.tipo === "ingreso" ? "text-green-600" : "text-red-500"}`}>
                                      {gasto.tipo === "ingreso" ? "+" : "-"}{formatPesos(gasto.monto)}
                                    </span>
                                  </div>
                                </div>
                                {gasto.operacionId === null && (
                                  confirmDeleteId === gasto.id ? (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleEliminarGasto(gasto.id)}
                                        disabled={deletingId === gasto.id}
                                        aria-label="Confirmar eliminación"
                                        className="flex h-7 items-center rounded-lg bg-red-50 px-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                                      >
                                        Sí
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        aria-label="Cancelar eliminación"
                                        className="flex h-7 items-center rounded-lg bg-zinc-100 px-2 text-xs font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
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
                                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                                    >
                                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                                        {deletingId === gasto.id ? "hourglass_empty" : "delete"}
                                      </span>
                                    </button>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer con conteo y paginación */}
          {!loading && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 sm:flex-row">
              <p className="text-sm text-zinc-500">
                {gruposFiltrados.length === 0
                  ? "Sin registros"
                  : `Mostrando ${Math.min(
                      (pagina - 1) * PAGE_SIZE + 1,
                      gruposFiltrados.length
                    )}–${Math.min(
                      pagina * PAGE_SIZE,
                      gruposFiltrados.length
                    )} de ${gruposFiltrados.length} operaciones`}
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
