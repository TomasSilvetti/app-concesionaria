"use client";

import React, { useState, useEffect, useCallback } from "react";
import "material-symbols/outlined.css";
import { MovimientoModal, MovimientoEditing } from "@/components/gastos/MovimientoModal";

type TipoMovimiento = "gasto" | "ingreso";

interface GastoOperacion {
  id: string;
  descripcion: string;
  monto: number;
  origenId: string;
  origenNombre: string;
  categoriaId: string;
  categoriaNombre: string;
  tipo: TipoMovimiento;
}

interface Props {
  operacionId: string;
  onTotalChange?: (total: number) => void;
  onIngresosChange?: (total: number) => void;
  readOnly?: boolean;
}

export function OperationExpensesSection({ operacionId, onTotalChange, onIngresosChange, readOnly = false }: Props) {
  const [movimientos, setMovimientos] = useState<GastoOperacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<MovimientoEditing | null>(null);

  // Delete confirmation (list)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);

  const fetchMovimientos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/operations/${operacionId}/expenses`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMovimientos(data.gastos ?? []);
    } catch {
      setError("No se pudieron cargar los movimientos");
    } finally {
      setLoading(false);
    }
  }, [operacionId]);

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  const totalGastos = movimientos.filter(m => m.tipo === "gasto").reduce((sum, m) => sum + m.monto, 0);
  const totalIngresos = movimientos.filter(m => m.tipo === "ingreso").reduce((sum, m) => sum + m.monto, 0);

  useEffect(() => {
    onTotalChange?.(totalGastos);
  }, [totalGastos, onTotalChange]);

  useEffect(() => {
    onIngresosChange?.(totalIngresos);
  }, [totalIngresos, onIngresosChange]);

  const resumenPorParticipante = movimientos.reduce<Record<string, { gastos: number; ingresos: number }>>((acc, m) => {
    const nombre = m.origenNombre || "Sin asignar";
    if (!acc[nombre]) acc[nombre] = { gastos: 0, ingresos: 0 };
    if (m.tipo === "gasto") acc[nombre].gastos += m.monto;
    else acc[nombre].ingresos += m.monto;
    return acc;
  }, {});

  const openCreate = () => {
    setEditingGasto(null);
    setShowModal(true);
  };

  const openEdit = (gasto: GastoOperacion) => {
    setEditingGasto(gasto);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/operations/${operacionId}/expenses/${id}`, { method: "DELETE" });
      setMovimientos((prev) => prev.filter((m) => m.id !== id));
      setDeletingId(null);
    } catch {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              swap_horiz
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">Módulo de Movimientos</h2>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Agregar movimiento"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Agregar
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-2xl text-blue-600">
                progress_activity
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Descripción
                      </th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Participante
                      </th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Tipo
                      </th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                        Monto
                      </th>
                      <th className="pb-3 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {movimientos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-zinc-400">
                          Sin movimientos cargados
                        </td>
                      </tr>
                    ) : (
                      movimientos.map((m) => (
                        <tr key={m.id} className="group">
                          <td className="py-3 pr-4 text-sm text-zinc-900">{m.descripcion}</td>
                          <td className="py-3 pr-4 text-sm text-zinc-500">{m.origenNombre}</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                m.tipo === "gasto"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {m.tipo === "gasto" ? "Gasto" : "Ingreso"}
                            </span>
                          </td>
                          <td className={`py-3 text-right text-sm font-medium ${m.tipo === "gasto" ? "text-red-600" : "text-green-600"}`}>
                            {m.tipo === "gasto" ? "-" : "+"}{formatCurrency(m.monto)}
                          </td>
                          <td className="py-3">
                            {deletingId === m.id ? (
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(m.id)}
                                  className="flex h-6 items-center rounded bg-red-600 px-2 text-xs font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                  Sí
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="flex h-6 items-center rounded border border-zinc-300 bg-white px-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                {!readOnly && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEdit(m)}
                                      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                      aria-label="Editar movimiento"
                                    >
                                      <span className="material-symbols-outlined text-base">edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingId(m.id)}
                                      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                      aria-label="Eliminar movimiento"
                                    >
                                      <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-200">
                      <td colSpan={3} className="pt-3 text-sm font-bold text-zinc-900">
                        Total gastos
                      </td>
                      <td className="pt-3 text-right text-sm font-bold text-red-600">
                        -{formatCurrency(totalGastos)}
                      </td>
                      <td />
                    </tr>
                    {totalIngresos > 0 && (
                      <tr>
                        <td colSpan={3} className="pt-1 text-sm font-bold text-zinc-900">
                          Total ingresos
                        </td>
                        <td className="pt-1 text-right text-sm font-bold text-green-600">
                          +{formatCurrency(totalIngresos)}
                        </td>
                        <td />
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              {/* Resumen por participante */}
              {Object.keys(resumenPorParticipante).length > 0 && (
                <div className="border-t border-zinc-100 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Resumen por participante
                  </p>
                  <div className="divide-y divide-zinc-100">
                    {Object.entries(resumenPorParticipante).map(([nombre, { gastos, ingresos }]) => (
                      <div key={nombre} className="flex items-center justify-between py-2">
                        <span className="text-sm text-zinc-700">{nombre}</span>
                        <div className="flex items-center gap-3">
                          {gastos > 0 && (
                            <span className="text-sm font-semibold text-red-600">-{formatCurrency(gastos)}</span>
                          )}
                          {ingresos > 0 && (
                            <span className="text-sm font-semibold text-green-600">+{formatCurrency(ingresos)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <MovimientoModal
          operacionId={operacionId}
          editingGasto={editingGasto}
          onClose={() => setShowModal(false)}
          onSaved={fetchMovimientos}
        />
      )}
    </>
  );
}
