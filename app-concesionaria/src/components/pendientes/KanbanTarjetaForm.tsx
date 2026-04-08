"use client";

import { useEffect, useRef, useState } from "react";
import { X, CheckSquare, Loader2 } from "lucide-react";
import { type KanbanTarjeta } from "./KanbanTarjetaCard";

interface Props {
  columnaId: string;
  tarjeta?: KanbanTarjeta; // si viene, es modo edición
  onClose: () => void;
  onGuardado: (tarjeta: KanbanTarjeta) => void;
}

export function KanbanTarjetaForm({ columnaId, tarjeta, onClose, onGuardado }: Props) {
  const [titulo, setTitulo] = useState(tarjeta?.titulo ?? "");
  const [cuerpo, setCuerpo] = useState(tarjeta?.cuerpo ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tituloRef = useRef<HTMLInputElement>(null);

  const esEdicion = !!tarjeta;

  // Focus en el título al abrir
  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function insertarChecklist() {
    const ta = textareaRef.current;
    if (!ta) {
      setCuerpo((prev) => prev + "- [ ] ");
      return;
    }

    const inicio = ta.selectionStart;
    const fin = ta.selectionEnd;
    const insercion = "- [ ] ";

    // Insertar en la posición del cursor
    const nuevo = cuerpo.slice(0, inicio) + insercion + cuerpo.slice(fin);
    setCuerpo(nuevo);

    // Restaurar foco y mover cursor después de la inserción
    requestAnimationFrame(() => {
      ta.focus();
      const pos = inicio + insercion.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  async function handleGuardar() {
    const tituloTrimmed = titulo.trim();
    if (!tituloTrimmed) return;

    setGuardando(true);
    setError("");

    try {
      const url = esEdicion
        ? `/api/kanban/tarjetas/${tarjeta.id}`
        : "/api/kanban/tarjetas";
      const method = esEdicion ? "PATCH" : "POST";
      const body = esEdicion
        ? { titulo: tituloTrimmed, cuerpo: cuerpo || null }
        : { titulo: tituloTrimmed, cuerpo: cuerpo || null, columnaId };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      onGuardado(data.tarjeta);
      onClose();
    } catch {
      setError("No se pudo guardar la tarjeta. Intentá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const tituloVacio = titulo.trim().length === 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kanban-form-titulo"
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2
            id="kanban-form-titulo"
            className="text-base font-semibold text-zinc-900"
          >
            {esEdicion ? "Editar tarjeta" : "Nueva tarjeta"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tarjeta-titulo"
              className="text-xs font-medium text-zinc-600"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              ref={tituloRef}
              id="tarjeta-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Honda Civic para Pedro"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Cuerpo */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="tarjeta-cuerpo"
                className="text-xs font-medium text-zinc-600"
              >
                Notas
              </label>
              <button
                type="button"
                onClick={insertarChecklist}
                title="Insertar ítem de checklist"
                aria-label="Insertar ítem de checklist (- [ ] )"
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <CheckSquare size={13} />
                Checklist
              </button>
            </div>
            <textarea
              ref={textareaRef}
              id="tarjeta-cuerpo"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              placeholder="Notas, detalles, requisitos..."
              rows={5}
              className="resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-zinc-400">
              Usá el botón "Checklist" para insertar{" "}
              <code className="rounded bg-zinc-100 px-1 font-mono text-zinc-600">
                - [ ]&nbsp;
              </code>
            </p>
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={tituloVacio || guardando}
            className="flex min-w-[88px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Guardando…
              </>
            ) : esEdicion ? (
              "Guardar cambios"
            ) : (
              "Crear tarjeta"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
