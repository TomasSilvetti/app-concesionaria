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
        "flex w-64 flex-shrink-0 flex-col rounded-xl bg-[#1a2c42] p-3 transition-opacity",
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
            className="flex-shrink-0 cursor-grab text-white/30 transition-colors hover:text-white/60 active:cursor-grabbing focus:outline-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={15} />
          </button>
          <span className="truncate text-sm font-semibold text-white">{columna.nombre}</span>
          <span className="flex-shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">
            {columna.tarjetas.length}
          </span>
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-6 w-6 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
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
          isOver ? "bg-white/5 ring-2 ring-blue-400/40 ring-inset" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SortableContext items={tarjetaIds} strategy={verticalListSortingStrategy}>
          {columna.tarjetas.length === 0 ? (
            <p className="py-3 text-center text-xs text-white/40">
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
        className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        <Plus size={15} />
        Agregar
      </button>
    </div>
  );
}
