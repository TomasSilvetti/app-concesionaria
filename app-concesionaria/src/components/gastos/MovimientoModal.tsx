"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import "material-symbols/outlined.css";
import { NumericInput } from "@/components/ui/NumericInput";

type TipoMovimiento = "gasto" | "ingreso";

interface OpcionSelector {
  id: string;
  nombre: string;
}

export interface MovimientoEditing {
  id: string;
  descripcion: string;
  monto: number;
  origenId: string;
  origenNombre: string;
  categoriaId: string;
  categoriaNombre: string;
  tipo: TipoMovimiento;
}

interface MovimientoModalProps {
  /** Si se provee, usa /api/operations/{id}/expenses/*. Si no, usa /api/gastos/* */
  operacionId?: string;
  editingGasto?: MovimientoEditing | null;
  onClose: () => void;
  onSaved: () => void;
}

export function MovimientoModal({
  operacionId,
  editingGasto,
  onClose,
  onSaved,
}: MovimientoModalProps) {
  const [formTipo, setFormTipo] = useState<TipoMovimiento>(editingGasto?.tipo ?? "gasto");
  const [formDescripcion, setFormDescripcion] = useState(editingGasto?.descripcion ?? "");
  const [formMonto, setFormMonto] = useState(editingGasto ? String(editingGasto.monto) : "");
  const [formOrigenId, setFormOrigenId] = useState(editingGasto?.origenId ?? "");
  const [formCategoriaId, setFormCategoriaId] = useState(editingGasto?.categoriaId ?? "");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [origins, setOrigins] = useState<OpcionSelector[]>([]);
  const [categoriesGasto, setCategoriesGasto] = useState<OpcionSelector[]>([]);
  const [categoriesIngreso, setCategoriesIngreso] = useState<OpcionSelector[]>([]);

  // Origen search
  const [origenQuery, setOrigenQuery] = useState(editingGasto?.origenNombre ?? "");
  const [origenDropdown, setOrigenDropdown] = useState(false);
  const [isSavingOrigen, setIsSavingOrigen] = useState(false);
  const [confirmDeleteOrigenId, setConfirmDeleteOrigenId] = useState<string | null>(null);
  const [isDeletingOrigenId, setIsDeletingOrigenId] = useState<string | null>(null);
  const [deletedOrigenIds, setDeletedOrigenIds] = useState<Set<string>>(new Set());
  const origenInputRef = useRef<HTMLInputElement>(null);
  const origenDropdownRef = useRef<HTMLDivElement>(null);

  // Categoría search
  const [categoriaQuery, setCategoriaQuery] = useState(editingGasto?.categoriaNombre ?? "");
  const [categoriaDropdown, setCategoriaDropdown] = useState(false);
  const [isSavingCategoria, setIsSavingCategoria] = useState(false);
  const [confirmDeleteCategoriaId, setConfirmDeleteCategoriaId] = useState<string | null>(null);
  const [isDeletingCategoriaId, setIsDeletingCategoriaId] = useState<string | null>(null);
  const [deletedCategoriaIds, setDeletedCategoriaIds] = useState<Set<string>>(new Set());
  const categoriaInputRef = useRef<HTMLInputElement>(null);
  const categoriaDropdownRef = useRef<HTMLDivElement>(null);

  // URL builders
  const originsBase = operacionId
    ? `/api/operations/${operacionId}/expenses/origins`
    : `/api/gastos/origins`;
  const categoriesBase = operacionId
    ? `/api/operations/${operacionId}/expenses/categories`
    : `/api/gastos/categories`;
  const expensesBase = operacionId
    ? `/api/operations/${operacionId}/expenses`
    : `/api/gastos`;

  const fetchOrigins = useCallback(async () => {
    try {
      const res = await fetch(originsBase);
      if (res.ok) {
        const data = await res.json();
        setOrigins(data.origins ?? []);
      }
    } catch { /* silently fail */ }
  }, [originsBase]);

  const fetchCategories = useCallback(async () => {
    try {
      const [resGasto, resIngreso] = await Promise.all([
        fetch(`${categoriesBase}?tipo=gasto`),
        fetch(`${categoriesBase}?tipo=ingreso`),
      ]);
      if (resGasto.ok) {
        const data = await resGasto.json();
        setCategoriesGasto(data.categories ?? []);
      }
      if (resIngreso.ok) {
        const data = await resIngreso.json();
        setCategoriesIngreso(data.categories ?? []);
      }
    } catch { /* silently fail */ }
  }, [categoriesBase]);

  useEffect(() => {
    fetchOrigins();
    fetchCategories();
  }, [fetchOrigins, fetchCategories]);

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

  const categoriesActivas = formTipo === "gasto" ? categoriesGasto : categoriesIngreso;

  const origenResultados = origins.filter(
    (o) => !deletedOrigenIds.has(o.id) && o.nombre.toLowerCase().includes(origenQuery.toLowerCase())
  );
  const puedoCrearOrigen =
    origenQuery.trim().length > 0 &&
    !origenResultados.some((o) => o.nombre.toLowerCase() === origenQuery.trim().toLowerCase());

  const categoriaResultados = categoriesActivas.filter(
    (c) => !deletedCategoriaIds.has(c.id) && c.nombre.toLowerCase().includes(categoriaQuery.toLowerCase())
  );
  const puedoCrearCategoria =
    categoriaQuery.trim().length > 0 &&
    !categoriaResultados.some((c) => c.nombre.toLowerCase() === categoriaQuery.trim().toLowerCase());

  // Origen handlers
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
      const res = await fetch(originsBase, {
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

  const handleDeleteOrigen = async (id: string) => {
    setIsDeletingOrigenId(id);
    try {
      const res = await fetch(`${originsBase}/${id}`, { method: "DELETE" });
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

  // Categoría handlers
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
      const res = await fetch(categoriesBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, tipo: formTipo }),
      });
      const json = await res.json();
      if (res.ok) {
        const newCat: OpcionSelector = json.category;
        if (formTipo === "gasto") {
          setCategoriesGasto((prev) => [...prev, newCat]);
        } else {
          setCategoriesIngreso((prev) => [...prev, newCat]);
        }
        handleSelectCategoria(newCat);
      }
    } finally {
      setIsSavingCategoria(false);
    }
  };

  const handleDeleteCategoria = async (id: string) => {
    setIsDeletingCategoriaId(id);
    try {
      const res = await fetch(`${categoriesBase}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletedCategoriaIds((prev) => new Set(prev).add(id));
        if (formCategoriaId === id) {
          setFormCategoriaId("");
          setCategoriaQuery("");
        }
        if (formTipo === "gasto") {
          setCategoriesGasto((prev) => prev.filter((c) => c.id !== id));
        } else {
          setCategoriesIngreso((prev) => prev.filter((c) => c.id !== id));
        }
      }
    } finally {
      setIsDeletingCategoriaId(null);
      setConfirmDeleteCategoriaId(null);
    }
  };

  const handleToggleTipo = (tipo: TipoMovimiento) => {
    setFormTipo(tipo);
    setFormCategoriaId("");
    setCategoriaQuery("");
    setCategoriaDropdown(false);
  };

  const handleSave = async () => {
    if (!formDescripcion.trim()) {
      setFormError("La descripción es requerida");
      return;
    }
    if (!formOrigenId) {
      setFormError(formTipo === "gasto" ? "Seleccioná quién pagó" : "Seleccioná quién cobró");
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
      const url = editingGasto ? `${expensesBase}/${editingGasto.id}` : expensesBase;
      const method = editingGasto ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: formDescripcion.trim(),
          monto,
          origenId: formOrigenId,
          categoriaId: formCategoriaId,
          tipo: formTipo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? "Error al guardar el movimiento");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setFormError("Error al guardar el movimiento");
    } finally {
      setSaving(false);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editingGasto ? "Editar movimiento" : "Agregar movimiento"}
    >
      <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              {editingGasto ? "edit" : "add_circle"}
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">
              {editingGasto ? "Editar movimiento" : "Agregar movimiento"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Toggle Gasto / Ingreso */}
          <div className="flex rounded-lg border border-zinc-200 p-1 gap-1">
            <button
              type="button"
              onClick={() => handleToggleTipo("gasto")}
              disabled={saving}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors focus:outline-none ${
                formTipo === "gasto"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleToggleTipo("ingreso")}
              disabled={saving}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors focus:outline-none ${
                formTipo === "ingreso"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="movimiento-descripcion" className="text-sm font-medium text-zinc-700">
              Descripción
            </label>
            <input
              id="movimiento-descripcion"
              type="text"
              value={formDescripcion}
              onChange={(e) => {
                const v = e.target.value;
                setFormDescripcion(v.charAt(0).toUpperCase() + v.slice(1));
              }}
              placeholder="Ej: Limpieza, service, patente..."
              disabled={saving}
              autoFocus
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          {/* Quién pagó / Quién cobró */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="movimiento-origen" className="text-sm font-medium text-zinc-700">
              {formTipo === "gasto" ? "Quién pagó" : "Quién cobró"}
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
                id="movimiento-origen"
                type="text"
                value={origenQuery}
                onChange={(e) => {
                  setOrigenQuery(e.target.value);
                  setFormOrigenId("");
                  setOrigenDropdown(true);
                }}
                onFocus={() => setOrigenDropdown(true)}
                placeholder={formTipo === "gasto" ? "Buscar quién pagó..." : "Buscar quién cobró..."}
                autoComplete="off"
                disabled={saving}
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
                          <span className="flex-1 text-sm text-zinc-700">
                            ¿Eliminar <strong>{o.nombre}</strong>?
                          </span>
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
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.nativeEvent.stopImmediatePropagation();
                              setConfirmDeleteOrigenId(o.id);
                            }}
                            aria-label={`Eliminar ${o.nombre}`}
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
            <label htmlFor="movimiento-categoria" className="text-sm font-medium text-zinc-700">
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
                id="movimiento-categoria"
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
                          <span className="flex-1 text-sm text-zinc-700">
                            ¿Eliminar <strong>{c.nombre}</strong>?
                          </span>
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
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.nativeEvent.stopImmediatePropagation();
                              setConfirmDeleteCategoriaId(c.id);
                            }}
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
            <label htmlFor="movimiento-monto" className="text-sm font-medium text-zinc-700">
              Monto
            </label>
            <NumericInput
              id="movimiento-monto"
              value={formMonto}
              onChange={setFormMonto}
              placeholder="0"
              disabled={saving}
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {formError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
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
  );
}
