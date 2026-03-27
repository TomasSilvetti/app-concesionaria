"use client";

import React, { useRef, useState } from "react";
import "material-symbols/outlined.css";
import { NumericInput } from "@/components/ui/NumericInput";

interface VehicleBrand {
  id: string;
  nombre: string;
}

interface VehicleCategory {
  id: string;
  nombre: string;
}

export interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

export interface VehicleFieldsData {
  marcaId: string;
  modelo: string;
  anio: string;
  patente: string;
  categoriaId: string;
  version: string;
  color: string;
  kilometros: string;
  notasMecanicas: string;
  notasGenerales: string;
  precioRevista: string;
  precioOferta: string;
  photos: PhotoFile[];
  precioVentaTotal?: string;
  ingresosBrutos?: string;
  precioToma?: string;
}

export interface VehicleFieldsHandlers {
  setMarcaId: (value: string) => void;
  setModelo: (value: string) => void;
  setAnio: (value: string) => void;
  setPatente: (value: string) => void;
  setCategoriaId: (value: string) => void;
  setVersion: (value: string) => void;
  setColor: (value: string) => void;
  setKilometros: (value: string) => void;
  setNotasMecanicas: (value: string) => void;
  setNotasGenerales: (value: string) => void;
  setPrecioRevista: (value: string) => void;
  setPrecioOferta: (value: string) => void;
  setPhotos: React.Dispatch<React.SetStateAction<PhotoFile[]>>;
  setPrecioVentaTotal?: (value: string) => void;
  setIngresosBrutos?: (value: string) => void;
  setPrecioToma?: (value: string) => void;
}

interface VehicleFieldsFormProps {
  data: VehicleFieldsData;
  handlers: VehicleFieldsHandlers;
  brands: VehicleBrand[];
  categories: VehicleCategory[];
  brandsLoading?: boolean;
  categoriesLoading?: boolean;
  fieldErrors?: Record<string, string>;
  onFieldChange?: (field: string) => void;
  disabled?: boolean;
  isDragging?: boolean;
  onDragStateChange?: (isDragging: boolean) => void;
  showOperationFields?: boolean;
  stockPhotoIds?: string[];
  stockVehicleId?: string;
  onDeleteExistingPhoto?: (photoId: string) => void;
  onSetExistingPhotoAsPrincipal?: (photoId: string) => void;
  inversionSlot?: React.ReactNode;
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

export function VehicleFieldsForm({
  data,
  handlers,
  brands,
  categories,
  brandsLoading = false,
  categoriesLoading = false,
  fieldErrors = {},
  onFieldChange,
  disabled = false,
  isDragging = false,
  onDragStateChange,
  showOperationFields = false,
  stockPhotoIds,
  stockVehicleId,
  onDeleteExistingPhoto,
  onSetExistingPhotoAsPrincipal,
  inversionSlot,
}: VehicleFieldsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoErrors, setPhotoErrors] = useState<string[]>([]);

  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [localBrands, setLocalBrands] = useState<VehicleBrand[]>([]);
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [localCategories, setLocalCategories] = useState<VehicleCategory[]>([]);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const allBrands = [...brands, ...localBrands];
  const allCategories = [...categories, ...localCategories];

  const handleAddBrandClick = async () => {
    if (!showAddBrand) {
      setShowAddBrand(true);
      return;
    }
    if (!newBrandName.trim()) return;
    setIsSavingBrand(true);
    try {
      const res = await fetch("/api/vehicle-brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newBrandName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setLocalBrands((prev) => [...prev, data.brand]);
        handlers.setMarcaId(data.brand.id);
        handleInputChange("marcaId");
        setNewBrandName("");
        setShowAddBrand(false);
      }
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleAddCategoryClick = async () => {
    if (!showAddCategory) {
      setShowAddCategory(true);
      return;
    }
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const res = await fetch("/api/vehicle-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setLocalCategories((prev) => [...prev, data.category]);
        handlers.setCategoriaId(data.category.id);
        handleInputChange("categoriaId");
        setNewCategoryName("");
        setShowAddCategory(false);
      }
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handlePhotoSelect = async (files: FileList | null) => {
    if (!files) return;
    const rejected: string[] = [];
    const validFiles: File[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) continue;
      try {
        const { width, height } = await getImageDimensions(file);
        if (Math.max(width, height) < 800) {
          rejected.push(file.name);
        } else {
          validFiles.push(file);
        }
      } catch {
        rejected.push(file.name);
      }
    }

    setPhotoErrors(
      rejected.map((name) => `"${name}" no cumple el mínimo de 800px en su lado más largo.`)
    );

    handlers.setPhotos((prev) => {
      const existingCount = (stockPhotoIds?.length ?? 0) + prev.length;
      const slots = Math.max(0, 10 - existingCount);
      const toAdd = validFiles.slice(0, slots).map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...toAdd];
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange?.(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange?.(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange?.(false);
    handlePhotoSelect(e.dataTransfer.files);
  };

  const handleRemovePhoto = (id: string) => {
    handlers.setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleInputChange = (field: string) => {
    onFieldChange?.(field);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Información del Vehículo */}
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              directions_car
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">
              Información del Vehículo
            </h2>
          </div>

          {/* Marca */}
          <div className="flex flex-col gap-2">
            <label htmlFor="marca" className="text-sm font-medium text-zinc-700">
              Marca <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                branding_watermark
              </span>
              <select
                id="marca"
                value={data.marcaId}
                onChange={(e) => {
                  handlers.setMarcaId(e.target.value);
                  handleInputChange("marcaId");
                }}
                className={`h-12 w-full appearance-none rounded-lg border ${
                  fieldErrors.marcaId
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={disabled || brandsLoading}
              >
                <option value="">Seleccionar marca...</option>
                {allBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                expand_more
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddBrandClick}
              disabled={disabled || isSavingBrand || (showAddBrand && !newBrandName.trim())}
              className={`flex h-12 items-center gap-1 rounded-lg px-3 text-xs font-medium text-white transition-colors disabled:opacity-40 focus:outline-none ${showAddBrand ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
              aria-label={showAddBrand ? "Confirmar nueva marca" : "Agregar nueva marca"}
            >
              <span className="material-symbols-outlined text-base">add</span>
              {showAddBrand ? "Confirmar" : "Agregar"}
            </button>
            </div>
            {showAddBrand && (
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAddBrandClick()}
                placeholder="Nombre de la nueva marca..."
                autoFocus
                className="h-10 w-full rounded-lg border border-blue-300 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={isSavingBrand}
                aria-label="Nombre de la nueva marca"
              />
            )}
            {fieldErrors.marcaId && (
              <span className="text-xs text-red-600">
                {fieldErrors.marcaId}
              </span>
            )}
          </div>

          {/* Modelo y Año */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="modelo"
                className="text-sm font-medium text-zinc-700"
              >
                Modelo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                  directions_car
                </span>
                <input
                  id="modelo"
                  type="text"
                  value={data.modelo}
                  onChange={(e) => {
                    handlers.setModelo(e.target.value.toUpperCase());
                    handleInputChange("modelo");
                  }}
                  placeholder="Ej: Corolla"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.modelo
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={disabled}
                />
              </div>
              {fieldErrors.modelo && (
                <span className="text-xs text-red-600">{fieldErrors.modelo}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="anio" className="text-sm font-medium text-zinc-700">
                Año <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                  event
                </span>
                <input
                  id="anio"
                  type="number"
                  value={data.anio}
                  onChange={(e) => {
                    handlers.setAnio(e.target.value);
                    handleInputChange("anio");
                  }}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.anio
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={disabled}
                />
              </div>
              {fieldErrors.anio && (
                <span className="text-xs text-red-600">{fieldErrors.anio}</span>
              )}
            </div>
          </div>

          {/* Patente */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="patente"
              className="text-sm font-medium text-zinc-700"
            >
              Patente
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                badge
              </span>
              <input
                id="patente"
                type="text"
                value={data.patente}
                onChange={(e) => {
                  handlers.setPatente(e.target.value.toUpperCase());
                  handleInputChange("patente");
                }}
                placeholder="ABC123"
                className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="categoria"
              className="text-sm font-medium text-zinc-700"
            >
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                label
              </span>
              <select
                id="categoria"
                value={data.categoriaId}
                onChange={(e) => {
                  handlers.setCategoriaId(e.target.value);
                  handleInputChange("categoriaId");
                }}
                className={`h-12 w-full appearance-none rounded-lg border ${
                  fieldErrors.categoriaId
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={disabled || categoriesLoading}
              >
                <option value="">Seleccionar categoría...</option>
                {allCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                expand_more
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddCategoryClick}
              disabled={disabled || isSavingCategory || (showAddCategory && !newCategoryName.trim())}
              className={`flex h-12 items-center gap-1 rounded-lg px-3 text-xs font-medium text-white transition-colors disabled:opacity-40 focus:outline-none ${showAddCategory ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
              aria-label={showAddCategory ? "Confirmar nueva categoría" : "Agregar nueva categoría"}
            >
              <span className="material-symbols-outlined text-base">add</span>
              {showAddCategory ? "Confirmar" : "Agregar"}
            </button>
            </div>
            {showAddCategory && (
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategoryClick()}
                placeholder="Nombre de la nueva categoría..."
                autoFocus
                className="h-10 w-full rounded-lg border border-blue-300 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={isSavingCategory}
                aria-label="Nombre de la nueva categoría"
              />
            )}
            {fieldErrors.categoriaId && (
              <span className="text-xs text-red-600">
                {fieldErrors.categoriaId}
              </span>
            )}
          </div>

          {/* Versión y Color */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="version"
                className="text-sm font-medium text-zinc-700"
              >
                Versión <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                  info
                </span>
                <input
                  id="version"
                  type="text"
                  value={data.version}
                  onChange={(e) => {
                    handlers.setVersion(e.target.value.toUpperCase());
                    handleInputChange("version");
                  }}
                  placeholder="Ej: 1.8 XEi"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.version
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={disabled}
                />
              </div>
              {fieldErrors.version && (
                <span className="text-xs text-red-600">{fieldErrors.version}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="color"
                className="text-sm font-medium text-zinc-700"
              >
                Color <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                  palette
                </span>
                <input
                  id="color"
                  type="text"
                  value={data.color}
                  onChange={(e) => {
                    handlers.setColor(e.target.value.toUpperCase());
                    handleInputChange("color");
                  }}
                  placeholder="Ej: Rojo"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.color
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={disabled}
                />
              </div>
              {fieldErrors.color && (
                <span className="text-xs text-red-600">{fieldErrors.color}</span>
              )}
            </div>
          </div>

          {/* Kilómetros */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="kilometros"
              className="text-sm font-medium text-zinc-700"
            >
              Kilómetros <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                speed
              </span>
              <NumericInput
                id="kilometros"
                value={data.kilometros}
                onChange={(v) => {
                  handlers.setKilometros(v);
                  handleInputChange("kilometros");
                }}
                placeholder="50000"
                className={`h-12 w-full rounded-lg border ${
                  fieldErrors.kilometros
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={disabled}
              />
            </div>
            {fieldErrors.kilometros && (
              <span className="text-xs text-red-600">
                {fieldErrors.kilometros}
              </span>
            )}
          </div>

          {/* Notas Mecánicas */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="notasMecanicas"
              className="text-sm font-medium text-zinc-700"
            >
              Notas Mecánicas
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-xl text-zinc-400">
                build
              </span>
              <textarea
                id="notasMecanicas"
                value={data.notasMecanicas}
                onChange={(e) => handlers.setNotasMecanicas(e.target.value)}
                placeholder="Estado mecánico, reparaciones necesarias, etc."
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Notas Generales */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="notasGenerales"
              className="text-sm font-medium text-zinc-700"
            >
              Notas Generales
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-xl text-zinc-400">
                notes
              </span>
              <textarea
                id="notasGenerales"
                value={data.notasGenerales}
                onChange={(e) => handlers.setNotasGenerales(e.target.value)}
                placeholder="Estado general, observaciones adicionales, etc."
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              payments
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">
              {showOperationFields ? "Precios y Condiciones Comerciales" : "Precios"}
            </h2>
          </div>

          {showOperationFields ? (
            <>
              {/* 1. Precio de Toma */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="precioToma"
                  className="text-sm font-medium text-zinc-700"
                >
                  Precio de Toma <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    handshake
                  </span>
                  <NumericInput
                    id="precioToma"
                    value={data.precioToma || ""}
                    onChange={(v) => {
                      handlers.setPrecioToma?.(v);
                      handleInputChange("precioToma");
                    }}
                    placeholder="0"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.precioToma
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={disabled}
                  />
                </div>
                {fieldErrors.precioToma && (
                  <span className="text-xs text-red-600">
                    {fieldErrors.precioToma}
                  </span>
                )}
              </div>

              {/* 2. Precio de Venta Total (estimado) */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="precioVentaTotal"
                  className="text-sm font-medium text-zinc-700"
                >
                  Precio de Venta Estimado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    local_offer
                  </span>
                  <NumericInput
                    id="precioVentaTotal"
                    value={data.precioVentaTotal || ""}
                    onChange={(v) => {
                      handlers.setPrecioVentaTotal?.(v);
                      handleInputChange("precioVentaTotal");
                    }}
                    placeholder="0"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.precioVentaTotal
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={disabled}
                  />
                </div>
                {fieldErrors.precioVentaTotal && (
                  <span className="text-xs text-red-600">
                    {fieldErrors.precioVentaTotal}
                  </span>
                )}
                <p className="text-xs text-zinc-500">
                  Precio pactado de la operación
                </p>
              </div>

              {/* 3. Precio Revista */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="precioRevista"
                  className="text-sm font-medium text-zinc-700"
                >
                  Precio Revista <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    attach_money
                  </span>
                  <NumericInput
                    id="precioRevista"
                    value={data.precioRevista}
                    onChange={(v) => {
                      handlers.setPrecioRevista(v);
                      handleInputChange("precioRevista");
                    }}
                    placeholder="0"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.precioRevista
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={disabled}
                  />
                </div>
                {fieldErrors.precioRevista && (
                  <span className="text-xs text-red-600">
                    {fieldErrors.precioRevista}
                  </span>
                )}
              </div>

              {/* 4. Ingreso Bruto (auto-calculado) */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="ingresosBrutos"
                  className="text-sm font-medium text-zinc-700"
                >
                  Ingreso Bruto
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    monetization_on
                  </span>
                  <input
                    id="ingresosBrutos"
                    type="text"
                    value={
                      data.precioVentaTotal
                        ? `$${new Intl.NumberFormat("es-AR").format(
                            parseFloat(data.precioVentaTotal) - parseFloat(data.precioToma || "0")
                          )}`
                        : "$0"
                    }
                    readOnly
                    className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 pl-11 pr-4 text-sm text-zinc-700 transition-colors focus:outline-none"
                    disabled
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Se calcula automáticamente: precio venta estimado − precio de toma
                </p>
              </div>

              {/* 5. Comisión Calculada */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="comisionCalculada"
                  className="text-sm font-medium text-zinc-700"
                >
                  Comisión Calculada
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    calculate
                  </span>
                  <input
                    id="comisionCalculada"
                    type="text"
                    value={(() => {
                      const venta = parseFloat(data.precioVentaTotal || "0");
                      const toma = parseFloat(data.precioToma || "0");
                      if (!venta) return "0.00%";
                      return `${(((venta - toma) / venta) * 100).toFixed(2)}%`;
                    })()}
                    readOnly
                    className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 pl-11 pr-4 text-sm text-zinc-700 transition-colors focus:outline-none"
                    disabled
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Se calcula automáticamente según ingreso bruto / precio venta
                </p>
              </div>

              {inversionSlot}
            </>
          ) : (
            <>
              {/* Precio de Toma */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="precioToma"
                  className="text-sm font-medium text-zinc-700"
                >
                  Precio de Toma
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    handshake
                  </span>
                  <NumericInput
                    id="precioToma"
                    value={data.precioToma || ""}
                    onChange={(v) => {
                      handlers.setPrecioToma?.(v);
                      handleInputChange("precioToma");
                    }}
                    placeholder="0"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.precioToma
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={disabled}
                  />
                </div>
                {fieldErrors.precioToma && (
                  <span className="text-xs text-red-600">
                    {fieldErrors.precioToma}
                  </span>
                )}
                <p className="text-xs text-zinc-500">
                  Precio al que la concesionaria compra el vehículo
                </p>
              </div>

              {/* Precio Oferta */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="precioOferta"
                  className="text-sm font-medium text-zinc-700"
                >
                  Precio Oferta
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    local_offer
                  </span>
                  <NumericInput
                    id="precioOferta"
                    value={data.precioOferta}
                    onChange={(v) => {
                      handlers.setPrecioOferta(v);
                      handleInputChange("precioOferta");
                    }}
                    placeholder="0"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.precioOferta
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={disabled}
                  />
                </div>
                {fieldErrors.precioOferta && (
                  <span className="text-xs text-red-600">
                    {fieldErrors.precioOferta}
                  </span>
                )}
                <p className="text-xs text-zinc-500">
                  Precio especial de venta (opcional)
                </p>
              </div>

              {/* Precio Revista */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="precioRevista"
                  className="text-sm font-medium text-zinc-700"
                >
                  Precio Revista <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    attach_money
                  </span>
                  <NumericInput
                    id="precioRevista"
                    value={data.precioRevista}
                    onChange={(v) => {
                      handlers.setPrecioRevista(v);
                      handleInputChange("precioRevista");
                    }}
                    placeholder="0"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.precioRevista
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={disabled}
                  />
                </div>
                {fieldErrors.precioRevista && (
                  <span className="text-xs text-red-600">
                    {fieldErrors.precioRevista}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sección de Fotos */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <span className="material-symbols-outlined text-2xl text-blue-600">
            photo_library
          </span>
          <h2 className="text-lg font-semibold text-zinc-900">
            Fotos del Vehículo{" "}
            <span className="text-base font-normal text-zinc-500">
              ({(stockPhotoIds?.length ?? 0) + data.photos.length}/10)
            </span>
          </h2>
        </div>

        {/* Zona de drag & drop */}
        {(() => {
          const totalFotos = (stockPhotoIds?.length ?? 0) + data.photos.length;
          const atLimit = totalFotos >= 10;
          return (
            <div
              onDragOver={!atLimit ? handleDragOver : undefined}
              onDragLeave={!atLimit ? handleDragLeave : undefined}
              onDrop={!atLimit ? handleDrop : undefined}
              onClick={() => !disabled && !atLimit && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all ${
                atLimit
                  ? "pointer-events-none cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-50"
                  : isDragging
                  ? "cursor-pointer border-blue-500 bg-blue-50"
                  : "cursor-pointer border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <span className="material-symbols-outlined text-4xl text-blue-600">
                  cloud_upload
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-900">
                  {atLimit
                    ? "Límite de fotos alcanzado"
                    : "Arrastrá las fotos aquí o hacé clic para seleccionar"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  JPG, PNG o WEBP hasta 10MB — máximo 10 fotos por vehículo
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => handlePhotoSelect(e.target.files)}
                className="hidden"
                disabled={disabled || atLimit}
              />
            </div>
          );
        })()}

        {/* Errores de validación de dimensiones */}
        {photoErrors.length > 0 && (
          <ul className="mt-1 space-y-1" role="alert">
            {photoErrors.map((msg, i) => (
              <li key={i} className="flex items-center gap-1 text-xs text-red-600">
                <span className="material-symbols-outlined text-sm">error</span>
                {msg}
              </li>
            ))}
          </ul>
        )}

        {/* Fotos existentes del vehículo de stock */}
        {stockPhotoIds && stockPhotoIds.length > 0 && stockVehicleId && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-green-600">check_circle</span>
              <p className="text-sm font-medium text-zinc-700">
                Fotos del vehículo ({stockPhotoIds.length})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {stockPhotoIds.map((photoId, index) => (
                <div
                  key={photoId}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                >
                  <img
                    src={`/api/stock/${stockVehicleId}/photos/${photoId}`}
                    alt="Foto del vehículo"
                    className="h-full w-full object-cover"
                  />
                  {onDeleteExistingPhoto && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExistingPhoto(photoId);
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 group-hover:opacity-100"
                      disabled={disabled}
                      aria-label="Eliminar foto"
                    >
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                    </button>
                  )}
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 flex items-center gap-1 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                      <span className="material-symbols-outlined text-sm">star</span>
                      Principal
                    </div>
                  )}
                  {index > 0 && onSetExistingPhotoAsPrincipal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetExistingPhotoAsPrincipal(photoId);
                      }}
                      className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 shadow-lg transition-opacity hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:opacity-100"
                      disabled={disabled}
                      aria-label="Establecer como foto principal"
                    >
                      <span className="material-symbols-outlined text-lg">star</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galería de fotos seleccionadas */}
        {data.photos.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700">
                Fotos seleccionadas ({data.photos.length})
              </p>
              <button
                type="button"
                onClick={() => {
                  data.photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
                  handlers.setPhotos([]);
                }}
                className="text-xs font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                disabled={disabled}
              >
                Eliminar todas
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                >
                  <img
                    src={photo.preview}
                    alt={photo.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(photo.id);
                    }}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 group-hover:opacity-100"
                    disabled={disabled}
                    aria-label={`Eliminar foto ${photo.file.name}`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 flex items-center gap-1 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                      <span className="material-symbols-outlined text-sm">star</span>
                      Principal
                    </div>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlers.setPhotos((prev) => {
                          const updated = [...prev];
                          const [selected] = updated.splice(index, 1);
                          return [selected, ...updated];
                        });
                      }}
                      className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 shadow-lg transition-opacity hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:opacity-100"
                      disabled={disabled}
                      aria-label="Establecer como foto principal"
                    >
                      <span className="material-symbols-outlined text-lg">star</span>
                    </button>
                  )}
                  {index > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="truncate text-xs text-white">
                        {photo.file.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
