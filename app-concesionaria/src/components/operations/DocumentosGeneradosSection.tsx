"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GenerarDocumentoModal } from "./GenerarDocumentoModal";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface GeneratedDocument {
  id: string;
  nombreArchivo: string;
  mimeType: string;
  creadoEn: string;
  templateId: string | null;
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

  // Estado de upload
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contextType", contextType);
      formData.append("contextId", contextId);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Error al subir el archivo");
      }

      const newDoc = await res.json();
      setDocuments((prev) => [newDoc, ...prev]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <section aria-label="Documentos" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-zinc-700">Documentos</h3>

        {/* Zona drag & drop */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Subir documento"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 ${
            isDragOver
              ? "border-zinc-400 bg-zinc-100"
              : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {uploading ? (
            <>
              <span
                className="material-symbols-outlined animate-spin text-2xl text-zinc-400"
                aria-hidden="true"
              >
                progress_activity
              </span>
              <p className="text-xs text-zinc-500">Subiendo archivo…</p>
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined text-2xl text-zinc-400"
                aria-hidden="true"
              >
                upload_file
              </span>
              <p className="text-xs text-zinc-500">
                Arrastrá un archivo o{" "}
                <span className="font-medium text-zinc-700">hacé clic para seleccionar</span>
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          aria-hidden="true"
        />

        {uploadError && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              error
            </span>
            {uploadError}
          </p>
        )}

        {/* Lista de documentos */}
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !loading && documents.length > 0 ? (
          <ul className="flex flex-col gap-2" role="list">
            {documents.map((doc) => (
              <DocumentoRow
                key={doc.id}
                doc={doc}
                isDeleting={deletingId === doc.id}
                onDownload={() => handleDownload(doc)}
                onEdit={doc.templateId ? () => setEditDoc(doc) : undefined}
                onDelete={() => {
                  setDeleteError(null);
                  setConfirmDeleteId(doc.id);
                }}
              />
            ))}
          </ul>
        ) : null}

        {deleteError && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
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
      {editDoc && editDoc.templateId && (
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
  onEdit?: () => void;
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

  const iconName = doc.mimeType?.startsWith("image/")
    ? "image"
    : doc.mimeType === "application/pdf"
    ? "picture_as_pdf"
    : "description";

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="material-symbols-outlined shrink-0 text-xl text-zinc-400"
          aria-hidden="true"
        >
          {iconName}
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

        {onEdit && (
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
        )}

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
