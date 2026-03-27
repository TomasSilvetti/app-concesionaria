"use client";

import { useEffect, useRef, useState } from "react";

interface PdfCanvasProps {
  /** URL o blob URL del PDF a renderizar */
  src: string;
  /** Clase CSS adicional para el canvas */
  className?: string;
}

/**
 * Renderiza la primera página de un PDF sobre un <canvas> usando pdf.js.
 * Garantiza que las coordenadas % del overlay coincidan 1:1 entre el editor
 * y el modal de generación, sin depender del visor nativo del browser.
 */
export function PdfCanvas({ src, className }: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderTask: any = null;

    async function render() {
      setError(false);
      try {
        // Importar pdf.js dinámicamente para evitar SSR issues
        const pdfjsLib = await import("pdfjs-dist");

        // Worker copiado a /public para evitar problemas de resolución en Next.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

        const loadingTask = pdfjsLib.getDocument(src);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Renderizar al doble de DPR para nitidez en pantallas retina
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: 1 });

        // Escalar para que el canvas ocupe el ancho del contenedor
        const containerWidth = canvas.parentElement?.clientWidth ?? viewport.width;
        const scale = (containerWidth / viewport.width) * dpr;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        // El tamaño CSS se controla con w-full h-auto
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${scaledViewport.height / dpr}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport });
        await renderTask.promise;
      } catch (err) {
        if (!cancelled) {
          console.error("[PdfCanvas] Error al renderizar PDF:", err);
          setError(true);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [src]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
        No se pudo renderizar el PDF
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label="Vista previa del PDF"
    />
  );
}
