"use client";

import React, { useState, useEffect, useRef } from "react";
import "material-symbols/outlined.css";

interface VehicleBrand {
  id: string;
  nombre: string;
}

interface VehicleCategory {
  id: string;
  nombre: string;
}

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

interface CreateVehicleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateVehicleForm({
  onSuccess,
  onCancel,
}: CreateVehicleFormProps) {
  const [marcaId, setMarcaId] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [version, setVersion] = useState("");
  const [color, setColor] = useState("");
  const [kilometros, setKilometros] = useState("");
  const [tipoIngreso, setTipoIngreso] = useState("");
  const [notasMecanicas, setNotasMecanicas] = useState("");
  const [notasGenerales, setNotasGenerales] = useState("");
  const [precioRevista, setPrecioRevista] = useState("");
  const [precioOferta, setPrecioOferta] = useState("");
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

  const fetchBrands = async () => {
    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/vehicle-brands`);
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands ?? []);
      } else {
        setBrands([]);
      }
    } catch {
      setBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/vehicle-categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories ?? []);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!marcaId) errors.marcaId = "Seleccioná una marca";
    if (!modelo.trim()) errors.modelo = "El modelo es requerido";
    if (!anio) {
      errors.anio = "El año es requerido";
    } else {
      const anioNum = parseInt(anio);
      if (isNaN(anioNum) || anioNum < 1900 || anioNum > 2100) {
        errors.anio = "El año debe estar entre 1900 y 2100";
      }
    }
    if (!categoriaId) errors.categoriaId = "Seleccioná una categoría";
    if (!version.trim()) errors.version = "La versión es requerida";
    if (!color.trim()) errors.color = "El color es requerido";
    if (!kilometros) {
      errors.kilometros = "Los kilómetros son requeridos";
    } else if (parseFloat(kilometros) < 0) {
      errors.kilometros = "Los kilómetros no pueden ser negativos";
    }
    if (!tipoIngreso) errors.tipoIngreso = "Seleccioná un tipo de ingreso";
    if (!precioRevista) {
      errors.precioRevista = "El precio revista es requerido";
    } else if (parseFloat(precioRevista) <= 0) {
      errors.precioRevista = "El precio debe ser mayor a 0";
    }
    if (precioOferta && parseFloat(precioOferta) <= 0) {
      errors.precioOferta = "El precio debe ser mayor a 0";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    const newPhotos = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoSelect(e.dataTransfer.files);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";

      const formData = new FormData();
      formData.append("marcaId", marcaId);
      formData.append("modelo", modelo.trim());
      formData.append("anio", anio);
      formData.append("categoriaId", categoriaId);
      formData.append("version", version.trim());
      formData.append("color", color.trim());
      formData.append("kilometros", kilometros);
      formData.append("tipoIngreso", tipoIngreso);
      formData.append("precioRevista", precioRevista);
      
      if (precioOferta) {
        formData.append("precioOferta", precioOferta);
      }
      if (notasMecanicas.trim()) {
        formData.append("notasMecanicas", notasMecanicas.trim());
      }
      if (notasGenerales.trim()) {
        formData.append("notasGenerales", notasGenerales.trim());
      }

      photos.forEach((photo, index) => {
        formData.append("fotos", photo.file);
        formData.append(`foto_orden_${index}`, index.toString());
      });

      const res = await fetch(`${baseUrl}/api/stock`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setSuccessMessage("Vehículo creado exitosamente");
        setMarcaId("");
        setModelo("");
        setAnio("");
        setCategoriaId("");
        setVersion("");
        setColor("");
        setKilometros("");
        setTipoIngreso("");
        setNotasMecanicas("");
        setNotasGenerales("");
        setPrecioRevista("");
        setPrecioOferta("");
        setPhotos([]);
        setFieldErrors({});
        onSuccess?.();
      } else if (res.status === 400) {
        setError(data.message ?? "Datos inválidos. Verificá los campos.");
      } else {
        setError(
          data.message ?? "Ocurrió un error al crear el vehículo. Intentá nuevamente."
        );
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) setError(null);
  };

  const isFormValid =
    marcaId &&
    modelo.trim() &&
    anio &&
    categoriaId &&
    version.trim() &&
    color.trim() &&
    kilometros &&
    tipoIngreso &&
    precioRevista &&
    Object.keys(fieldErrors).length === 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {successMessage && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                branding_watermark
              </span>
              <select
                id="marca"
                value={marcaId}
                onChange={(e) => {
                  setMarcaId(e.target.value);
                  handleInputChange("marcaId");
                }}
                className={`h-12 w-full appearance-none rounded-lg border ${
                  fieldErrors.marcaId
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting || brandsLoading}
              >
                <option value="">Seleccionar marca...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                expand_more
              </span>
            </div>
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
                  value={modelo}
                  onChange={(e) => {
                    setModelo(e.target.value);
                    handleInputChange("modelo");
                  }}
                  placeholder="Ej: Corolla"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.modelo
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={isSubmitting}
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
                  value={anio}
                  onChange={(e) => {
                    setAnio(e.target.value);
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
                  disabled={isSubmitting}
                />
              </div>
              {fieldErrors.anio && (
                <span className="text-xs text-red-600">{fieldErrors.anio}</span>
              )}
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
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                label
              </span>
              <select
                id="categoria"
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value);
                  handleInputChange("categoriaId");
                }}
                className={`h-12 w-full appearance-none rounded-lg border ${
                  fieldErrors.categoriaId
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting || categoriesLoading}
              >
                <option value="">Seleccionar categoría...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                expand_more
              </span>
            </div>
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
                  value={version}
                  onChange={(e) => {
                    setVersion(e.target.value);
                    handleInputChange("version");
                  }}
                  placeholder="Ej: 1.8 XEi"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.version
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={isSubmitting}
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
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    handleInputChange("color");
                  }}
                  placeholder="Ej: Rojo"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.color
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={isSubmitting}
                />
              </div>
              {fieldErrors.color && (
                <span className="text-xs text-red-600">{fieldErrors.color}</span>
              )}
            </div>
          </div>

          {/* Kilómetros y Tipo de Ingreso */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <input
                  id="kilometros"
                  type="number"
                  value={kilometros}
                  onChange={(e) => {
                    setKilometros(e.target.value);
                    handleInputChange("kilometros");
                  }}
                  placeholder="50000"
                  min="0"
                  className={`h-12 w-full rounded-lg border ${
                    fieldErrors.kilometros
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={isSubmitting}
                />
              </div>
              {fieldErrors.kilometros && (
                <span className="text-xs text-red-600">
                  {fieldErrors.kilometros}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="tipoIngreso"
                className="text-sm font-medium text-zinc-700"
              >
                Tipo de Ingreso <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                  input
                </span>
                <select
                  id="tipoIngreso"
                  value={tipoIngreso}
                  onChange={(e) => {
                    setTipoIngreso(e.target.value);
                    handleInputChange("tipoIngreso");
                  }}
                  className={`h-12 w-full appearance-none rounded-lg border ${
                    fieldErrors.tipoIngreso
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-300 bg-zinc-50"
                  } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="compra">Compra</option>
                  <option value="parte_de_pago">Parte de pago</option>
                  <option value="consignacion">Consignación</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                  expand_more
                </span>
              </div>
              {fieldErrors.tipoIngreso && (
                <span className="text-xs text-red-600">
                  {fieldErrors.tipoIngreso}
                </span>
              )}
            </div>
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
                value={notasMecanicas}
                onChange={(e) => setNotasMecanicas(e.target.value)}
                placeholder="Estado mecánico, reparaciones necesarias, etc."
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                disabled={isSubmitting}
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
                value={notasGenerales}
                onChange={(e) => setNotasGenerales(e.target.value)}
                placeholder="Estado general, observaciones adicionales, etc."
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                disabled={isSubmitting}
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
              Precios
            </h2>
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
              <input
                id="precioRevista"
                type="number"
                step="0.01"
                value={precioRevista}
                onChange={(e) => {
                  setPrecioRevista(e.target.value);
                  handleInputChange("precioRevista");
                }}
                placeholder="0.00"
                className={`h-12 w-full rounded-lg border ${
                  fieldErrors.precioRevista
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting}
              />
            </div>
            {fieldErrors.precioRevista && (
              <span className="text-xs text-red-600">
                {fieldErrors.precioRevista}
              </span>
            )}
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
              <input
                id="precioOferta"
                type="number"
                step="0.01"
                value={precioOferta}
                onChange={(e) => {
                  setPrecioOferta(e.target.value);
                  handleInputChange("precioOferta");
                }}
                placeholder="0.00"
                className={`h-12 w-full rounded-lg border ${
                  fieldErrors.precioOferta
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting}
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
        </div>
      </div>

      {/* Sección de Fotos */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <span className="material-symbols-outlined text-2xl text-blue-600">
            photo_library
          </span>
          <h2 className="text-lg font-semibold text-zinc-900">
            Fotos del Vehículo
          </h2>
        </div>

        {/* Zona de drag & drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50"
          } ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="material-symbols-outlined text-4xl text-blue-600">
              cloud_upload
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-900">
              Arrastrá las fotos aquí o hacé clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              JPG, PNG o WEBP hasta 10MB por archivo
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => handlePhotoSelect(e.target.files)}
            className="hidden"
            disabled={isSubmitting}
          />
        </div>

        {/* Galería de fotos seleccionadas */}
        {photos.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700">
                Fotos seleccionadas ({photos.length})
              </p>
              <button
                type="button"
                onClick={() => {
                  photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
                  setPhotos([]);
                }}
                className="text-xs font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                disabled={isSubmitting}
              >
                Eliminar todas
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
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
                    disabled={isSubmitting}
                    aria-label={`Eliminar foto ${photo.file.name}`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-white">
                      {photo.file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="order-2 flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:order-1"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="order-1 flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:order-2 sm:flex-initial sm:px-6"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">
                progress_activity
              </span>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">save</span>
              <span>Guardar Vehículo</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
