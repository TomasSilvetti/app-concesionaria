"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye } from "lucide-react";

export interface KanbanTarjeta {
  id: string;
  titulo: string;
  cuerpo: string | null;
  orden: number;
  creadoPorNombre: string;
}

interface Props {
  tarjeta: KanbanTarjeta;
  isDragOverlay?: boolean;
  onClick?: (tarjeta: KanbanTarjeta) => void;
}

export function KanbanTarjetaCard({ tarjeta, isDragOverlay = false, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarjeta.id, data: { type: "tarjeta", tarjeta } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="article"
      aria-label={`Tarjeta: ${tarjeta.titulo}`}
      onClick={() => !isDragging && onClick?.(tarjeta)}
      className={[
        "cursor-grab rounded-lg bg-white px-3 py-2.5 shadow-sm transition-shadow active:cursor-grabbing",
        isDragging && !isDragOverlay ? "opacity-40" : "hover:shadow-md",
        isDragOverlay ? "shadow-xl rotate-1 cursor-grabbing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-800">{tarjeta.titulo}</p>
        <button
          type="button"
          aria-label="Ver detalle"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(tarjeta);
          }}
          className="flex-shrink-0 rounded p-0.5 text-zinc-300 transition-colors hover:text-zinc-600"
        >
          <Eye size={14} />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-zinc-400">{tarjeta.creadoPorNombre}</p>
    </div>
  );
}
