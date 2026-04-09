"use client";

import { useEffect, useRef, useState } from "react";
import { PdfCanvas } from "@/components/documents/PdfCanvas";

// ── Tipos ────────────────────────────────────────────────────────────────────

type FieldType = "Auto" | "Fijo" | "Manual";

interface TemplateField {
  id: string;
  label: string;
  tipo: FieldType;
  value: string | null;
  /** Posición y tamaño en % relativo a la página del documento */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PreviewData {
  templateName: string;
  fields: TemplateField[];
  pdfBase64?: string;
}

interface GenerarDocumentoModalProps {
  templateId: string;
  contextType: "operacion" | "vehiculo";
  contextId: string;
  onClose: () => void;
  onGenerated: () => void;
}

// ── Componente ───────────────────────────────────────────────────────────────

export function GenerarDocumentoModal({
  templateId,
  contextType,
  contextId,
  onClose,
  onGenerated,
}: GenerarDocumentoModalProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Crear blob URL del PDF template para la vista previa
  useEffect(() => {
    if (!previewData?.pdfBase64) return;
    const bytes = Uint8Array.from(atob(previewData.pdfBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewData?.pdfBase64]);

  const backdropRef = useRef<HTMLDivElement>(null);

  // Cargar datos de preview al montar
  useEffect(() => {
    let cancelled = false;

    async function fetchPreview() {
      setLoadingPreview(true);
      setPreviewError(null);
      try {
        const res = await fetch(
          `/api/document-templates/${templateId}/preview-data?contextType=${contextType}&contextId=${encodeURIComponent(contextId)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Error al cargar la vista previa");
        }
        const data: PreviewData = await res.json();
        if (!cancelled) {
          const today = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
          data.fields = data.fields.map((f) =>
            f.value === "__FECHA_ACTUAL__" ? { ...f, value: today } : f
          );
          setPreviewData(data);
          // Inicializar valores manuales vacíos
          const initials: Record<string, string> = {};
          for (const f of data.fields) {
            if (f.tipo === "Manual") initials[f.id] = "";
          }
          setManualValues(initials);
        }
      } catch (err) {
        if (!cancelled)
          setPreviewError(
            err instanceof Error ? err.message : "Error desconocido"
          );
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    }

    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [templateId, contextType, contextId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) onClose();
  }

  function handleManualChange(fieldId: string, value: string) {
    setManualValues((prev) => ({ ...prev, [fieldId]: value }));
    setGenerateError(null);
  }

  const manualFields =
    previewData?.fields.filter((f) => f.tipo === "Manual") ?? [];
  const allManualFilled = manualFields.every(
    (f) => manualValues[f.id]?.trim() !== ""
  );
  const canGenerate = !loadingPreview && !previewError && allManualFilled;

  async function handleGenerate() {
    if (!canGenerate || generating) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch(`/api/documents/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, contextType, contextId, manualFields: manualValues }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Error al generar el documento");
      }
      onGenerated();
      onClose();
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Error al generar el documento"
      );
    } finally {
      setGenerating(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa del documento"
      onClick={handleBackdropClick}
    >
      <div className="flex w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              description
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">
              {previewData?.templateName ?? "Vista previa del documento"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loadingPreview ? (
            <LoadingState />
          ) : previewError ? (
            <ErrorState message={previewError} />
          ) : previewData ? (
            <div className="flex flex-col gap-5">
              {/* Leyenda */}
              <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm border border-blue-400 bg-blue-50" />
                  Campo automático / fijo
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm border border-amber-400 bg-amber-50" />
                  Campo manual (completar)
                </span>
              </div>

              {/* Página del documento */}
              <DocumentPage fields={previewData.fields} manualValues={manualValues} onManualChange={handleManualChange} pdfBlobUrl={pdfBlobUrl} />

              {/* Error de generación */}
              {generateError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="material-symbols-outlined text-base">error</span>
                  {generateError}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 shrink-0">
          <p className="text-xs text-zinc-400">
            {manualFields.length > 0 && !allManualFilled
              ? "Completá todos los campos manuales para continuar"
              : manualFields.length > 0
              ? "Todos los campos están completos"
              : ""}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={generating}
              className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span
                    className="material-symbols-outlined animate-spin text-base"
                    aria-hidden="true"
                  >
                    progress_activity
                  </span>
                  Generando…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    picture_as_pdf
                  </span>
                  Generar documento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponentes internos ───────────────────────────────────────────────────

interface DocumentPageProps {
  fields: TemplateField[];
  manualValues: Record<string, string>;
  onManualChange: (fieldId: string, value: string) => void;
  pdfBlobUrl: string | null;
}

function DocumentPage({ fields, manualValues, onManualChange, pdfBlobUrl }: DocumentPageProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div
        className="relative w-full rounded border border-zinc-300 bg-white shadow-md overflow-hidden"
        aria-label="Vista previa del documento"
      >
        {/* Fondo: PDF renderizado con pdf.js (sin iframe, sin toolbar del browser) */}
        {pdfBlobUrl ? (
          <PdfCanvas src={pdfBlobUrl} className="w-full" />
        ) : (
          <div
            className="w-full"
            style={{
              paddingTop: "141.4%",
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 27px, #f4f4f5 27px, #f4f4f5 28px)",
            }}
          />
        )}

        {/* Campos superpuestos — absolute inset-0 sobre el canvas */}
        <div className="absolute inset-0">
          {fields.map((field) => (
            <FieldOverlay
              key={field.id}
              field={field}
              manualValue={manualValues[field.id] ?? ""}
              onManualChange={onManualChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FieldOverlayProps {
  field: TemplateField;
  manualValue: string;
  onManualChange: (fieldId: string, value: string) => void;
}

function FieldOverlay({ field, manualValue, onManualChange }: FieldOverlayProps) {
  const isManual = field.tipo === "Manual";
  const hasValue = field.value !== null && field.value !== "";

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${field.x}%`,
    top: `${field.y}%`,
    width: `${field.width}%`,
    height: `${field.height}%`,
  };

  if (isManual) {
    return (
      <div style={style} className="flex items-center">
        <label htmlFor={`field-${field.id}`} className="sr-only">
          {field.label}
        </label>
        <input
          id={`field-${field.id}`}
          type="text"
          value={manualValue}
          onChange={(e) => onManualChange(field.id, e.target.value)}
          placeholder={field.label}
          className="h-full w-full rounded border border-amber-400 bg-white px-1.5 text-xs text-zinc-800 placeholder-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>
    );
  }

  return (
    <div
      style={style}
      className="overflow-hidden rounded border border-blue-300"
      aria-label={`${field.label}: ${field.value ?? "sin datos"}`}
    >
      <div className="flex h-full w-full items-center bg-white px-1.5">
        <span className="truncate text-xs text-zinc-700">
          {hasValue ? field.value : ""}
        </span>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
      <span
        className="material-symbols-outlined animate-spin text-4xl"
        aria-hidden="true"
      >
        progress_activity
      </span>
      <p className="text-sm">Cargando vista previa…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="material-symbols-outlined text-4xl text-red-400" aria-hidden="true">
        error
      </span>
      <p className="text-sm font-medium text-zinc-700">
        No se pudo cargar la vista previa
      </p>
      <p className="text-xs text-zinc-400">{message}</p>
    </div>
  );
}
