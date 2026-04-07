"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { KanbanTarjetaCard } from "./KanbanTarjetaCard";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export interface KanbanTarjeta {
  id: string;
  titulo: string;
  cuerpo: string | null;
  orden: number;
  creadoPorNombre: string;
}

export interface KanbanColumna {
  id: string;
  nombre: string;
  orden: number;
  tarjetas: KanbanTarjeta[];
}

interface Props {
  columna: KanbanColumna;
  onAgregarTarjeta: (columnaId: string) => void;
  onRenombrar: (columnaId: string) => void;
  onEliminar: (columnaId: string) => void;
  onVerDetalle?: (tarjeta: KanbanTarjeta) => void;
  isDragOverlay?: boolean;
}

export function KanbanColumnaCard({
  columna,
  onAgregarTarjeta,
  onRenombrar,
  onEliminar,
  onVerDetalle,
  isDragOverlay = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sortable para reordenar la columna completa
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columna.id, data: { type: "columna", columna } });

  // Droppable para recibir tarjetas en la zona de cards
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `col-drop-${columna.id}`,
    data: { type: "columna-drop", columnaId: columna.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const tarjetaIds = columna.tarjetas.map((t) => t.id);

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={[
        "flex w-64 flex-shrink-0 flex-col rounded-xl bg-zinc-100 p-3 transition-opacity",
        isDragging && !isDragOverlay ? "opacity-40" : "",
        isDragOverlay ? "shadow-2xl rotate-1 cursor-grabbing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header — handle de drag de columna */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            aria-label={`Arrastrar columna ${columna.nombre}`}
            className="flex-shrink-0 cursor-grab text-zinc-300 transition-colors hover:text-zinc-500 active:cursor-grabbing focus:outline-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={15} />
          </button>
          <span className="truncate text-sm font-semibold text-zinc-700">{columna.nombre}</span>
          <span className="flex-shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-500">
            {columna.tarjetas.length}
          </span>
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label={`Opciones de columna ${columna.nombre}`}
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onRenombrar(columna.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <Pencil size={14} />
                Renombrar
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEliminar(columna.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={14} />
                Eliminar columna
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drop zone para tarjetas */}
      <div
        ref={setDropRef}
        className={[
          "flex flex-col gap-2 rounded-lg transition-colors min-h-[2rem] flex-1",
          isOver ? "bg-blue-50 ring-2 ring-blue-200 ring-inset" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SortableContext items={tarjetaIds} strategy={verticalListSortingStrategy}>
          {columna.tarjetas.length === 0 ? (
            <p className="py-3 text-center text-xs text-zinc-400">
              {isOver ? "Soltar aquí" : "Sin tarjetas"}
            </p>
          ) : (
            columna.tarjetas.map((tarjeta) => (
              <KanbanTarjetaCard
                key={tarjeta.id}
                tarjeta={tarjeta}
                onClick={onVerDetalle}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Add card */}
      <button
        type="button"
        onClick={() => onAgregarTarjeta(columna.id)}
        className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
      >
        <Plus size={15} />
        Agregar
      </button>
    </div>
  );
}
