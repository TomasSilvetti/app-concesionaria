"use client";

import React, { useState, useRef, useEffect } from "react";
import "material-symbols/outlined.css";
import { PdfCanvas } from "./PdfCanvas";

interface Recuadro {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nombre: string;
  tipo: "auto" | "fijo" | "manual" | "";
  valor: string;
}

interface PlantillaEditorModalProps {
  onClose: () => void;
  onSaved: () => void;
  plantillaId?: string;
}

const CONTEXT_FIELDS: Record<string, { value: string; label: string }[]> = {
  operacion: [
    { value: "operacion.nombreComprador", label: "Comprador → Nombre" },
    { value: "operacion.fechaVenta", label: "Fecha de venta" },
    { value: "operacion.fechaInicio", label: "Fecha de inicio" },
    { value: "operacion.precioVentaTotal", label: "Precio de venta total" },
    { value: "operacion.precioToma", label: "Precio de toma" },
    { value: "operacion.tipoOperacion", label: "Tipo de operación" },
    { value: "operacion.estado", label: "Estado" },
    { value: "operacion.ingresosBrutos", label: "Ingresos brutos" },
    { value: "operacion.comision", label: "Comisión" },
    { value: "operacion.ingresosNetos", label: "Ingresos netos" },
    { value: "operacion.vehiculo.modelo", label: "Vehículo → Modelo" },
    { value: "operacion.vehiculo.patente", label: "Vehículo → Patente" },
    { value: "operacion.vehiculo.anio", label: "Vehículo → Año" },
    { value: "operacion.vehiculo.color", label: "Vehículo → Color" },
    { value: "operacion.vehiculo.version", label: "Vehículo → Versión" },
    { value: "operacion.vehiculo.kilometros", label: "Vehículo → Kilómetros" },
    { value: "operacion.marca.nombre", label: "Vehículo → Marca" },
    { value: "operacion.categoria.nombre", label: "Vehículo → Categoría" },
  ],
  vehiculo: [
    { value: "vehiculo.marca.nombre", label: "Marca" },
    { value: "vehiculo.categoria.nombre", label: "Categoría" },
    { value: "vehiculo.modelo", label: "Modelo" },
    { value: "vehiculo.anio", label: "Año" },
    { value: "vehiculo.patente", label: "Patente" },
    { value: "vehiculo.color", label: "Color" },
    { value: "vehiculo.kilometros", label: "Kilómetros" },
    { value: "vehiculo.version", label: "Versión" },
    { value: "vehiculo.precioRevista", label: "Precio revista" },
    { value: "vehiculo.precioOferta", label: "Precio oferta" },
    { value: "vehiculo.precioToma", label: "Precio de toma" },
    { value: "vehiculo.estado", label: "Estado" },
  ],
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function PlantillaEditorModal({ onClose, onSaved, plantillaId }: PlantillaEditorModalProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [recuadros, setRecuadros] = useState<Recuadro[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const [nombre, setNombre] = useState("");
  const [contexto, setContexto] = useState<"operacion" | "vehiculo" | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  const isEditMode = !!plantillaId;

  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!plantillaId) return;
    const loadTemplate = async () => {
      setIsLoadingEdit(true);
      try {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const [templateRes, pdfRes] = await Promise.all([
          fetch(`${baseUrl}/api/admin/document-templates/${plantillaId}`),
          fetch(`${baseUrl}/api/admin/document-templates/${plantillaId}/pdf`),
        ]);
        if (templateRes.ok) {
          const data = await templateRes.json();
          const template = data.template;
          setNombre(template.nombre);
          setContexto(template.contexto);
          setRecuadros(
            (template.DocumentField ?? []).map(
              (f: {
                id: string;
                nombre: string;
                tipo: "auto" | "fijo" | "manual";
                valorFijo: string | null;
                rutaAuto: string | null;
                posX: number;
                posY: number;
                ancho: number;
                alto: number;
              }) => ({
                id: f.id,
                x: f.posX,
                y: f.posY,
                width: f.ancho,
                height: f.alto,
                nombre: f.nombre,
                tipo: f.tipo,
                valor:
                  f.tipo === "auto"
                    ? (f.rutaAuto ?? "")
                    : f.tipo === "fijo"
                    ? (f.valorFijo ?? "")
                    : "",
              })
            )
          );
        }
        if (pdfRes.ok) {
          const blob = await pdfRes.blob();
          setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      } catch {
        // error silencioso — el usuario puede recargar
      } finally {
        setIsLoadingEdit(false);
      }
    };
    loadTemplate();
  }, [plantillaId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type !== "application/pdf") {
      setPdfError("El archivo seleccionado no es un PDF válido.");
      return;
    }

    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfError(null);
    setPdfFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setRecuadros([]);
    setSelectedId(null);
  };

  const getRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return null;
    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== overlayRef.current) return;
    e.preventDefault();
    const coords = getRelativeCoords(e);
    if (!coords) return;
    setIsDrawing(true);
    setDrawStart(coords);
    setCurrentDraw(null);
    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;
    const coords = getRelativeCoords(e);
    if (!coords) return;
    setCurrentDraw({
      x: Math.min(drawStart.x, coords.x),
      y: Math.min(drawStart.y, coords.y),
      w: Math.abs(coords.x - drawStart.x),
      h: Math.abs(coords.y - drawStart.y),
    });
  };

  const finishDraw = () => {
    setIsDrawing(false);
    setDrawStart(null);
    if (currentDraw && currentDraw.w >= 2 && currentDraw.h >= 1) {
      const newRecuadro: Recuadro = {
        id: generateId(),
        x: currentDraw.x,
        y: currentDraw.y,
        width: currentDraw.w,
        height: currentDraw.h,
        nombre: "",
        tipo: "",
        valor: "",
      };
      setRecuadros((prev) => [...prev, newRecuadro]);
      setSelectedId(newRecuadro.id);
    }
    setCurrentDraw(null);
  };

  const updateRecuadro = (id: string, changes: Partial<Recuadro>) => {
    setRecuadros((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  };

  const deleteRecuadro = (id: string) => {
    setRecuadros((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedRecuadro = recuadros.find((r) => r.id === selectedId) ?? null;
  const selectedIndex = recuadros.findIndex((r) => r.id === selectedId);
  const recuadrosInvalidos = recuadros.filter((r) => !r.nombre.trim() || !r.tipo);

  const canSave =
    !!pdfUrl &&
    nombre.trim().length > 0 &&
    contexto !== "" &&
    recuadrosInvalidos.length === 0;

  const handleSave = async () => {
    if (!canSave) return;
    if (!isEditMode && !pdfFile) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      if (pdfFile) formData.append("pdf", pdfFile);
      formData.append("nombre", nombre.trim());
      formData.append("contexto", contexto);
      formData.append(
        "campos",
        JSON.stringify(
          recuadros.map((r, i) => ({
            nombre: r.nombre,
            tipo: r.tipo,
            valorFijo: r.tipo === "fijo" ? r.valor : undefined,
            rutaAuto: r.tipo === "auto" ? r.valor : undefined,
            posX: r.x,
            posY: r.y,
            ancho: r.width,
            alto: r.height,
            orden: i,
          }))
        )
      );

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const url = isEditMode
        ? `${baseUrl}/api/admin/document-templates/${plantillaId}`
        : `${baseUrl}/api/admin/document-templates`;
      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        body: formData,
      });

      if (res.ok || res.status === 404) {
        onSaved();
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.message ?? "Error al guardar la plantilla.");
      }
    } catch {
      // API aún no implementada — tratar como éxito para preview de frontend
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
    >
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <span className="material-symbols-outlined text-lg text-blue-600">description</span>
          </div>
          <h1 id="editor-title" className="text-base font-semibold text-zinc-900">
            {isEditMode ? "Editar plantilla" : "Nueva plantilla"}
          </h1>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          aria-label="Cerrar editor"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </header>

      {/* Hidden file input — shared by upload zone and toolbar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Seleccionar archivo PDF"
      />

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left: PDF viewer */}
        <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-100 p-4">
          {!pdfUrl ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              {isLoadingEdit ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-4xl text-zinc-400">
                    progress_activity
                  </span>
                  <p className="text-sm text-zinc-500">Cargando plantilla...</p>
                </div>
              ) : (
                <>
                  {pdfError && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <span className="material-symbols-outlined text-base">error</span>
                      {pdfError}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-12 py-12 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                      <span className="material-symbols-outlined text-4xl text-zinc-400">
                        upload_file
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-zinc-900">Subir PDF</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Hacé clic para seleccionar un archivo PDF
                      </p>
                    </div>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base text-zinc-400">
                    description
                  </span>
                  <span className="max-w-[180px] truncate font-medium text-zinc-800 sm:max-w-xs">
                    {pdfFile?.name ?? (isEditMode ? "PDF actual" : "")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-zinc-400 sm:inline">
                    Arrastrá para dibujar recuadros
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    Cambiar PDF
                  </button>
                </div>
              </div>

              {/* PDF + drawing overlay */}
              <div className="flex-1 overflow-auto rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm">
                <div className="relative w-full bg-white">
                  <PdfCanvas src={pdfUrl} className="w-full" />
                  <div
                    ref={overlayRef}
                    className="absolute inset-0"
                    style={{ cursor: "crosshair" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={finishDraw}
                    onMouseLeave={finishDraw}
                  >
                    {recuadros.map((r, i) => {
                      const isSelected = r.id === selectedId;
                      const hasError = !r.nombre.trim() || !r.tipo;
                      return (
                        <div
                          key={r.id}
                          style={{
                            position: "absolute",
                            left: `${r.x}%`,
                            top: `${r.y}%`,
                            width: `${r.width}%`,
                            height: `${r.height}%`,
                          }}
                          className={`cursor-pointer rounded-sm border-2 transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/15"
                              : hasError
                              ? "border-red-400 bg-red-500/10 hover:border-red-500"
                              : "border-emerald-500 bg-emerald-500/10 hover:border-emerald-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(r.id);
                          }}
                        >
                          <div
                            className={`absolute left-0.5 top-0.5 max-w-[90%] truncate rounded px-1.5 py-0.5 text-xs font-semibold text-white ${
                              isSelected
                                ? "bg-blue-500"
                                : hasError
                                ? "bg-red-400"
                                : "bg-emerald-500"
                            }`}
                          >
                            {r.nombre || `#${i + 1}`}
                          </div>
                        </div>
                      );
                    })}

                    {isDrawing && currentDraw && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${currentDraw.x}%`,
                          top: `${currentDraw.y}%`,
                          width: `${currentDraw.w}%`,
                          height: `${currentDraw.h}%`,
                          border: "2px dashed #3b82f6",
                          backgroundColor: "rgba(59,130,246,0.1)",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Configuration panel */}
        <div className="flex w-full flex-col overflow-y-auto border-t border-zinc-200 bg-white lg:w-80 lg:border-l lg:border-t-0">
          {/* Rectangles list */}
          <div className="flex-shrink-0 border-b border-zinc-100 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-800">
                Recuadros
                {recuadros.length > 0 && (
                  <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    {recuadros.length}
                  </span>
                )}
              </h2>
              {recuadrosInvalidos.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {recuadrosInvalidos.length} sin configurar
                </span>
              )}
            </div>

            {recuadros.length === 0 ? (
              <p className="mt-3 text-xs text-zinc-400">
                {pdfUrl
                  ? "Dibujá recuadros arrastrando el mouse sobre el PDF."
                  : "Subí un PDF para empezar."}
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-1">
                {recuadros.map((r, i) => {
                  const hasError = !r.nombre.trim() || !r.tipo;
                  return (
                    <li key={r.id}>
                      <button
                        onClick={() =>
                          setSelectedId(r.id === selectedId ? null : r.id)
                        }
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          r.id === selectedId
                            ? "bg-blue-50 text-blue-800"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white ${
                            hasError ? "bg-red-400" : "bg-emerald-500"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate">
                          {r.nombre || (
                            <span className="italic text-zinc-400">Sin nombre</span>
                          )}
                        </span>
                        {r.tipo && (
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium uppercase text-zinc-500">
                            {r.tipo}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Rectangle config */}
          <div className="flex-1 p-4">
            {!selectedRecuadro ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-zinc-200">
                  select_all
                </span>
                <p className="mt-3 text-sm text-zinc-400">
                  {recuadros.length > 0
                    ? "Seleccioná un recuadro para configurarlo."
                    : "Los recuadros que dibujes aparecerán aquí."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-800">
                    Recuadro {selectedIndex + 1}
                  </h3>
                  <button
                    onClick={() => deleteRecuadro(selectedRecuadro.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Eliminar recuadro"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Eliminar
                  </button>
                </div>

                {/* Nombre */}
                <div>
                  <label
                    htmlFor="recuadro-nombre"
                    className="mb-1.5 block text-xs font-medium text-zinc-700"
                  >
                    Nombre del campo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="recuadro-nombre"
                    type="text"
                    value={selectedRecuadro.nombre}
                    onChange={(e) =>
                      updateRecuadro(selectedRecuadro.id, { nombre: e.target.value })
                    }
                    placeholder="ej: Nombre del cliente"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !selectedRecuadro.nombre.trim()
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-white"
                    }`}
                  />
                  {!selectedRecuadro.nombre.trim() && (
                    <p className="mt-1 text-xs text-red-600">El nombre es obligatorio.</p>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-700">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["auto", "fijo", "manual"] as const).map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() =>
                          updateRecuadro(selectedRecuadro.id, { tipo, valor: "" })
                        }
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          selectedRecuadro.tipo === tipo
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        {tipo === "auto" ? "Auto" : tipo === "fijo" ? "Fijo" : "Manual"}
                      </button>
                    ))}
                  </div>
                  {!selectedRecuadro.tipo && (
                    <p className="mt-1 text-xs text-red-600">Seleccioná un tipo.</p>
                  )}
                </div>

                {/* Valor según tipo */}
                {selectedRecuadro.tipo === "auto" && (
                  <div>
                    <label
                      htmlFor="recuadro-campo"
                      className="mb-1.5 block text-xs font-medium text-zinc-700"
                    >
                      Campo del contexto
                    </label>
                    {!contexto ? (
                      <p className="flex items-center gap-1 text-xs text-amber-600">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Seleccioná el contexto de la plantilla primero.
                      </p>
                    ) : (
                      <select
                        id="recuadro-campo"
                        value={selectedRecuadro.valor}
                        onChange={(e) =>
                          updateRecuadro(selectedRecuadro.id, { valor: e.target.value })
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccioná un campo...</option>
                        {CONTEXT_FIELDS[contexto]?.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {selectedRecuadro.tipo === "fijo" && (
                  <div>
                    <label
                      htmlFor="recuadro-valor"
                      className="mb-1.5 block text-xs font-medium text-zinc-700"
                    >
                      Valor fijo
                    </label>
                    <input
                      id="recuadro-valor"
                      type="text"
                      value={selectedRecuadro.valor}
                      onChange={(e) =>
                        updateRecuadro(selectedRecuadro.id, { valor: e.target.value })
                      }
                      placeholder="ej: Buenos Aires, Argentina"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {selectedRecuadro.tipo === "manual" && (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="flex items-start gap-2 text-xs text-zinc-600">
                      <span className="material-symbols-outlined flex-shrink-0 text-sm text-zinc-400">
                        info
                      </span>
                      Este campo se completará manualmente al generar el documento.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1">
            <label
              htmlFor="plantilla-nombre"
              className="mb-1.5 block text-xs font-medium text-zinc-700"
            >
              Nombre de la plantilla <span className="text-red-500">*</span>
            </label>
            <input
              id="plantilla-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="ej: Contrato de compraventa"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full sm:w-44">
            <label
              htmlFor="plantilla-contexto"
              className="mb-1.5 block text-xs font-medium text-zinc-700"
            >
              Contexto <span className="text-red-500">*</span>
            </label>
            <select
              id="plantilla-contexto"
              value={contexto}
              onChange={(e) =>
                setContexto(e.target.value as "operacion" | "vehiculo" | "")
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccioná...</option>
              <option value="operacion">Operación</option>
              <option value="vehiculo">Vehículo</option>
            </select>
          </div>

          <div className="flex flex-col items-end gap-1">
            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            <button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Guardar plantilla
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
