"use client";

import { useEffect, useState } from "react";

interface DocumentTemplate {
  id: string;
  nombre: string;
}

interface GenerarDocumentoButtonProps {
  contextType: "operacion" | "vehiculo";
  contextId: string;
  onTemplateSelected: (templateId: string) => void;
}

export function GenerarDocumentoButton({
  contextType,
  contextId,
  onTemplateSelected,
}: GenerarDocumentoButtonProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchTemplates() {
      try {
        const res = await fetch(
          `/api/document-templates/available?contextType=${contextType}&contextId=${encodeURIComponent(contextId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setTemplates(data.templates ?? []);
          setLoaded(true);
        }
      } catch {
        // fallo silencioso: no romper la página
        if (!cancelled) setLoaded(true);
      }
    }
    fetchTemplates();
    return () => {
      cancelled = true;
    };
  }, [contextType, contextId]);

  if (!loaded || templates.length === 0) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setModalOpen(false);
  }

  function handleSelect(templateId: string) {
    setModalOpen(false);
    onTemplateSelected(templateId);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
      >
        <span className="material-symbols-outlined text-lg">description</span>
        Generar documento
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Seleccionar plantilla de documento"
          onClick={handleBackdropClick}
        >
          <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-blue-600">
                  description
                </span>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Generar documento
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-2 px-6 py-5">
              {templates.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No hay documentos disponibles para este módulo.
                </p>
              ) : (
                <>
                  <p className="mb-1 text-sm text-zinc-500">
                    Seleccioná una plantilla para generar el documento:
                  </p>
                  <ul className="flex flex-col gap-2" role="list">
                    {templates.map((tpl) => (
                      <li key={tpl.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(tpl.id)}
                          className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-800 transition-colors hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-zinc-400">
                              article
                            </span>
                            {tpl.nombre}
                          </span>
                          <span className="material-symbols-outlined text-base text-zinc-400">
                            chevron_right
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-zinc-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
