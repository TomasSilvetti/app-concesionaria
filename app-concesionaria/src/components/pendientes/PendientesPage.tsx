"use client";

import "material-symbols/outlined.css";
import { KanbanBoard } from "./KanbanBoard";

export function PendientesPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
          <span className="material-symbols-outlined text-3xl text-white">view_kanban</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Pendientes</h1>
          <p className="text-sm text-zinc-500">Tablero de seguimiento de pendientes</p>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
