"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { KanbanColumnaCard, type KanbanColumna, type KanbanTarjeta } from "./KanbanColumnaCard";
import { KanbanTarjetaCard } from "./KanbanTarjetaCard";
import { KanbanTarjetaForm } from "./KanbanTarjetaForm";
import { KanbanTarjetaDetalle } from "./KanbanTarjetaDetalle";

export function KanbanBoard() {
  const [columnas, setColumnas] = useState<KanbanColumna[]>([]);
  const [activeTarjeta, setActiveTarjeta] = useState<KanbanTarjeta | null>(null);
  const [activeColumna, setActiveColumna] = useState<KanbanColumna | null>(null);
  const [formColumnaId, setFormColumnaId] = useState<string | null>(null);
  const [formTarjeta, setFormTarjeta] = useState<KanbanTarjeta | undefined>(undefined);
  const [detalleTarjeta, setDetalleTarjeta] = useState<KanbanTarjeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/kanban/columnas")
      .then((res) => res.json())
      .then((data) => {
        setColumnas(data.columnas ?? []);
      })
      .catch(() => setError("No se pudieron cargar las columnas"))
      .finally(() => setLoading(false));
  }, []);

  // Snapshot para rollback en caso de error de API
  const snapshotRef = useRef<KanbanColumna[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAgregarTarjeta = (columnaId: string) => {
    setFormTarjeta(undefined);
    setFormColumnaId(columnaId);
  };

  const handleVerDetalle = (tarjeta: KanbanTarjeta) => {
    setDetalleTarjeta(tarjeta);
  };

  const handleEditarDesdeDetalle = (tarjeta: KanbanTarjeta) => {
    const col = columnas.find((c) => c.tarjetas.some((t) => t.id === tarjeta.id));
    if (!col) return;
    setFormTarjeta(tarjeta);
    setFormColumnaId(col.id);
  };

  const handleTarjetaEliminada = (tarjetaId: string) => {
    setColumnas((prev) =>
      prev.map((col) => ({
        ...col,
        tarjetas: col.tarjetas.filter((t) => t.id !== tarjetaId),
      }))
    );
  };

  const handleCuerpoActualizado = (tarjetaActualizada: KanbanTarjeta) => {
    setColumnas((prev) =>
      prev.map((col) => ({
        ...col,
        tarjetas: col.tarjetas.map((t) =>
          t.id === tarjetaActualizada.id ? tarjetaActualizada : t
        ),
      }))
    );
    setDetalleTarjeta(tarjetaActualizada);
  };

  const handleRenombrar = (_columnaId: string) => {
    // TODO: porcion-003 implementará esta funcionalidad
  };

  const handleEliminar = (_columnaId: string) => {
    // TODO: porcion-003 implementará esta funcionalidad
  };

  const handleAgregarColumna = () => {
    // TODO: porcion-003 implementará esta funcionalidad
  };

  const handleTarjetaGuardada = (tarjetaGuardada: KanbanTarjeta) => {
    if (formTarjeta) {
      // Modo edición — actualizar en la columna correspondiente
      setColumnas((prev) =>
        prev.map((col) => ({
          ...col,
          tarjetas: col.tarjetas.map((t) =>
            t.id === tarjetaGuardada.id ? tarjetaGuardada : t
          ),
        }))
      );
    } else if (formColumnaId) {
      // Modo creación — agregar al final de la columna
      setColumnas((prev) =>
        prev.map((col) =>
          col.id === formColumnaId
            ? { ...col, tarjetas: [...col.tarjetas, tarjetaGuardada] }
            : col
        )
      );
    }
  };

  // --- DnD handlers ---

  function onDragStart(event: DragStartEvent) {
    snapshotRef.current = columnas.map((c) => ({
      ...c,
      tarjetas: [...c.tarjetas],
    }));

    const { data } = event.active;
    if (data.current?.type === "tarjeta") {
      setActiveTarjeta(data.current.tarjeta);
    } else if (data.current?.type === "columna") {
      setActiveColumna(data.current.columna);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Solo movimiento de tarjetas entre columnas en el DragOver
    if (activeType !== "tarjeta") return;

    const activeTarjetaId = active.id as string;

    // Encontrar columna origen
    const sourceColIndex = columnas.findIndex((c) =>
      c.tarjetas.some((t) => t.id === activeTarjetaId)
    );
    if (sourceColIndex === -1) return;

    let destColIndex: number;

    if (overType === "tarjeta") {
      // Hovering sobre otra tarjeta — buscar su columna
      const overTarjetaId = over.id as string;
      destColIndex = columnas.findIndex((c) =>
        c.tarjetas.some((t) => t.id === overTarjetaId)
      );
    } else if (overType === "columna-drop") {
      // Hovering directamente sobre la zona droppable de la columna
      const overColumnaId = over.data.current?.columnaId as string;
      destColIndex = columnas.findIndex((c) => c.id === overColumnaId);
    } else {
      return;
    }

    if (destColIndex === -1 || destColIndex === sourceColIndex) return;

    // Mover tarjeta entre columnas en el estado visual inmediato
    setColumnas((prev) => {
      const next = prev.map((c) => ({ ...c, tarjetas: [...c.tarjetas] }));
      const tarjeta = next[sourceColIndex].tarjetas.find((t) => t.id === activeTarjetaId)!;
      next[sourceColIndex].tarjetas = next[sourceColIndex].tarjetas.filter(
        (t) => t.id !== activeTarjetaId
      );
      next[destColIndex].tarjetas = [...next[destColIndex].tarjetas, tarjeta];
      return next;
    });
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveTarjeta(null);
    setActiveColumna(null);

    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;

    // --- Reordenar columnas ---
    if (activeType === "columna") {
      if (active.id === over.id) return;
      setColumnas((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === active.id);
        const newIndex = prev.findIndex((c) => c.id === over.id);
        const reordenadas = arrayMove(prev, oldIndex, newIndex).map((c, i) => ({
          ...c,
          orden: i,
        }));
        persistirReordenamientoColumnas(reordenadas);
        return reordenadas;
      });
      return;
    }

    // --- Reordenar tarjeta dentro de la misma columna ---
    if (activeType === "tarjeta" && over.data.current?.type === "tarjeta") {
      const activeTarjetaId = active.id as string;
      const overTarjetaId = over.id as string;

      if (activeTarjetaId === overTarjetaId) return;

      const colIndex = columnas.findIndex((c) =>
        c.tarjetas.some((t) => t.id === activeTarjetaId)
      );
      const overColIndex = columnas.findIndex((c) =>
        c.tarjetas.some((t) => t.id === overTarjetaId)
      );

      // Si están en la misma columna, reordenar
      if (colIndex !== -1 && colIndex === overColIndex) {
        setColumnas((prev) => {
          const next = prev.map((c) => ({ ...c, tarjetas: [...c.tarjetas] }));
          const oldIdx = next[colIndex].tarjetas.findIndex((t) => t.id === activeTarjetaId);
          const newIdx = next[colIndex].tarjetas.findIndex((t) => t.id === overTarjetaId);
          next[colIndex].tarjetas = arrayMove(next[colIndex].tarjetas, oldIdx, newIdx).map(
            (t, i) => ({ ...t, orden: i })
          );
          persistirMovimientoTarjeta(activeTarjetaId, next[colIndex].id, next[colIndex].tarjetas);
          return next;
        });
      }
      // Si están en columnas distintas, el DragOver ya lo movió — solo persistir
      else if (colIndex !== -1) {
        persistirMovimientoTarjeta(
          activeTarjetaId,
          columnas[colIndex].id,
          columnas[colIndex].tarjetas
        );
      }
      return;
    }

    // --- Tarjeta soltada en columna-drop (zona vacía) — solo persistir ---
    if (activeType === "tarjeta") {
      const activeTarjetaId = active.id as string;
      const colIndex = columnas.findIndex((c) =>
        c.tarjetas.some((t) => t.id === activeTarjetaId)
      );
      if (colIndex !== -1) {
        persistirMovimientoTarjeta(
          activeTarjetaId,
          columnas[colIndex].id,
          columnas[colIndex].tarjetas
        );
      }
    }
  }

  async function persistirMovimientoTarjeta(
    tarjetaId: string,
    columnaId: string,
    tarjetas: KanbanTarjeta[]
  ) {
    try {
      const orden = tarjetas.findIndex((t) => t.id === tarjetaId);
      const res = await fetch(`/api/kanban/tarjetas/${tarjetaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnaId, orden }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setColumnas(snapshotRef.current);
      toast.error("No se pudo mover la tarjeta. Revertiendo cambios.");
    }
  }

  async function persistirReordenamientoColumnas(reordenadas: KanbanColumna[]) {
    try {
      const res = await fetch("/api/kanban/columnas/reordenar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reordenadas.map((c) => ({ id: c.id, orden: c.orden }))),
      });
      if (!res.ok) throw new Error();
    } catch {
      setColumnas(snapshotRef.current);
      toast.error("No se pudo reordenar las columnas. Revertiendo cambios.");
    }
  }

  const columnaIds = columnas.map((c) => c.id);

  if (loading) {
    return <KanbanSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (columnas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-zinc-400">
        <span className="material-symbols-outlined text-6xl">view_kanban</span>
        <p className="text-base font-medium text-zinc-500">No hay columnas todavía</p>
        <p className="text-sm text-zinc-400">
          Creá la primera columna para empezar a organizar tus pendientes
        </p>
        <button
          type="button"
          onClick={handleAgregarColumna}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={16} />
          Agregar primera columna
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={columnaIds} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columnas.map((col) => (
            <KanbanColumnaCard
              key={col.id}
              columna={col}
              onAgregarTarjeta={handleAgregarTarjeta}
              onRenombrar={handleRenombrar}
              onEliminar={handleEliminar}
              onVerDetalle={handleVerDetalle}
            />
          ))}

        </div>
      </SortableContext>

      {/* Modal crear / editar tarjeta */}
      {formColumnaId && (
        <KanbanTarjetaForm
          columnaId={formColumnaId}
          tarjeta={formTarjeta}
          onClose={() => { setFormColumnaId(null); setFormTarjeta(undefined); }}
          onGuardado={handleTarjetaGuardada}
        />
      )}

      {/* Modal de detalle de tarjeta */}
      {detalleTarjeta && (
        <KanbanTarjetaDetalle
          tarjeta={detalleTarjeta}
          onClose={() => setDetalleTarjeta(null)}
          onEditar={handleEditarDesdeDetalle}
          onEliminada={handleTarjetaEliminada}
          onCuerpoActualizado={handleCuerpoActualizado}
        />
      )}

      {/* Drag overlays — elemento visual que sigue al cursor */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeTarjeta && (
          <KanbanTarjetaCard tarjeta={activeTarjeta} isDragOverlay />
        )}
        {activeColumna && (
          <KanbanColumnaCard
            columna={activeColumna}
            onAgregarTarjeta={() => {}}
            onRenombrar={() => {}}
            onEliminar={() => {}}
            isDragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-64 flex-shrink-0 rounded-xl bg-[#1a2c42] p-3">
          <div className="mb-3 h-5 w-32 animate-pulse rounded bg-white/10" />
          <div className="flex flex-col gap-2">
            {[1, 2].map((j) => (
              <div key={j} className="h-16 animate-pulse rounded-lg bg-white/10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
