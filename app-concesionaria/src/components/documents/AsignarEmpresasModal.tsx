"use client";

import { useState, useEffect } from "react";
import "material-symbols/outlined.css";

interface Empresa {
  id: string;
  nombre: string;
}

interface AsignarEmpresasModalProps {
  plantillaId: string;
  plantillaNombre: string;
  onClose: () => void;
}

export function AsignarEmpresasModal({
  plantillaId,
  plantillaNombre,
  onClose,
}: AsignarEmpresasModalProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [initialActivos, setInitialActivos] = useState<Set<string>>(new Set());
  const [activos, setActivos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

        const res = await fetch(
          `${baseUrl}/api/admin/document-templates/${plantillaId}/assignments`
        );

        if (!res.ok) {
          setLoadError("Error al cargar las empresas.");
          return;
        }

        const data = await res.json();
        const assignments: { clienteId: string; nombre: string; activo: boolean }[] =
          data.assignments ?? [];

        const empresasData: Empresa[] = assignments.map((a) => ({
          id: a.clienteId,
          nombre: a.nombre,
        }));

        const activosSet = new Set(
          assignments.filter((a) => a.activo).map((a) => a.clienteId)
        );

        setEmpresas(empresasData);
        setInitialActivos(new Set(activosSet));
        setActivos(new Set(activosSet));
      } catch {
        setLoadError("Error al cargar las empresas.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [plantillaId]);

  const toggleEmpresa = (id: string) => {
    setActivos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaveSuccess(false);
    setSaveError(null);
  };

  const hasChanges = (() => {
    if (activos.size !== initialActivos.size) return true;
    for (const id of activos) if (!initialActivos.has(id)) return true;
    return false;
  })();

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const assignments = empresas.map((e) => ({
      clienteId: e.id,
      activo: activos.has(e.id),
    }));

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(
        `${baseUrl}/api/admin/document-templates/${plantillaId}/assignments`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignments }),
        }
      );

      if (res.ok) {
        setInitialActivos(new Set(activos));
        setSaveSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.message ?? "Error al guardar los cambios.");
      }
    } catch {
      setSaveError("Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="asignar-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <span className="material-symbols-outlined text-lg text-blue-600">
                business
              </span>
            </div>
            <div>
              <h2
                id="asignar-title"
                className="text-sm font-semibold text-zinc-900"
              >
                Asignar empresas
              </h2>
              <p className="max-w-[220px] truncate text-xs text-zinc-500">
                {plantillaNombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </header>

        {/* Body */}
        <div className="min-h-[200px] overflow-y-auto px-5 py-3" style={{ maxHeight: 360 }}>
          {isLoading ? (
            <ul className="flex flex-col gap-2 py-2">
              {[1, 2, 3, 4].map((i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3"
                >
                  <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
                  <div className="h-6 w-11 animate-pulse rounded-full bg-zinc-200" />
                </li>
              ))}
            </ul>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="material-symbols-outlined text-3xl text-red-400">
                error
              </span>
              <p className="text-sm text-zinc-500">{loadError}</p>
            </div>
          ) : empresas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="material-symbols-outlined text-3xl text-zinc-300">
                domain_disabled
              </span>
              <p className="text-sm text-zinc-400">No hay empresas registradas.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5 py-1">
              {empresas.map((empresa) => {
                const isActivo = activos.has(empresa.id);
                return (
                  <li key={empresa.id}>
                    <button
                      onClick={() => toggleEmpresa(empresa.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-pressed={isActivo}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                          <span className="material-symbols-outlined text-base text-zinc-500">
                            storefront
                          </span>
                        </div>
                        <span className="text-sm font-medium text-zinc-800">
                          {empresa.nombre}
                        </span>
                      </div>
                      {/* Toggle visual */}
                      <div
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          isActivo ? "bg-blue-600" : "bg-zinc-200"
                        }`}
                        role="presentation"
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            isActivo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-zinc-200 px-5 py-4">
          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Cambios guardados correctamente.
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              <span className="material-symbols-outlined text-sm">error</span>
              {saveError}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              {activos.size} de {empresas.length} habilitadas
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                Cerrar
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving || isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">
                      progress_activity
                    </span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

