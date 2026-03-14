"use client";

import React, { useState, useEffect } from "react";
import "material-symbols/outlined.css";
import {
  VehicleFieldsForm,
  VehicleFieldsData,
  VehicleFieldsHandlers,
  PhotoFile,
} from "../stock/VehicleFieldsForm";

interface VehicleBrand {
  id: string;
  nombre: string;
}

interface VehicleCategory {
  id: string;
  nombre: string;
}

interface OperationType {
  id: string;
  nombre: string;
}

interface TradeInVehicle {
  id: string;
  marcaId: string;
  modelo: string;
  anio: string;
  patente: string;
  version: string;
  color: string;
  kilometros: string;
  precioNegociado: string;
  notasMecanicas: string;
  notasGenerales: string;
}

interface CreateOperationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateOperationForm({
  onSuccess,
  onCancel,
}: CreateOperationFormProps) {
  // Operation-specific fields
  const [tipoOperacionId, setTipoOperacionId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [precioVentaTotal, setPrecioVentaTotal] = useState("");
  const [ingresosBrutos, setIngresosBrutos] = useState("");

  // Vehicle fields (using VehicleFieldsForm component)
  const [marcaId, setMarcaId] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [patente, setPatente] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [version, setVersion] = useState("");
  const [color, setColor] = useState("");
  const [kilometros, setKilometros] = useState("");
  const [notasMecanicas, setNotasMecanicas] = useState("");
  const [notasGenerales, setNotasGenerales] = useState("");
  const [precioRevista, setPrecioRevista] = useState("");
  const [precioOferta, setPrecioOferta] = useState("");
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Trade-in vehicles state
  const [tradeInVehicles, setTradeInVehicles] = useState<TradeInVehicle[]>([]);
  const [showTradeInForm, setShowTradeInForm] = useState(false);
  
  // Trade-in form fields
  const [tradeInMarcaId, setTradeInMarcaId] = useState("");
  const [tradeInModelo, setTradeInModelo] = useState("");
  const [tradeInAnio, setTradeInAnio] = useState("");
  const [tradeInPatente, setTradeInPatente] = useState("");
  const [tradeInVersion, setTradeInVersion] = useState("");
  const [tradeInColor, setTradeInColor] = useState("");
  const [tradeInKilometros, setTradeInKilometros] = useState("");
  const [tradeInPrecioNegociado, setTradeInPrecioNegociado] = useState("");
  const [tradeInNotasMecanicas, setTradeInNotasMecanicas] = useState("");
  const [tradeInNotasGenerales, setTradeInNotasGenerales] = useState("");
  const [tradeInFieldErrors, setTradeInFieldErrors] = useState<Record<string, string>>({});

  // Data for selectors
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);

  // Loading states
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch data on mount
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchOperationTypes();
  }, []);

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

  const fetchOperationTypes = async () => {
    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/operation-types`);
      if (res.ok) {
        const data = await res.json();
        setOperationTypes(data.types ?? []);
      } else {
        setOperationTypes([]);
      }
    } catch {
      setOperationTypes([]);
    } finally {
      setTypesLoading(false);
    }
  };

  const resetTradeInForm = () => {
    setTradeInMarcaId("");
    setTradeInModelo("");
    setTradeInAnio("");
    setTradeInPatente("");
    setTradeInVersion("");
    setTradeInColor("");
    setTradeInKilometros("");
    setTradeInPrecioNegociado("");
    setTradeInNotasMecanicas("");
    setTradeInNotasGenerales("");
    setTradeInFieldErrors({});
  };

  const validateTradeInForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!tradeInMarcaId) errors.tradeInMarcaId = "Seleccioná una marca";
    if (!tradeInModelo.trim()) errors.tradeInModelo = "El modelo es requerido";
    if (!tradeInAnio) {
      errors.tradeInAnio = "El año es requerido";
    } else {
      const anioNum = parseInt(tradeInAnio);
      if (isNaN(anioNum) || anioNum < 1900 || anioNum > 2100) {
        errors.tradeInAnio = "El año debe estar entre 1900 y 2100";
      }
    }
    if (!tradeInPatente.trim()) errors.tradeInPatente = "La patente es requerida";
    if (!tradeInPrecioNegociado) {
      errors.tradeInPrecioNegociado = "El precio negociado es requerido";
    } else if (parseFloat(tradeInPrecioNegociado) <= 0) {
      errors.tradeInPrecioNegociado = "El precio debe ser mayor a 0";
    }

    setTradeInFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTradeInVehicle = () => {
    if (!validateTradeInForm()) {
      return;
    }

    const newVehicle: TradeInVehicle = {
      id: crypto.randomUUID(),
      marcaId: tradeInMarcaId,
      modelo: tradeInModelo.trim(),
      anio: tradeInAnio,
      patente: tradeInPatente.trim(),
      version: tradeInVersion.trim(),
      color: tradeInColor.trim(),
      kilometros: tradeInKilometros,
      precioNegociado: tradeInPrecioNegociado,
      notasMecanicas: tradeInNotasMecanicas.trim(),
      notasGenerales: tradeInNotasGenerales.trim(),
    };

    setTradeInVehicles((prev) => [...prev, newVehicle]);
    resetTradeInForm();
    setShowTradeInForm(false);
  };

  const handleRemoveTradeInVehicle = (id: string) => {
    setTradeInVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleTradeInInputChange = (field: string) => {
    if (tradeInFieldErrors[field]) {
      setTradeInFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Operation fields validation
    if (!tipoOperacionId) errors.tipoOperacionId = "Seleccioná un tipo de operación";
    if (!fechaInicio) errors.fechaInicio = "La fecha de inicio es requerida";
    if (!precioVentaTotal) {
      errors.precioVentaTotal = "El precio de venta es requerido";
    } else if (parseFloat(precioVentaTotal) <= 0) {
      errors.precioVentaTotal = "El precio debe ser mayor a 0";
    }
    if (!ingresosBrutos) {
      errors.ingresosBrutos = "El ingreso bruto es requerido";
    } else if (parseFloat(ingresosBrutos) <= 0) {
      errors.ingresosBrutos = "El ingreso debe ser mayor a 0";
    }

    // Vehicle fields validation (from VehicleFieldsForm)
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
    } else if (parseInt(kilometros) < 0) {
      errors.kilometros = "Los kilómetros deben ser mayores o iguales a 0";
    }
    if (!precioRevista) {
      errors.precioRevista = "El precio revista es requerido";
    } else if (parseFloat(precioRevista) <= 0) {
      errors.precioRevista = "El precio debe ser mayor a 0";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      formData.append("precioRevista", precioRevista);
      
      if (patente.trim()) {
        formData.append("patente", patente.trim());
      }
      if (precioOferta) {
        formData.append("precioOferta", precioOferta);
      }
      if (notasMecanicas.trim()) {
        formData.append("notasMecanicas", notasMecanicas.trim());
      }
      if (notasGenerales.trim()) {
        formData.append("notasGenerales", notasGenerales.trim());
      }

      formData.append("tipoOperacionId", tipoOperacionId);
      formData.append("fechaInicio", fechaInicio);
      formData.append("precioVentaTotal", precioVentaTotal);
      formData.append("ingresosBrutos", ingresosBrutos);

      photos.forEach((photo) => {
        formData.append("fotos", photo.file);
      });

      const res = await fetch(`${baseUrl}/api/operations`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setSuccessMessage("Operación creada exitosamente");
        // Reset operation fields
        setTipoOperacionId("");
        setFechaInicio("");
        setPrecioVentaTotal("");
        setIngresosBrutos("");
        // Reset vehicle fields
        setMarcaId("");
        setModelo("");
        setAnio("");
        setPatente("");
        setCategoriaId("");
        setVersion("");
        setColor("");
        setKilometros("");
        setNotasMecanicas("");
        setNotasGenerales("");
        setPrecioRevista("");
        setPrecioOferta("");
        setPhotos([]);
        setFieldErrors({});
        setTradeInVehicles([]);
        resetTradeInForm();
        onSuccess?.();
      } else if (res.status === 400) {
        setError(data.message ?? "Datos inválidos. Verificá los campos.");
      } else {
        setError(
          data.message ?? "Ocurrió un error al crear la operación. Intentá nuevamente."
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

  const handleAutofill = () => {
    if (operationTypes.length > 0) setTipoOperacionId(operationTypes[0].id);
    const today = new Date().toISOString().split('T')[0];
    setFechaInicio(today);
    setPrecioVentaTotal("24000");
    setIngresosBrutos("22000");
    
    if (brands.length > 0) setMarcaId(brands[0].id);
    setModelo("Corolla");
    setAnio("2023");
    setPatente("ABC123");
    if (categories.length > 0) setCategoriaId(categories[0].id);
    setVersion("XEi");
    setColor("Blanco");
    setKilometros("15000");
    setNotasMecanicas("Motor en excelente estado, service al día");
    setNotasGenerales("Único dueño, garage");
    setPrecioRevista("25000");
    setPrecioOferta("23000");
    setFieldErrors({});
  };

  const isFormValid =
    tipoOperacionId &&
    fechaInicio &&
    marcaId &&
    modelo.trim() &&
    anio &&
    categoriaId &&
    version.trim() &&
    color.trim() &&
    kilometros &&
    precioRevista &&
    precioVentaTotal &&
    ingresosBrutos &&
    Object.keys(fieldErrors).length === 0;

  const vehicleFieldsData: VehicleFieldsData = {
    marcaId,
    modelo,
    anio,
    patente,
    categoriaId,
    version,
    color,
    kilometros,
    notasMecanicas,
    notasGenerales,
    precioRevista,
    precioOferta,
    photos,
    precioVentaTotal,
    ingresosBrutos,
  };

  const vehicleFieldsHandlers: VehicleFieldsHandlers = {
    setMarcaId,
    setModelo,
    setAnio,
    setPatente,
    setCategoriaId,
    setVersion,
    setColor,
    setKilometros,
    setNotasMecanicas,
    setNotasGenerales,
    setPrecioRevista,
    setPrecioOferta,
    setPhotos,
    setPrecioVentaTotal,
    setIngresosBrutos,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Botón de autocompletado - TEMPORAL PARA TESTING */}
      <button
        type="button"
        onClick={handleAutofill}
        className="flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 text-xs font-semibold text-purple-700 transition-all hover:border-purple-400 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        disabled={isSubmitting}
      >
        <span className="material-symbols-outlined text-lg">auto_fix_high</span>
        <span>AUTOCOMPLETAR (temporal para testing)</span>
      </button>

      {/* Mensajes globales */}
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

      {/* Tipo de Operación y Fecha */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <span className="material-symbols-outlined text-2xl text-blue-600">
            category
          </span>
          <h2 className="text-lg font-semibold text-zinc-900">
            Datos de la Operación
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Tipo de Operación */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="tipoOperacion"
              className="text-sm font-medium text-zinc-700"
            >
              Tipo de Operación <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                category
              </span>
              <select
                id="tipoOperacion"
                value={tipoOperacionId}
                onChange={(e) => {
                  setTipoOperacionId(e.target.value);
                  handleInputChange("tipoOperacionId");
                }}
                className={`h-12 w-full appearance-none rounded-lg border ${
                  fieldErrors.tipoOperacionId
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting || typesLoading}
              >
                <option value="">Seleccionar tipo de operación...</option>
                {operationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                expand_more
              </span>
            </div>
            {fieldErrors.tipoOperacionId && (
              <span className="text-xs text-red-600">
                {fieldErrors.tipoOperacionId}
              </span>
            )}
          </div>

          {/* Fecha de Inicio */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="fechaInicio"
              className="text-sm font-medium text-zinc-700"
            >
              Fecha de Inicio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                calendar_today
              </span>
              <input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  handleInputChange("fechaInicio");
                }}
                className={`h-12 w-full rounded-lg border ${
                  fieldErrors.fechaInicio
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting}
              />
            </div>
            {fieldErrors.fechaInicio && (
              <span className="text-xs text-red-600">
                {fieldErrors.fechaInicio}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Información del Vehículo - usando VehicleFieldsForm */}
      <VehicleFieldsForm
        data={vehicleFieldsData}
        handlers={vehicleFieldsHandlers}
        brands={brands}
        categories={categories}
        brandsLoading={brandsLoading}
        categoriesLoading={categoriesLoading}
        fieldErrors={fieldErrors}
        onFieldChange={handleInputChange}
        disabled={isSubmitting}
        isDragging={isDragging}
        onDragStateChange={setIsDragging}
        showOperationFields={true}
      />

      {/* Botón para añadir auto en parte de pago - Siempre visible */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setShowTradeInForm(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 text-sm font-semibold text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>Añadir auto en parte de pago</span>
        </button>
      </div>

      {/* Formulario de Vehículos en Parte de Pago */}
      {showTradeInForm && (
        <div className="flex flex-col gap-6">
          {/* Formulario para agregar vehículo de intercambio */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-emerald-600">
                    swap_horiz
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    Agregar vehículo en parte de pago
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowTradeInForm(false);
                    resetTradeInForm();
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Marca */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInMarca"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      branding_watermark
                    </span>
                    <select
                      id="tradeInMarca"
                      value={tradeInMarcaId}
                      onChange={(e) => {
                        setTradeInMarcaId(e.target.value);
                        handleTradeInInputChange("tradeInMarcaId");
                      }}
                      className={`h-12 w-full appearance-none rounded-lg border ${
                        tradeInFieldErrors.tradeInMarcaId
                          ? "border-red-300 bg-red-50"
                          : "border-zinc-300 bg-zinc-50"
                      } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50`}
                      disabled={isSubmitting || brandsLoading}
                    >
                      <option value="">Selecciona una marca</option>
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
                  {tradeInFieldErrors.tradeInMarcaId && (
                    <span className="text-xs text-red-600">
                      {tradeInFieldErrors.tradeInMarcaId}
                    </span>
                  )}
                </div>

                {/* Modelo */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInModelo"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      directions_car
                    </span>
                    <input
                      id="tradeInModelo"
                      type="text"
                      value={tradeInModelo}
                      onChange={(e) => {
                        setTradeInModelo(e.target.value);
                        handleTradeInInputChange("tradeInModelo");
                      }}
                      placeholder="Ej: Corolla"
                      className={`h-12 w-full rounded-lg border ${
                        tradeInFieldErrors.tradeInModelo
                          ? "border-red-300 bg-red-50"
                          : "border-zinc-300 bg-zinc-50"
                      } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {tradeInFieldErrors.tradeInModelo && (
                    <span className="text-xs text-red-600">
                      {tradeInFieldErrors.tradeInModelo}
                    </span>
                  )}
                </div>

                {/* Año */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInAnio"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Año <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      event
                    </span>
                    <input
                      id="tradeInAnio"
                      type="number"
                      value={tradeInAnio}
                      onChange={(e) => {
                        setTradeInAnio(e.target.value);
                        handleTradeInInputChange("tradeInAnio");
                      }}
                      placeholder="2020"
                      min="1900"
                      max="2100"
                      className={`h-12 w-full rounded-lg border ${
                        tradeInFieldErrors.tradeInAnio
                          ? "border-red-300 bg-red-50"
                          : "border-zinc-300 bg-zinc-50"
                      } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {tradeInFieldErrors.tradeInAnio && (
                    <span className="text-xs text-red-600">
                      {tradeInFieldErrors.tradeInAnio}
                    </span>
                  )}
                </div>

                {/* Patente */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInPatente"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Patente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      badge
                    </span>
                    <input
                      id="tradeInPatente"
                      type="text"
                      value={tradeInPatente}
                      onChange={(e) => {
                        setTradeInPatente(e.target.value);
                        handleTradeInInputChange("tradeInPatente");
                      }}
                      placeholder="XYZ-456"
                      className={`h-12 w-full rounded-lg border ${
                        tradeInFieldErrors.tradeInPatente
                          ? "border-red-300 bg-red-50"
                          : "border-zinc-300 bg-zinc-50"
                      } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {tradeInFieldErrors.tradeInPatente && (
                    <span className="text-xs text-red-600">
                      {tradeInFieldErrors.tradeInPatente}
                    </span>
                  )}
                </div>

                {/* Versión */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInVersion"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Versión
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      info
                    </span>
                    <input
                      id="tradeInVersion"
                      type="text"
                      value={tradeInVersion}
                      onChange={(e) => setTradeInVersion(e.target.value)}
                      placeholder="Ej: XLE Premium"
                      className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Color */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInColor"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Color
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      palette
                    </span>
                    <input
                      id="tradeInColor"
                      type="text"
                      value={tradeInColor}
                      onChange={(e) => setTradeInColor(e.target.value)}
                      placeholder="Ej: Blanco"
                      className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Kilómetros */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInKilometros"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Kilómetros
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      speed
                    </span>
                    <input
                      id="tradeInKilometros"
                      type="number"
                      value={tradeInKilometros}
                      onChange={(e) => setTradeInKilometros(e.target.value)}
                      placeholder="50000"
                      min="0"
                      className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Precio Negociado */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInPrecioNegociado"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Precio Venta Estimado <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      attach_money
                    </span>
                    <input
                      id="tradeInPrecioNegociado"
                      type="number"
                      step="0.01"
                      value={tradeInPrecioNegociado}
                      onChange={(e) => {
                        setTradeInPrecioNegociado(e.target.value);
                        handleTradeInInputChange("tradeInPrecioNegociado");
                      }}
                      placeholder="0.00"
                      className={`h-12 w-full rounded-lg border ${
                        tradeInFieldErrors.tradeInPrecioNegociado
                          ? "border-red-300 bg-red-50"
                          : "border-zinc-300 bg-zinc-50"
                      } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {tradeInFieldErrors.tradeInPrecioNegociado && (
                    <span className="text-xs text-red-600">
                      {tradeInFieldErrors.tradeInPrecioNegociado}
                    </span>
                  )}
                </div>

                {/* Notas Mecánicas */}
                <div className="flex flex-col gap-2 lg:col-span-2">
                  <label
                    htmlFor="tradeInNotasMecanicas"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Notas Mecánicas
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-xl text-zinc-400">
                      build
                    </span>
                    <textarea
                      id="tradeInNotasMecanicas"
                      value={tradeInNotasMecanicas}
                      onChange={(e) => setTradeInNotasMecanicas(e.target.value)}
                      placeholder="Estado mecánico, reparaciones necesarias, etc."
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Notas Generales */}
                <div className="flex flex-col gap-2 lg:col-span-2">
                  <label
                    htmlFor="tradeInNotasGenerales"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Notas Generales
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-xl text-zinc-400">
                      notes
                    </span>
                    <textarea
                      id="tradeInNotasGenerales"
                      value={tradeInNotasGenerales}
                      onChange={(e) => setTradeInNotasGenerales(e.target.value)}
                      placeholder="Estado general, observaciones adicionales, etc."
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Botón agregar vehículo */}
              <button
                type="button"
                onClick={handleAddTradeInVehicle}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined text-xl">add_circle</span>
                <span>Agregar vehículo de intercambio</span>
              </button>
            </div>
          </div>

          {/* Lista de vehículos agregados */}
          {tradeInVehicles.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-700">
                Vehículos agregados ({tradeInVehicles.length})
              </h3>
              <div className="flex flex-col gap-3">
                {tradeInVehicles.map((vehicle) => {
                  const brandName = brands.find((b) => b.id === vehicle.marcaId)?.nombre || "Sin marca";
                  
                  return (
                    <div
                      key={vehicle.id}
                      className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <span className="material-symbols-outlined text-xl text-emerald-600">
                          directions_car
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-zinc-900">
                              {brandName} {vehicle.modelo} ({vehicle.anio})
                            </h4>
                            <p className="text-sm text-zinc-600">
                              Patente: {vehicle.patente}
                              {vehicle.version && ` • ${vehicle.version}`}
                              {vehicle.color && ` • ${vehicle.color}`}
                            </p>
                            {vehicle.kilometros && (
                              <p className="text-sm text-zinc-600">
                                Kilómetros: {parseInt(vehicle.kilometros).toLocaleString()} km
                              </p>
                            )}
                            <p className="mt-1 text-sm font-medium text-emerald-700">
                              Precio estimado: ${parseFloat(vehicle.precioNegociado).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTradeInVehicle(vehicle.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            disabled={isSubmitting}
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                        {(vehicle.notasMecanicas || vehicle.notasGenerales) && (
                          <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-600">
                            {vehicle.notasMecanicas && (
                              <p>
                                <strong>Mecánica:</strong> {vehicle.notasMecanicas}
                              </p>
                            )}
                            {vehicle.notasGenerales && (
                              <p>
                                <strong>General:</strong> {vehicle.notasGenerales}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de vehículos agregados - Siempre visible si hay vehículos */}
      {!showTradeInForm && tradeInVehicles.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-emerald-600">
              swap_horiz
            </span>
            <h3 className="text-sm font-semibold text-zinc-700">
              Vehículos en parte de pago ({tradeInVehicles.length})
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {tradeInVehicles.map((vehicle) => {
              const brandName = brands.find((b) => b.id === vehicle.marcaId)?.nombre || "Sin marca";
              
              return (
                <div
                  key={vehicle.id}
                  className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <span className="material-symbols-outlined text-xl text-emerald-600">
                      directions_car
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-zinc-900">
                          {brandName} {vehicle.modelo} ({vehicle.anio})
                        </h4>
                        <p className="text-sm text-zinc-600">
                          Patente: {vehicle.patente}
                          {vehicle.version && ` • ${vehicle.version}`}
                          {vehicle.color && ` • ${vehicle.color}`}
                        </p>
                        {vehicle.kilometros && (
                          <p className="text-sm text-zinc-600">
                            Kilómetros: {parseInt(vehicle.kilometros).toLocaleString()} km
                          </p>
                        )}
                        <p className="mt-1 text-sm font-medium text-emerald-700">
                          Precio estimado: ${parseFloat(vehicle.precioNegociado).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTradeInVehicle(vehicle.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        disabled={isSubmitting}
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                    {(vehicle.notasMecanicas || vehicle.notasGenerales) && (
                      <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-600">
                        {vehicle.notasMecanicas && (
                          <p>
                            <strong>Mecánica:</strong> {vehicle.notasMecanicas}
                          </p>
                        )}
                        {vehicle.notasGenerales && (
                          <p>
                            <strong>General:</strong> {vehicle.notasGenerales}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              <span>Guardar Operación</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
