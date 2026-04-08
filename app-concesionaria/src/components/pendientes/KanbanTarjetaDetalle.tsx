"use client";

import { useState, useEffect } from "react";
import { X, Pencil, Trash2, Loader2 } from "lucide-react";
import { type KanbanTarjeta } from "./KanbanTarjetaCard";

interface Props {
  tarjeta: KanbanTarjeta;
  onClose: () => void;
  onEditar: (tarjeta: KanbanTarjeta) => void;
  onEliminada: (tarjetaId: string) => void;
  onCuerpoActualizado: (tarjetaActualizada: KanbanTarjeta) => void;
}

type LineaParsed =
  | { tipo: "check"; checked: boolean; texto: string }
  | { tipo: "texto"; texto: string }
  | { tipo: "vacia" };

function parsearLinea(linea: string): LineaParsed {
  if (linea.trim() === "") return { tipo: "vacia" };
  const m = linea.match(/^- \[([ xX])\] (.*)$/);
  if (m) return { tipo: "check", checked: m[1] !== " ", texto: m[2] };
  return { tipo: "texto", texto: linea };
}

export function KanbanTarjetaDetalle({
  tarjeta,
  onClose,
  onEditar,
  onEliminada,
  onCuerpoActualizado,
}: Props) {
  const [cuerpoLocal, setCuerpoLocal] = useState(tarjeta.cuerpo ?? "");
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function toggleCheckbox(indiceLinea: number, checked: boolean) {
    const lineas = cuerpoLocal.split("\n");
    lineas[indiceLinea] = checked
      ? lineas[indiceLinea].replace(/^- \[ \]/, "- [x]")
      : lineas[indiceLinea].replace(/^- \[[xX]\]/, "- [ ]");
    const nuevoCuerpo = lineas.join("\n");

    // Optimistic update
    setCuerpoLocal(nuevoCuerpo);

    try {
      const res = await fetch(`/api/kanban/tarjetas/${tarjeta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuerpo: nuevoCuerpo }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onCuerpoActualizado(data.tarjeta);
    } catch {
      // Rollback
      setCuerpoLocal(tarjeta.cuerpo ?? "");
    }
  }

  async function handleEliminar() {
    setEliminando(true);
    setErrorEliminar("");
    try {
      const res = await fetch(`/api/kanban/tarjetas/${tarjeta.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onEliminada(tarjeta.id);
      onClose();
    } catch {
      setErrorEliminar("No se pudo eliminar la tarjeta. Intentá de nuevo.");
    } finally {
      setEliminando(false);
    }
  }

  const lineas = cuerpoLocal ? cuerpoLocal.split("\n") : [];
  const hayContenido = lineas.some((l) => l.trim() !== "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-tarjeta-titulo"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <h2
            id="detalle-tarjeta-titulo"
            className="text-base font-semibold leading-snug text-zinc-900"
          >
            {tarjeta.titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle de tarjeta"
            className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Creador */}
          <p className="text-xs text-zinc-400">
            Creado por:{" "}
            <span className="font-medium text-zinc-500">
              {tarjeta.creadoPorNombre}
            </span>
          </p>

          {/* Contenido / checklist */}
          {hayContenido ? (
            <div className="flex flex-col">
              {lineas.map((linea, i) => {
                const parsed = parsearLinea(linea);
                if (parsed.tipo === "vacia") {
                  return <div key={i} className="h-2" />;
                }
                if (parsed.tipo === "check") {
                  return (
                    <label
                      key={i}
                      className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-50"
                    >
                      <input
                        type="checkbox"
                        checked={parsed.checked}
                        onChange={(e) => toggleCheckbox(i, e.target.checked)}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-blue-600"
                      />
                      <span
                        className={`text-sm leading-snug ${
                          parsed.checked
                            ? "text-zinc-400 line-through"
                            : "text-zinc-700"
                        }`}
                      >
                        {parsed.texto}
                      </span>
                    </label>
                  );
                }
                return (
                  <p
                    key={i}
                    className="px-2 py-0.5 text-sm leading-snug text-zinc-700"
                  >
                    {parsed.texto}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-sm italic text-zinc-400">Sin notas</p>
          )}

          {/* Error eliminar */}
          {errorEliminar && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {errorEliminar}
            </p>
          )}

          {/* Confirmación de eliminación */}
          {confirmandoEliminar && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="mb-3 text-sm font-medium text-red-700">
                ¿Eliminar esta tarjeta? Esta acción no se puede deshacer.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEliminar}
                  disabled={eliminando}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {eliminando ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  {eliminando ? "Eliminando…" : "Sí, eliminar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmandoEliminar(false);
                    setErrorEliminar("");
                  }}
                  disabled={eliminando}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!confirmandoEliminar && (
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setConfirmandoEliminar(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
            <button
              type="button"
              onClick={() => {
                onEditar(tarjeta);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2"
            >
              <Pencil size={14} />
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
