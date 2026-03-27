"use client";

import React, { useState, useEffect } from "react";
import "material-symbols/outlined.css";

interface Plantilla {
  id: string;
  nombre: string;
  contexto: "operacion" | "vehiculo";
  empresasCount: number;
}

interface PlantillasTableProps {
  onCreatePlantilla: () => void;
  onEditPlantilla: (plantilla: Plantilla) => void;
  onAsignarEmpresas: (plantilla: Plantilla) => void;
  refreshTrigger?: number;
}

const MOCK_PLANTILLAS: Plantilla[] = [
  { id: "1", nombre: "Contrato de compraventa", contexto: "operacion", empresasCount: 3 },
  { id: "2", nombre: "Ficha de vehículo", contexto: "vehiculo", empresasCount: 1 },
  { id: "3", nombre: "Acuerdo de financiamiento", contexto: "operacion", empresasCount: 2 },
];

export function PlantillasTable({
  onCreatePlantilla,
  onEditPlantilla,
  onAsignarEmpresas,
  refreshTrigger,
}: PlantillasTableProps) {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plantillaToDelete, setPlantillaToDelete] = useState<Plantilla | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlantillas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/document-templates`);
      if (res.ok) {
        const data = await res.json();
        setPlantillas(data.templates ?? data ?? []);
      } else if (res.status === 404) {
        // API aún no implementada — usar mock
        setPlantillas(MOCK_PLANTILLAS);
      } else {
        setError("Error al cargar las plantillas.");
        setPlantillas([]);
      }
    } catch {
      // API aún no implementada — usar mock
      setPlantillas(MOCK_PLANTILLAS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantillas();
  }, [refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!plantillaToDelete) return;
    setIsDeleting(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/document-templates/${plantillaToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPlantillas((prev) => prev.filter((p) => p.id !== plantillaToDelete.id));
      } else {
        setError("Error al eliminar la plantilla.");
      }
    } catch {
      setError("Error de conexión al eliminar la plantilla.");
    } finally {
      setIsDeleting(false);
      setPlantillaToDelete(null);
    }
  };

  const contextoLabel = (contexto: Plantilla["contexto"]) =>
    contexto === "operacion" ? "Operación" : "Vehículo";

  const contextoStyles = (contexto: Plantilla["contexto"]) =>
    contexto === "operacion"
      ? "bg-blue-50 text-blue-700"
      : "bg-amber-50 text-amber-700";

  const contextoIcon = (contexto: Plantilla["contexto"]) =>
    contexto === "operacion" ? "handshake" : "directions_car";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Plantillas de documentos
          </h1>
          <p className="mt-1 text-lg text-zinc-600">
            Gestioná las plantillas disponibles para generar documentos en operaciones y vehículos.
          </p>
        </div>
        <button
          onClick={onCreatePlantilla}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Nueva plantilla
        </button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="material-symbols-outlined text-4xl text-red-600">error</span>
            </div>
            <p className="mt-4 text-base font-medium text-zinc-900">Error al cargar plantillas</p>
            <p className="mt-1 text-sm text-zinc-600">{error}</p>
            <button
              onClick={fetchPlantillas}
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              Reintentar
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg border border-zinc-100 p-4">
                <div className="h-8 w-8 rounded-full bg-zinc-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-zinc-200" />
                  <div className="h-3 w-1/5 rounded bg-zinc-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-zinc-200" />
                <div className="h-6 w-16 rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        ) : plantillas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <span className="material-symbols-outlined text-4xl text-zinc-400">description</span>
            </div>
            <p className="mt-4 text-base font-medium text-zinc-900">
              No hay plantillas creadas aún
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Creá la primera plantilla para empezar a generar documentos.
            </p>
            <button
              onClick={onCreatePlantilla}
              className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Nueva plantilla
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border border-zinc-200 lg:block">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Contexto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Empresas asignadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {plantillas.map((plantilla) => (
                    <tr key={plantilla.id} className="transition-colors hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                            <span className="material-symbols-outlined text-lg text-zinc-600">
                              description
                            </span>
                          </div>
                          <span className="text-sm font-medium text-zinc-900">
                            {plantilla.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${contextoStyles(plantilla.contexto)}`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {contextoIcon(plantilla.contexto)}
                          </span>
                          {contextoLabel(plantilla.contexto)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-700">
                          <span className="material-symbols-outlined text-base text-zinc-400">
                            business
                          </span>
                          {plantilla.empresasCount}{" "}
                          {plantilla.empresasCount === 1 ? "empresa" : "empresas"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditPlantilla(plantilla)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
                            aria-label={`Editar plantilla ${plantilla.nombre}`}
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Editar
                          </button>
                          <button
                            onClick={() => onAsignarEmpresas(plantilla)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                            aria-label={`Asignar empresas a ${plantilla.nombre}`}
                          >
                            <span className="material-symbols-outlined text-base">business</span>
                            Empresas
                          </button>
                          <button
                            onClick={() => setPlantillaToDelete(plantilla)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                            aria-label={`Eliminar plantilla ${plantilla.nombre}`}
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {plantillas.map((plantilla) => (
                <div
                  key={plantilla.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                      <span className="material-symbols-outlined text-xl text-zinc-600">
                        description
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-zinc-900">
                          {plantilla.nombre}
                        </h3>
                        <span
                          className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${contextoStyles(plantilla.contexto)}`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {contextoIcon(plantilla.contexto)}
                          </span>
                          {contextoLabel(plantilla.contexto)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                        <span className="material-symbols-outlined text-sm">business</span>
                        {plantilla.empresasCount}{" "}
                        {plantilla.empresasCount === 1 ? "empresa asignada" : "empresas asignadas"}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
                        <button
                          onClick={() => onEditPlantilla(plantilla)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                          aria-label={`Editar plantilla ${plantilla.nombre}`}
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Editar
                        </button>
                        <button
                          onClick={() => onAsignarEmpresas(plantilla)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label={`Asignar empresas a ${plantilla.nombre}`}
                        >
                          <span className="material-symbols-outlined text-base">business</span>
                          Empresas
                        </button>
                        <button
                          onClick={() => setPlantillaToDelete(plantilla)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                          aria-label={`Eliminar plantilla ${plantilla.nombre}`}
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {plantillaToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={() => setPlantillaToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <span className="material-symbols-outlined text-2xl text-red-600">delete</span>
              </div>
              <h2
                id="delete-modal-title"
                className="text-xl font-semibold text-zinc-900"
              >
                Eliminar plantilla
              </h2>
            </div>
            <p className="mb-4 text-sm text-zinc-600">
              ¿Estás seguro de que querés eliminar esta plantilla? Esta acción no se puede deshacer.
            </p>
            <div className="mb-6 rounded-lg bg-zinc-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200">
                  <span className="material-symbols-outlined text-base text-zinc-600">
                    description
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {plantillaToDelete.nombre}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {contextoLabel(plantillaToDelete.contexto)} ·{" "}
                    {plantillaToDelete.empresasCount}{" "}
                    {plantillaToDelete.empresasCount === 1 ? "empresa" : "empresas"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPlantillaToDelete(null)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
