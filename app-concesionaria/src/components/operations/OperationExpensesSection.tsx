"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

  // Origen search
  const [origenQuery, setOrigenQuery] = useState("");
  const [origenDropdown, setOrigenDropdown] = useState(false);
  const [isSavingOrigen, setIsSavingOrigen] = useState(false);
  const [confirmDeleteOrigenId, setConfirmDeleteOrigenId] = useState<string | null>(null);
  const [isDeletingOrigenId, setIsDeletingOrigenId] = useState<string | null>(null);
  const [deletedOrigenIds, setDeletedOrigenIds] = useState<Set<string>>(new Set());
  const origenInputRef = useRef<HTMLInputElement>(null);
  const origenDropdownRef = useRef<HTMLDivElement>(null);

  // Categoría search
  const [categoriaQuery, setCategoriaQuery] = useState("");
  const [categoriaDropdown, setCategoriaDropdown] = useState(false);
  const [isSavingCategoria, setIsSavingCategoria] = useState(false);
  const [confirmDeleteCategoriaId, setConfirmDeleteCategoriaId] = useState<string | null>(null);
  const [isDeletingCategoriaId, setIsDeletingCategoriaId] = useState<string | null>(null);
  const [deletedCategoriaIds, setDeletedCategoriaIds] = useState<Set<string>>(new Set());
  const categoriaInputRef = useRef<HTMLInputElement>(null);
  const categoriaDropdownRef = useRef<HTMLDivElement>(null);

  // Delete confirmation (gasto list)
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

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        origenDropdownRef.current && !origenDropdownRef.current.contains(e.target as Node) &&
        origenInputRef.current && !origenInputRef.current.contains(e.target as Node)
      ) setOrigenDropdown(false);
      if (
        categoriaDropdownRef.current && !categoriaDropdownRef.current.contains(e.target as Node) &&
        categoriaInputRef.current && !categoriaInputRef.current.contains(e.target as Node)
      ) setCategoriaDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const total = gastos.reduce((sum, g) => sum + g.monto, 0);

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  const resumenPorParticipante = gastos.reduce<Record<string, number>>((acc, g) => {
    const nombre = g.origenNombre || "Sin asignar";
    acc[nombre] = (acc[nombre] ?? 0) + g.monto;
    return acc;
  }, {});

  // Search results
  const origenResultados = origins.filter(
    (o) => !deletedOrigenIds.has(o.id) && o.nombre.toLowerCase().includes(origenQuery.toLowerCase())
  );
  const puedoCrearOrigen =
    origenQuery.trim().length > 0 &&
    !origenResultados.some((o) => o.nombre.toLowerCase() === origenQuery.trim().toLowerCase());

  const categoriaResultados = categories.filter(
    (c) => !deletedCategoriaIds.has(c.id) && c.nombre.toLowerCase().includes(categoriaQuery.toLowerCase())
  );
  const puedoCrearCategoria =
    categoriaQuery.trim().length > 0 &&
    !categoriaResultados.some((c) => c.nombre.toLowerCase() === categoriaQuery.trim().toLowerCase());

  // Handlers origen
  const handleDeleteOrigen = async (id: string) => {
    setIsDeletingOrigenId(id);
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/origins/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletedOrigenIds((prev) => new Set(prev).add(id));
        if (formOrigenId === id) {
          setFormOrigenId("");
          setOrigenQuery("");
        }
      }
    } finally {
      setIsDeletingOrigenId(null);
      setConfirmDeleteOrigenId(null);
    }
  };

  const handleSelectOrigen = (o: OpcionSelector) => {
    setFormOrigenId(o.id);
    setOrigenQuery(o.nombre);
    setOrigenDropdown(false);
  };

  const handleCreateOrigen = async () => {
    const nombre = origenQuery.trim().toUpperCase();
    if (!nombre) return;
    setIsSavingOrigen(true);
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/origins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const json = await res.json();
      if (res.ok) {
        const newOrigin: OpcionSelector = json.origin;
        setOrigins((prev) => [...prev, newOrigin]);
        handleSelectOrigen(newOrigin);
      }
    } finally {
      setIsSavingOrigen(false);
    }
  };

  // Handlers categoría
  const handleDeleteCategoria = async (id: string) => {
    setIsDeletingCategoriaId(id);
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletedCategoriaIds((prev) => new Set(prev).add(id));
        if (formCategoriaId === id) {
          setFormCategoriaId("");
          setCategoriaQuery("");
        }
      }
    } finally {
      setIsDeletingCategoriaId(null);
      setConfirmDeleteCategoriaId(null);
    }
  };

  const handleSelectCategoria = (c: OpcionSelector) => {
    setFormCategoriaId(c.id);
    setCategoriaQuery(c.nombre);
    setCategoriaDropdown(false);
  };

  const handleCreateCategoria = async () => {
    const nombre = categoriaQuery.trim().toUpperCase();
    if (!nombre) return;
    setIsSavingCategoria(true);
    try {
      const res = await fetch(`/api/operations/${operacionId}/expenses/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const json = await res.json();
      if (res.ok) {
        const newCat: OpcionSelector = json.category;
        setCategories((prev) => [...prev, newCat]);
        handleSelectCategoria(newCat);
      }
    } finally {
      setIsSavingCategoria(false);
    }
  };

  const openCreate = () => {
    setEditingGasto(null);
    setFormDescripcion("");
    setFormMonto("");
    setFormOrigenId("");
    setFormCategoriaId("");
    setFormError("");
    setOrigenQuery("");
    setCategoriaQuery("");
    setOrigenDropdown(false);
    setCategoriaDropdown(false);
    setShowModal(true);
  };

  const openEdit = (gasto: GastoOperacion) => {
    setEditingGasto(gasto);
    setFormDescripcion(gasto.descripcion);
    setFormMonto(String(gasto.monto));
    setFormOrigenId(gasto.origenId);
    setFormCategoriaId(gasto.categoriaId);
    setFormError("");
    setOrigenQuery(gasto.origenNombre);
    setCategoriaQuery(gasto.categoriaNombre);
    setOrigenDropdown(false);
    setCategoriaDropdown(false);
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
    setOrigenQuery("");
    setCategoriaQuery("");
    setOrigenDropdown(false);
    setCategoriaDropdown(false);
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
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Descripción
                      </th>
                      <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-white">
                        Quién pagó
                      </th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
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
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    person
                  </span>
                  {formOrigenId && !origenDropdown && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-base text-green-500">
                      check_circle
                    </span>
                  )}
                  <input
                    ref={origenInputRef}
                    id="gasto-origen"
                    type="text"
                    value={origenQuery}
                    onChange={(e) => {
                      setOrigenQuery(e.target.value);
                      setFormOrigenId("");
                      setOrigenDropdown(true);
                    }}
                    onFocus={() => setOrigenDropdown(true)}
                    placeholder="Buscar quién pagó..."
                    autoComplete="off"
                    disabled={saving}
                    aria-label="Buscar quién pagó"
                    className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                  {origenDropdown && (origenResultados.length > 0 || puedoCrearOrigen) && (
                    <div
                      ref={origenDropdownRef}
                      className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg"
                    >
                      {origenResultados.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center gap-1 px-2 hover:bg-blue-50 first:rounded-t-lg"
                        >
                          {confirmDeleteOrigenId === o.id ? (
                            <div className="flex flex-1 items-center gap-2 py-2">
                              <span className="flex-1 text-sm text-zinc-700">¿Eliminar <strong>{o.nombre}</strong>?</span>
                              <button
                                type="button"
                                onMouseDown={() => handleDeleteOrigen(o.id)}
                                disabled={isDeletingOrigenId === o.id}
                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {isDeletingOrigenId === o.id ? "..." : "Sí"}
                              </button>
                              <button
                                type="button"
                                onMouseDown={() => setConfirmDeleteOrigenId(null)}
                                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onMouseDown={() => handleSelectOrigen(o)}
                                className="flex flex-1 items-center gap-2 py-2.5 text-left text-sm text-zinc-800"
                              >
                                <span className="material-symbols-outlined text-base text-zinc-400">person</span>
                                {o.nombre}
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); e.nativeEvent.stopImmediatePropagation(); setConfirmDeleteOrigenId(o.id); }}
                                aria-label={`Eliminar origen ${o.nombre}`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {puedoCrearOrigen && (
                        <button
                          type="button"
                          onMouseDown={handleCreateOrigen}
                          disabled={isSavingOrigen}
                          className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-2.5 text-left text-sm font-medium text-blue-700 hover:bg-blue-50 last:rounded-b-lg disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          {isSavingOrigen ? "Creando..." : `Crear "${origenQuery.trim()}"`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Categoría */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gasto-categoria" className="text-sm font-medium text-zinc-700">
                  Categoría
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    category
                  </span>
                  {formCategoriaId && !categoriaDropdown && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-base text-green-500">
                      check_circle
                    </span>
                  )}
                  <input
                    ref={categoriaInputRef}
                    id="gasto-categoria"
                    type="text"
                    value={categoriaQuery}
                    onChange={(e) => {
                      setCategoriaQuery(e.target.value);
                      setFormCategoriaId("");
                      setCategoriaDropdown(true);
                    }}
                    onFocus={() => setCategoriaDropdown(true)}
                    placeholder="Buscar categoría..."
                    autoComplete="off"
                    disabled={saving}
                    aria-label="Buscar categoría"
                    className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                  {categoriaDropdown && (categoriaResultados.length > 0 || puedoCrearCategoria) && (
                    <div
                      ref={categoriaDropdownRef}
                      className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg"
                    >
                      {categoriaResultados.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-1 px-2 hover:bg-blue-50 first:rounded-t-lg"
                        >
                          {confirmDeleteCategoriaId === c.id ? (
                            <div className="flex flex-1 items-center gap-2 py-2">
                              <span className="flex-1 text-sm text-zinc-700">¿Eliminar <strong>{c.nombre}</strong>?</span>
                              <button
                                type="button"
                                onMouseDown={() => handleDeleteCategoria(c.id)}
                                disabled={isDeletingCategoriaId === c.id}
                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {isDeletingCategoriaId === c.id ? "..." : "Sí"}
                              </button>
                              <button
                                type="button"
                                onMouseDown={() => setConfirmDeleteCategoriaId(null)}
                                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onMouseDown={() => handleSelectCategoria(c)}
                                className="flex flex-1 items-center gap-2 py-2.5 text-left text-sm text-zinc-800"
                              >
                                <span className="material-symbols-outlined text-base text-zinc-400">category</span>
                                {c.nombre}
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); e.nativeEvent.stopImmediatePropagation(); setConfirmDeleteCategoriaId(c.id); }}
                                aria-label={`Eliminar categoría ${c.nombre}`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {puedoCrearCategoria && (
                        <button
                          type="button"
                          onMouseDown={handleCreateCategoria}
                          disabled={isSavingCategoria}
                          className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-2.5 text-left text-sm font-medium text-blue-700 hover:bg-blue-50 last:rounded-b-lg disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          {isSavingCategoria ? "Creando..." : `Crear "${categoriaQuery.trim()}"`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
