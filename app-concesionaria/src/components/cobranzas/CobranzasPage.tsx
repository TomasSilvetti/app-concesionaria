"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "material-symbols/outlined.css";

interface PagoCobranza {
  fecha: string;
  metodoPago: string;
  monto: number;
  nota: string | null;
  deuda: number;
}

interface OperacionCobranza {
  idOperacion: number;
  nombreComprador: string;
  precioVentaTotal: number;
  saldado: number;
  pendiente: number;
  pagos: PagoCobranza[];
  vehiculoId: string | null;
  vehiculoFotoId: string | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function CobranzasPage() {
  const [operaciones, setOperaciones] = useState<OperacionCobranza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const router = useRouter();

  const fetchCobranzas = useCallback(async (todas: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cobranzas?mostrarTodas=${todas}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOperaciones(data.operaciones ?? []);
    } catch {
      setError("No se pudieron cargar las cobranzas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCobranzas(mostrarTodas);
  }, [fetchCobranzas, mostrarTodas]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="material-symbols-outlined text-3xl text-white">
              payments
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Cobranzas</h1>
            <p className="text-sm text-zinc-500">
              Seguimiento de pagos y deuda pendiente por operación.
            </p>
          </div>
        </div>

        {/* Checkbox Mostrar todas */}
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 shadow-sm transition-colors hover:bg-zinc-50">
          <input
            type="checkbox"
            id="mostrar-todas"
            checked={mostrarTodas}
            onChange={(e) => setMostrarTodas(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-zinc-700">
            Mostrar todas
          </span>
          <span className="material-symbols-outlined text-base text-zinc-400">
            check_circle
          </span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">
            error
          </span>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
            progress_activity
          </span>
          <p className="mt-4 text-sm text-zinc-600">Cargando cobranzas...</p>
        </div>
      )}

      {/* Tabla desktop */}
      {!loading && !error && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-zinc-200 lg:block">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Operación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Comprador
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Precio Total
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Saldado
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Pendiente
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {operaciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                          <span className="material-symbols-outlined text-4xl text-zinc-400">
                            payments
                          </span>
                        </div>
                        <p className="mt-4 text-base font-medium text-zinc-900">
                          Sin operaciones pendientes
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {mostrarTodas
                            ? "No hay operaciones registradas"
                            : "Todas las operaciones están saldadas"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  operaciones.map((op) => {
                    const isExpanded = expanded.has(op.idOperacion);
                    const isSaldada = op.pendiente === 0;
                    return (
                      <React.Fragment key={op.idOperacion}>
                        {/* Fila padre */}
                        <tr
                          className={`cursor-pointer transition-colors hover:bg-zinc-50 ${
                            isExpanded ? "bg-blue-50/40" : ""
                          }`}
                          onClick={() => toggleExpand(op.idOperacion)}
                        >
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`material-symbols-outlined text-lg text-zinc-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            >
                              expand_more
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/operaciones/${op.idOperacion}`);
                                }}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                                aria-label={`Ver operación ${op.idOperacion}`}
                              >
                                #{op.idOperacion}
                              </button>
                              {op.vehiculoId && op.vehiculoFotoId ? (
                                <img
                                  src={`/api/stock/${op.vehiculoId}/photos/${op.vehiculoFotoId}`}
                                  alt=""
                                  className="h-10 w-14 rounded-md object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100">
                                  <span className="material-symbols-outlined text-base text-zinc-400">
                                    directions_car
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-zinc-900">
                              {op.nombreComprador}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <span className="text-sm text-zinc-500">
                              {formatCurrency(op.precioVentaTotal)}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(op.saldado)}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <span
                              className={`text-sm font-semibold ${
                                isSaldada ? "text-zinc-400" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(op.pendiente)}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-left">
                            {isSaldada ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                <span className="material-symbols-outlined text-sm">
                                  check_circle
                                </span>
                                Saldado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Pendiente
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Filas hijas */}
                        {isExpanded && (
                          <>
                            {op.pagos.length === 0 ? (
                              <tr className="bg-zinc-50/60">
                                <td colSpan={7} className="px-12 py-3 text-sm text-zinc-400 italic">
                                  Sin pagos registrados
                                </td>
                              </tr>
                            ) : (
                              <>
                                {/* Encabezado subfilas */}
                                <tr className="bg-zinc-50/80">
                                  <td />
                                  <td className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Fecha
                                  </td>
                                  <td colSpan={2} className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Forma de pago
                                  </td>
                                  <td className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Monto
                                  </td>
                                  <td className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Deuda tras pago
                                  </td>
                                  <td className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Nota
                                  </td>
                                </tr>
                                {op.pagos.map((pago, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-t border-zinc-100 bg-blue-50/20"
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                                      </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-zinc-700">
                                      {formatDate(pago.fecha)}
                                    </td>
                                    <td colSpan={2} className="px-6 py-3 text-sm text-zinc-600">
                                      {pago.metodoPago}
                                    </td>
                                    <td className="px-3 py-3 text-right text-sm font-medium text-zinc-900">
                                      {formatCurrency(pago.monto)}
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                      <span
                                        className={`text-sm font-semibold ${
                                          pago.deuda === 0
                                            ? "text-green-600"
                                            : "text-red-500"
                                        }`}
                                      >
                                        {formatCurrency(pago.deuda)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-left text-sm text-zinc-500">
                                      {pago.nota ?? (
                                        <span className="text-zinc-300">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="flex flex-col gap-3 lg:hidden">
            {operaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                  <span className="material-symbols-outlined text-4xl text-zinc-400">
                    payments
                  </span>
                </div>
                <p className="mt-4 text-base font-medium text-zinc-900">
                  Sin operaciones pendientes
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {mostrarTodas
                    ? "No hay operaciones registradas"
                    : "Todas las operaciones están saldadas"}
                </p>
              </div>
            ) : (
              operaciones.map((op) => {
                const isExpanded = expanded.has(op.idOperacion);
                const isSaldada = op.pendiente === 0;
                return (
                  <div
                    key={op.idOperacion}
                    className="rounded-xl border border-zinc-200 bg-white shadow-sm"
                  >
                    {/* Cabecera card */}
                    <button
                      onClick={() => toggleExpand(op.idOperacion)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                      aria-expanded={isExpanded}
                      aria-label={`Expandir operación ${op.idOperacion}`}
                    >
                      <span
                        className={`material-symbols-outlined text-xl text-zinc-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/operaciones/${op.idOperacion}`);
                              }}
                              className="text-base font-semibold text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                            >
                              #{op.idOperacion}
                            </button>
                            {op.vehiculoId && op.vehiculoFotoId ? (
                              <img
                                src={`/api/stock/${op.vehiculoId}/photos/${op.vehiculoFotoId}`}
                                alt=""
                                className="h-8 w-12 rounded-md object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100">
                                <span className="material-symbols-outlined text-sm text-zinc-400">
                                  directions_car
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-zinc-700">
                              {op.nombreComprador}
                            </span>
                          </div>
                          {isSaldada ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                              <span className="material-symbols-outlined text-xs">
                                check_circle
                              </span>
                              Saldado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Pendiente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-zinc-500">
                            Saldado:{" "}
                            <span className="font-semibold text-green-600">
                              {formatCurrency(op.saldado)}
                            </span>
                          </span>
                          <span className="text-zinc-500">
                            Pendiente:{" "}
                            <span
                              className={`font-semibold ${
                                isSaldada ? "text-zinc-400" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(op.pendiente)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Pagos expandidos */}
                    {isExpanded && (
                      <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
                        {op.pagos.length === 0 ? (
                          <p className="text-sm italic text-zinc-400">
                            Sin pagos registrados
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {op.pagos.map((pago, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-zinc-700">
                                    {formatDate(pago.fecha)} · {pago.metodoPago}
                                  </span>
                                  <span className="text-sm font-semibold text-zinc-900">
                                    {formatCurrency(pago.monto)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-zinc-400">
                                    {pago.nota ?? "Sin nota"}
                                  </span>
                                  <span
                                    className={`text-xs font-medium ${
                                      pago.deuda === 0
                                        ? "text-green-600"
                                        : "text-red-500"
                                    }`}
                                  >
                                    Deuda: {formatCurrency(pago.deuda)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
