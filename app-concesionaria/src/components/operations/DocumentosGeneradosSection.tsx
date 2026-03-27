"use client";

import { useCallback, useEffect, useState } from "react";
import { GenerarDocumentoModal } from "./GenerarDocumentoModal";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface GeneratedDocument {
  id: string;
  nombreArchivo: string;
  creadoEn: string;
  templateId: string;
}

interface DocumentosGeneradasSectionProps {
  contextType: "operacion" | "vehiculo";
  contextId: string;
  /** Incrementar para forzar re-fetch (ej. al generar un nuevo documento) */
  refreshKey?: number;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DocumentosGeneradosSection({
  contextType,
  contextId,
  refreshKey = 0,
}: DocumentosGeneradasSectionProps) {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de borrado
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estado de edición (regenerar)
  const [editDoc, setEditDoc] = useState<GeneratedDocument | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/documents?contextType=${contextType}&contextId=${encodeURIComponent(contextId)}`
      );
      if (!res.ok) throw new Error("Error al cargar documentos");
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch {
      setError("No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
    }
  }, [contextType, contextId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleDownload(doc: GeneratedDocument) {
    const a = document.createElement("a");
    a.href = `/api/documents/${doc.id}/download`;
    a.download = doc.nombreArchivo;
    a.click();
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    setDeleteError(null);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/documents/${confirmDeleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setDocuments((prev) => prev.filter((d) => d.id !== confirmDeleteId));
    } catch {
      setDeleteError("No se pudo eliminar el documento. Intentá de nuevo.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Renderizado condicional ───────────────────────────────────────────────

  // Mientras carga la primera vez, no mostramos nada para no ocupar espacio
  if (loading && documents.length === 0) return null;

  // Si no hay documentos y no hay error, no renderizar la sección
  if (!loading && !error && documents.length === 0) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <section
        aria-label="Documentos generados"
        className="flex flex-col gap-3"
      >
        <h3 className="text-sm font-semibold text-zinc-700">
          Documentos generados
        </h3>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {documents.map((doc) => (
              <DocumentoRow
                key={doc.id}
                doc={doc}
                isDeleting={deletingId === doc.id}
                onDownload={() => handleDownload(doc)}
                onEdit={() => setEditDoc(doc)}
                onDelete={() => {
                  setDeleteError(null);
                  setConfirmDeleteId(doc.id);
                }}
              />
            ))}
          </ul>
        )}

        {deleteError && (
          <p
            role="alert"
            className="flex items-center gap-2 text-sm text-red-600"
          >
            <span
              className="material-symbols-outlined text-base"
              aria-hidden="true"
            >
              error
            </span>
            {deleteError}
          </p>
        )}
      </section>

      {/* Diálogo de confirmación de borrado */}
      {confirmDeleteId && (
        <ConfirmDeleteDialog
          nombreArchivo={
            documents.find((d) => d.id === confirmDeleteId)?.nombreArchivo ?? ""
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {/* Modal de regeneración */}
      {editDoc && (
        <GenerarDocumentoModal
          templateId={editDoc.templateId}
          contextType={contextType}
          contextId={contextId}
          onClose={() => setEditDoc(null)}
          onGenerated={() => {
            setEditDoc(null);
            fetchDocuments();
          }}
        />
      )}
    </>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

interface DocumentoRowProps {
  doc: GeneratedDocument;
  isDeleting: boolean;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DocumentoRow({
  doc,
  isDeleting,
  onDownload,
  onEdit,
  onDelete,
}: DocumentoRowProps) {
  const fecha = new Date(doc.creadoEn).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="material-symbols-outlined shrink-0 text-xl text-zinc-400"
          aria-hidden="true"
        >
          picture_as_pdf
        </span>
        <div className="min-w-0">
          <p
            className="truncate text-sm font-medium text-zinc-800"
            title={doc.nombreArchivo}
          >
            {doc.nombreArchivo}
          </p>
          <p className="text-xs text-zinc-500">{fecha}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={isDeleting}
          aria-label={`Descargar ${doc.nombreArchivo}`}
          className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            download
          </span>
          Descargar
        </button>

        <button
          type="button"
          onClick={onEdit}
          disabled={isDeleting}
          aria-label={`Editar ${doc.nombreArchivo}`}
          className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            edit
          </span>
          Editar
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={`Borrar ${doc.nombreArchivo}`}
          className="flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 disabled:opacity-50"
        >
          {isDeleting ? (
            <span
              className="material-symbols-outlined animate-spin text-sm"
              aria-hidden="true"
            >
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              delete
            </span>
          )}
          Borrar
        </button>
      </div>
    </li>
  );
}

interface ConfirmDeleteDialogProps {
  nombreArchivo: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeleteDialog({
  nombreArchivo,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar eliminación"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-start gap-4 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <span
              className="material-symbols-outlined text-2xl text-red-600"
              aria-hidden="true"
            >
              delete
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              Eliminar documento
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              ¿Estás seguro que querés eliminar{" "}
              <span className="font-medium text-zinc-700">{nombreArchivo}</span>?
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
