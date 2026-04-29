"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "material-symbols/outlined.css";

interface Documento {
  id: string;
  nombre: string;
  nombreOriginal: string;
  mimeType: string;
  tamano: number;
  subidoPorNombre: string;
  creadoEn: string;
}

const MIME_ICONS: Record<string, string> = {
  "application/pdf": "picture_as_pdf",
  "application/msword": "description",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "description",
  "application/vnd.ms-excel": "table_chart",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "table_chart",
  "text/csv": "table_chart",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "text/plain": "article",
};

const MIME_COLORS: Record<string, string> = {
  "application/pdf": "text-red-500",
  "application/msword": "text-blue-500",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "text-blue-500",
  "application/vnd.ms-excel": "text-green-600",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "text-green-600",
  "text/csv": "text-green-600",
  "image/png": "text-purple-500",
  "image/jpeg": "text-purple-500",
  "image/webp": "text-purple-500",
  "text/plain": "text-gray-500",
};

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "text/csv": "CSV",
  "image/png": "Imagen",
  "image/jpeg": "Imagen",
  "image/webp": "Imagen",
  "text/plain": "Texto",
};

function getFileIcon(mimeType: string) {
  return MIME_ICONS[mimeType] ?? "insert_drive_file";
}

function getFileColor(mimeType: string) {
  return MIME_COLORS[mimeType] ?? "text-foreground/40";
}

function getMimeLabel(mimeType: string) {
  return MIME_LABELS[mimeType] ?? "Archivo";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function DocumentosRepositorioPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDocumentos = useCallback(async () => {
    try {
      const res = await fetch("/api/repositorio-documentos");
      if (res.ok) setDocumentos(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    let errCount = 0;
    for (const file of list) {
      const fd = new FormData();
      fd.append("archivo", file);
      const res = await fetch("/api/repositorio-documentos", { method: "POST", body: fd });
      if (!res.ok) errCount++;
    }
    await fetchDocumentos();
    setUploading(false);
    if (errCount === 0) {
      showToast(
        list.length === 1 ? "Archivo subido correctamente" : `${list.length} archivos subidos`,
        "ok"
      );
    } else {
      showToast(`${errCount} archivo(s) no pudieron subirse`, "err");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDownload = async (doc: Documento) => {
    const res = await fetch(`/api/repositorio-documentos/${doc.id}`);
    if (!res.ok) { showToast("Error al descargar", "err"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.nombreOriginal;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setDeletingId(idToDelete);
    setDeleteId(null);
    const res = await fetch(`/api/repositorio-documentos/${idToDelete}`, { method: "DELETE" });
    if (res.ok) {
      setDocumentos((prev) => prev.filter((d) => d.id !== idToDelete));
      showToast("Documento eliminado", "ok");
    } else {
      showToast("Error al eliminar", "err");
    }
    setDeletingId(null);
  };

  const filtered = documentos.filter(
    (d) =>
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      d.nombreOriginal.toLowerCase().includes(search.toLowerCase())
  );

  const docToDelete = documentos.find((d) => d.id === deleteId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-sm text-foreground/50 mt-0.5">
            Repositorio compartido de archivos del equipo
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 self-start sm:self-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">upload</span>
          Subir archivo
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">{documentos.length}</p>
          <p className="text-xs text-foreground/40 mt-0.5">documentos</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">Espacio</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatBytes(documentos.reduce((acc, d) => acc + d.tamano, 0))}
          </p>
          <p className="text-xs text-foreground/40 mt-0.5">utilizados</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4 hidden sm:block">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">Último</p>
          <p className="text-sm font-semibold text-foreground mt-1 truncate">
            {documentos[0]?.nombre ?? "—"}
          </p>
          <p className="text-xs text-foreground/40 mt-0.5">
            {documentos[0] ? formatDate(documentos[0].creadoEn) : "Sin archivos aún"}
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all select-none
          ${dragging
            ? "border-primary bg-blue-50 scale-[1.005]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
          }
          ${uploading ? "pointer-events-none" : ""}
        `}
      >
        {uploading ? (
          <>
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">cloud_upload</span>
            <p className="text-sm font-medium text-foreground/60">Subiendo archivos...</p>
          </>
        ) : (
          <>
            <span className={`material-symbols-outlined text-4xl transition-colors ${dragging ? "text-primary" : "text-foreground/25"}`}>
              cloud_upload
            </span>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground/60">
                {dragging
                  ? "Soltá para subir"
                  : <>Arrastrá archivos acá o <span className="text-primary font-semibold">hacé clic para seleccionar</span></>
                }
              </p>
              <p className="text-xs text-foreground/35 mt-1">
                PDF, Word, Excel, CSV, imágenes y más · Máx. 50 MB por archivo
              </p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {/* Search + table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-foreground/20 animate-spin">
            progress_activity
          </span>
        </div>
      ) : documentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <span className="material-symbols-outlined text-3xl text-foreground/30">folder_open</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/60">No hay documentos todavía</p>
            <p className="text-xs text-foreground/40 mt-1">Subí el primer archivo usando el área de arriba</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="material-symbols-outlined text-3xl text-foreground/20">search_off</span>
              <p className="text-sm text-foreground/40">Sin resultados para &quot;{search}&quot;</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/45 w-10"></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/45">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/45 hidden sm:table-cell">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/45 hidden md:table-cell">Tamaño</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/45 hidden lg:table-cell">Subido por</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/45 hidden md:table-cell">Fecha</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-foreground/45">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <span className={`material-symbols-outlined text-2xl ${getFileColor(doc.mimeType)}`}>
                          {getFileIcon(doc.mimeType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium text-foreground truncate">{doc.nombre}</p>
                        {doc.nombre !== doc.nombreOriginal && (
                          <p className="text-xs text-foreground/35 truncate">{doc.nombreOriginal}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset
                          ${doc.mimeType.includes("pdf")
                            ? "bg-red-50 text-red-700 ring-red-200"
                            : doc.mimeType.includes("word") || doc.mimeType.includes("document")
                            ? "bg-blue-50 text-blue-700 ring-blue-200"
                            : doc.mimeType.includes("excel") || doc.mimeType.includes("sheet") || doc.mimeType.includes("csv")
                            ? "bg-green-50 text-green-700 ring-green-200"
                            : doc.mimeType.includes("image")
                            ? "bg-purple-50 text-purple-700 ring-purple-200"
                            : "bg-muted text-foreground/60 ring-border"
                          }`}>
                          {getMimeLabel(doc.mimeType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-foreground/55 text-xs">
                        {formatBytes(doc.tamano)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-foreground/55 text-xs">
                        {doc.subidoPorNombre}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-foreground/55 text-xs">
                        {formatDate(doc.creadoEn)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownload(doc)}
                            title="Descargar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 hover:bg-blue-50 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">download</span>
                          </button>
                          <button
                            onClick={() => setDeleteId(doc.id)}
                            disabled={deletingId === doc.id}
                            title="Eliminar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-xl">
                              {deletingId === doc.id ? "progress_activity" : "delete"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <span className="material-symbols-outlined text-2xl text-red-500">delete_forever</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">Eliminar documento</h3>
                {docToDelete && (
                  <p className="text-sm text-foreground/60 mt-1 font-medium">&ldquo;{docToDelete.nombre}&rdquo;</p>
                )}
                <p className="text-xs text-foreground/45 mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3 w-full pt-1">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-xl text-white text-sm font-medium transition-all
            ${toast.type === "ok" ? "bg-green-600" : "bg-red-500"}`}
        >
          <span className="material-symbols-outlined text-xl">
            {toast.type === "ok" ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
