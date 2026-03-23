"use client";

import React, { useState, useEffect, useCallback } from "react";
import "material-symbols/outlined.css";
import { NumericInput } from "@/components/ui/NumericInput";

interface GastoOperacion {
  id: string;
  descripcion: string;
  monto: number;
  origenId: string;
  origenNombre: string;
  categoriaId: string;
  categoriaNombre: string;
}

interface OpcionSelector {
  id: string;
  nombre: string;
}

interface Props {
  operacionId: string;
  onTotalChange?: (total: number) => void;
  readOnly?: boolean;
}

export function OperationExpensesSection({ operacionId, onTotalChange, readOnly = false }: Props) {
  const [gastos, setGastos] = useState<GastoOperacion[]>([]);
  const [origins, setOrigins] = useState<OpcionSelector[]>([]);
  const [categories, setCategories] = useState<OpcionSelector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<GastoOperacion | null>(null);
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formMonto, setFormMonto] = useState("");
  const [formOrigenId, setFormOrigenId] = useState("");
  const [formCategoriaId, setFormCategoriaId] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline create state
  const [nuevoOrigenNombre, setNuevoOrigenNombre] = useState("");
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [creatingOrigen, setCreatingOrigen] = useState(false);
  const [creatingCat, setCreatingCat] = useState(false);
  const [showOrigenInput, setShowOrigenInput] = useState(false);
  const [showCatInput, setShowCatInput] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);

  const fetchGastos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/operations/${operacionId}/expenses`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGastos(data.gastos ?? []);
    } catch {
      setError("No se pudieron cargar los gastos");
    } finally {
      setLoading(false);
    }
  }, [operacionId]);

  const fetchOrigins = useCallback(async () => {
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/origins`);
      if (res.ok) {
        const data = await res.json();
        setOrigins(data.origins ?? []);
      }
    } catch {
      // silently fail
    }
  }, [operacionId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories ?? []);
      }
    } catch {
      // silently fail
    }
  }, [operacionId]);

  useEffect(() => {
    fetchGastos();
    fetchOrigins();
    fetchCategories();
  }, [fetchGastos, fetchOrigins, fetchCategories]);

  const total = gastos.reduce((sum, g) => sum + g.monto, 0);

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  const resumenPorParticipante = gastos.reduce<Record<string, number>>((acc, g) => {
    const nombre = g.origenNombre || "Sin asignar";
    acc[nombre] = (acc[nombre] ?? 0) + g.monto;
    return acc;
  }, {});

  const openCreate = () => {
    setEditingGasto(null);
    setFormDescripcion("");
    setFormMonto("");
    setFormOrigenId("");
    setFormCategoriaId("");
    setFormError("");
    setNuevoOrigenNombre("");
    setNuevaCatNombre("");
    setShowOrigenInput(false);
    setShowCatInput(false);
    setShowModal(true);
  };

  const openEdit = (gasto: GastoOperacion) => {
    setEditingGasto(gasto);
    setFormDescripcion(gasto.descripcion);
    setFormMonto(String(gasto.monto));
    setFormOrigenId(gasto.origenId);
    setFormCategoriaId(gasto.categoriaId);
    setFormError("");
    setNuevoOrigenNombre("");
    setNuevaCatNombre("");
    setShowOrigenInput(false);
    setShowCatInput(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGasto(null);
    setFormDescripcion("");
    setFormMonto("");
    setFormOrigenId("");
    setFormCategoriaId("");
    setFormError("");
    setNuevoOrigenNombre("");
    setNuevaCatNombre("");
    setShowOrigenInput(false);
    setShowCatInput(false);
  };

  const handleCrearOrigen = async () => {
    if (!nuevoOrigenNombre.trim()) return;
    setCreatingOrigen(true);
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/origins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoOrigenNombre.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? "Error al crear origen");
        return;
      }
      const data = await res.json();
      const newOrigin: OpcionSelector = data.origin;
      setOrigins((prev) => [...prev, newOrigin]);
      setFormOrigenId(newOrigin.id);
      setNuevoOrigenNombre("");
      setShowOrigenInput(false);
    } catch {
      setFormError("Error al crear origen");
    } finally {
      setCreatingOrigen(false);
    }
  };

  const handleCrearCategoria = async () => {
    if (!nuevaCatNombre.trim()) return;
    setCreatingCat(true);
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaCatNombre.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? "Error al crear categoría");
        return;
      }
      const data = await res.json();
      const newCat: OpcionSelector = data.category;
      setCategories((prev) => [...prev, newCat]);
      setFormCategoriaId(newCat.id);
      setNuevaCatNombre("");
      setShowCatInput(false);
    } catch {
      setFormError("Error al crear categoría");
    } finally {
      setCreatingCat(false);
    }
  };

  const handleSave = async () => {
    if (!formDescripcion.trim()) {
      setFormError("La descripción es requerida");
      return;
    }
    if (!formOrigenId) {
      setFormError("Seleccioná quién pagó");
      return;
    }
    if (!formCategoriaId) {
      setFormError("Seleccioná una categoría");
      return;
    }
    const monto = parseFloat(formMonto);
    if (!formMonto || isNaN(monto) || monto <= 0) {
      setFormError("Ingresá un monto válido mayor a 0");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const url = editingGasto
        ? `/api/operations/${operacionId}/expenses/${editingGasto.id}`
        : `/api/operations/${operacionId}/expenses`;
      const method = editingGasto ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: formDescripcion.trim(),
          monto,
          origenId: formOrigenId,
          categoriaId: formCategoriaId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? "Error al guardar el gasto");
        return;
      }

      closeModal();
      await fetchGastos();
    } catch {
      setFormError("Error al guardar el gasto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/operations/${operacionId}/expenses/${id}`, { method: "DELETE" });
      setGastos((prev) => prev.filter((g) => g.id !== id));
      setDeletingId(null);
    } catch {
      setDeletingId(null);
    }
  };

  const isSaveDisabled =
    !formDescripcion.trim() ||
    !formOrigenId ||
    !formCategoriaId ||
    !formMonto ||
    parseFloat(formMonto) <= 0 ||
    saving;

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              monetization_on
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">Módulo de Gastos</h2>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Agregar gasto"
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
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Descripción
                      </th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Quién pagó
                      </th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Monto
                      </th>
                      <th className="pb-3 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {gastos.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-zinc-400">
                          Sin gastos cargados
                        </td>
                      </tr>
                    ) : (
                      gastos.map((gasto) => (
                        <tr key={gasto.id} className="group">
                          <td className="py-3 pr-4 text-sm text-zinc-900">{gasto.descripcion}</td>
                          <td className="py-3 pr-4 text-sm text-zinc-500">{gasto.origenNombre}</td>
                          <td className="py-3 text-right text-sm font-medium text-zinc-900">
                            {formatCurrency(gasto.monto)}
                          </td>
                          <td className="py-3">
                            {deletingId === gasto.id ? (
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(gasto.id)}
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
                                <button
                                  type="button"
                                  onClick={() => openEdit(gasto)}
                                  className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                  aria-label="Editar gasto"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(gasto.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                  aria-label="Eliminar gasto"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-200">
                      <td colSpan={2} className="pt-3 text-sm font-bold text-zinc-900">
                        Total
                      </td>
                      <td className="pt-3 text-right text-sm font-bold text-blue-600">
                        {formatCurrency(total)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Resumen por quién pagó */}
              {Object.keys(resumenPorParticipante).length > 0 && (
                <div className="border-t border-zinc-100 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Resumen por quién pagó
                  </p>
                  <div className="divide-y divide-zinc-100">
                    {Object.entries(resumenPorParticipante).map(([nombre, subtotal]) => (
                      <div key={nombre} className="flex items-center justify-between py-2">
                        <span className="text-sm text-zinc-700">{nombre}</span>
                        <span className="text-sm font-semibold text-zinc-900">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal agregar/editar */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingGasto ? "Editar gasto" : "Agregar gasto"}
        >
          <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-blue-600">
                  {editingGasto ? "edit" : "add_circle"}
                </span>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {editingGasto ? "Editar gasto" : "Agregar gasto"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 px-6 py-5">
              {/* Descripción */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gasto-descripcion" className="text-sm font-medium text-zinc-700">
                  Descripción
                </label>
                <input
                  id="gasto-descripcion"
                  type="text"
                  value={formDescripcion}
                  onChange={(e) => { const v = e.target.value; setFormDescripcion(v.charAt(0).toUpperCase() + v.slice(1)); }}
                  placeholder="Ej: Limpieza, service, patente..."
                  disabled={saving}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {/* Quién pagó (Origin) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gasto-origen" className="text-sm font-medium text-zinc-700">
                  Quién pagó
                </label>
                <select
                  id="gasto-origen"
                  value={formOrigenId}
                  onChange={(e) => setFormOrigenId(e.target.value)}
                  disabled={saving}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  <option value="">Seleccionar...</option>
                  {origins.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
                {showOrigenInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevoOrigenNombre}
                      onChange={(e) => setNuevoOrigenNombre(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCrearOrigen(); } }}
                      placeholder="Nombre del pagador..."
                      disabled={saving || creatingOrigen}
                      autoFocus
                      className="h-8 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleCrearOrigen}
                      disabled={!nuevoOrigenNombre.trim() || saving || creatingOrigen}
                      className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                    >
                      {creatingOrigen ? (
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowOrigenInput(false); setNuevoOrigenNombre(""); }}
                      disabled={saving || creatingOrigen}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-40"
                      aria-label="Cancelar"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowOrigenInput(true)}
                    disabled={saving}
                    className="flex h-8 w-fit items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Agregar nuevo
                  </button>
                )}
              </div>

              {/* Categoría */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gasto-categoria" className="text-sm font-medium text-zinc-700">
                  Categoría
                </label>
                <select
                  id="gasto-categoria"
                  value={formCategoriaId}
                  onChange={(e) => setFormCategoriaId(e.target.value)}
                  disabled={saving}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {showCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevaCatNombre}
                      onChange={(e) => setNuevaCatNombre(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCrearCategoria(); } }}
                      placeholder="Nombre de la categoría..."
                      disabled={saving || creatingCat}
                      autoFocus
                      className="h-8 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleCrearCategoria}
                      disabled={!nuevaCatNombre.trim() || saving || creatingCat}
                      className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                    >
                      {creatingCat ? (
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCatInput(false); setNuevaCatNombre(""); }}
                      disabled={saving || creatingCat}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-40"
                      aria-label="Cancelar"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCatInput(true)}
                    disabled={saving}
                    className="flex h-8 w-fit items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Agregar nueva
                  </button>
                )}
              </div>

              {/* Monto */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gasto-monto" className="text-sm font-medium text-zinc-700">
                  Monto
                </label>
                <NumericInput
                  id="gasto-monto"
                  value={formMonto}
                  onChange={setFormMonto}
                  placeholder="0"
                  disabled={saving}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {formError}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                )}
                {editingGasto ? "Guardar cambios" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
