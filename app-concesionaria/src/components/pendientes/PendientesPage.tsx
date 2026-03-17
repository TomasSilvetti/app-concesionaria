"use client";

import React, { useState, useEffect, useCallback } from "react";
import "material-symbols/outlined.css";

interface Pendiente {
  id: string;
  nombreCliente: string;
  detalle: string;
  completado: boolean;
  creadoEn: string;
}

export function PendientesPage() {
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Pendiente | null>(null);
  const [nombreCliente, setNombreCliente] = useState("");
  const [detalle, setDetalle] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pendientes");
      if (!res.ok) throw new Error("Error al cargar los pendientes");
      const data = await res.json();
      setPendientes(data);
    } catch {
      setError("No se pudieron cargar los pendientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  const openCreate = () => {
    setEditing(null);
    setNombreCliente("");
    setDetalle("");
    setModalError("");
    setShowModal(true);
  };

  const openEdit = (p: Pendiente) => {
    setEditing(p);
    setNombreCliente(p.nombreCliente);
    setDetalle(p.detalle);
    setModalError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setNombreCliente("");
    setDetalle("");
    setModalError("");
  };

  const handleSave = async () => {
    if (!nombreCliente.trim()) {
      setModalError("El nombre del cliente es requerido");
      return;
    }
    if (!detalle.trim()) {
      setModalError("Describí qué auto quiere el cliente");
      return;
    }

    setSaving(true);
    setModalError("");

    try {
      const url = editing ? `/api/pendientes/${editing.id}` : "/api/pendientes";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreCliente: nombreCliente.trim(), detalle: detalle.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setModalError(data.error || "Error al guardar");
        return;
      }

      closeModal();
      await fetchPendientes();
    } catch {
      setModalError("Error al guardar el pendiente");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompletado = async (p: Pendiente) => {
    try {
      await fetch(`/api/pendientes/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completado: !p.completado }),
      });
      setPendientes((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, completado: !item.completado } : item
        )
      );
    } catch {
      // silent fail — UI will resync on next load
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/pendientes/${id}`, { method: "DELETE" });
      setPendientes((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
    } catch {
      setDeletingId(null);
    }
  };

  const pendientesActivos = pendientes.filter((p) => !p.completado);
  const pendientesCompletados = pendientes.filter((p) => p.completado);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="material-symbols-outlined text-3xl text-white">
              checklist
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Pendientes</h1>
            <p className="text-sm text-zinc-500">
              Autos que clientes quieren conseguir
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Agregar pendiente
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">
              progress_activity
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : pendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
            <span className="material-symbols-outlined text-5xl">
              checklist
            </span>
            <p className="text-sm">No hay pendientes cargados</p>
            <button
              type="button"
              onClick={openCreate}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Agregar el primero
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {/* Activos */}
            {pendientesActivos.length > 0 && (
              <div>
                <div className="px-6 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Pendientes ({pendientesActivos.length})
                  </span>
                </div>
                <ul className="divide-y divide-zinc-100">
                  {pendientesActivos.map((p) => (
                    <PendienteRow
                      key={p.id}
                      pendiente={p}
                      deletingId={deletingId}
                      onToggle={handleToggleCompletado}
                      onEdit={openEdit}
                      onDeleteRequest={setDeletingId}
                      onDeleteConfirm={handleDelete}
                      onDeleteCancel={() => setDeletingId(null)}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Completados */}
            {pendientesCompletados.length > 0 && (
              <div>
                <div className="px-6 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Completados ({pendientesCompletados.length})
                  </span>
                </div>
                <ul className="divide-y divide-zinc-100">
                  {pendientesCompletados.map((p) => (
                    <PendienteRow
                      key={p.id}
                      pendiente={p}
                      deletingId={deletingId}
                      onToggle={handleToggleCompletado}
                      onEdit={openEdit}
                      onDeleteRequest={setDeletingId}
                      onDeleteConfirm={handleDelete}
                      onDeleteCancel={() => setDeletingId(null)}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal agregar / editar */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Editar pendiente" : "Agregar pendiente"}
        >
          <div className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-blue-600">
                  {editing ? "edit" : "add_circle"}
                </span>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {editing ? "Editar pendiente" : "Agregar pendiente"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal body */}
            <div className="flex flex-col gap-4 px-6 py-5">
              {/* Nombre del cliente */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Nombre del cliente
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    person
                  </span>
                  <input
                    type="text"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    placeholder="Ej: Juan García"
                    disabled={saving}
                    className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Qué auto quiere */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  ¿Qué auto quiere?
                </label>
                <textarea
                  value={detalle}
                  onChange={(e) => setDetalle(e.target.value)}
                  placeholder="Ej: Toyota Corolla 2020, automático, menos de 50.000 km. Preferencia color blanco o gris."
                  rows={4}
                  disabled={saving}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-none"
                />
              </div>

              {modalError && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {modalError}
                </p>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                )}
                {editing ? "Guardar cambios" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

interface PendienteRowProps {
  pendiente: Pendiente;
  deletingId: string | null;
  onToggle: (p: Pendiente) => void;
  onEdit: (p: Pendiente) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
}

function PendienteRow({
  pendiente: p,
  deletingId,
  onToggle,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: PendienteRowProps) {
  const isDeleting = deletingId === p.id;

  return (
    <li className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-zinc-50">
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(p)}
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        style={{
          borderColor: p.completado ? "#2563eb" : "#d1d5db",
          backgroundColor: p.completado ? "#2563eb" : "transparent",
        }}
        aria-label={p.completado ? "Marcar como pendiente" : "Marcar como completado"}
      >
        {p.completado && (
          <span className="material-symbols-outlined text-sm text-white" style={{ fontSize: "14px" }}>
            check
          </span>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            p.completado ? "text-zinc-400 line-through" : "text-zinc-900"
          }`}
        >
          {p.nombreCliente}
        </p>
        <p
          className={`mt-0.5 text-sm ${
            p.completado ? "text-zinc-400 line-through" : "text-zinc-600"
          }`}
        >
          {p.detalle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1">
        {isDeleting ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">¿Eliminar?</span>
            <button
              type="button"
              onClick={() => onDeleteConfirm(p.id)}
              className="flex h-7 items-center rounded-lg bg-red-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sí
            </button>
            <button
              type="button"
              onClick={onDeleteCancel}
              className="flex h-7 items-center rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(p)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Editar"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest(p.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Eliminar"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </>
        )}
      </div>
    </li>
  );
}
