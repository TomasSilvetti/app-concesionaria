"use client";

import React, { useState, useEffect, useRef } from "react";
import "material-symbols/outlined.css";
import {
  VehicleFieldsForm,
  VehicleFieldsData,
  VehicleFieldsHandlers,
  PhotoFile,
} from "../stock/VehicleFieldsForm";
import { OPERATION_TYPES } from "@/lib/operation-types";

interface VehicleBrand {
  id: string;
  nombre: string;
}

interface VehicleCategory {
  id: string;
  nombre: string;
}

interface StockVehicle {
  id: string;
  marca: string;
  modelo: string;
  anio: number | null;
  patente: string | null;
  categoriaId: string | null;
  version: string | null;
  color: string | null;
  km: number | null;
  notasMecanicas: string | null;
  notasGenerales: string | null;
  precioRevista: number | null;
  precioOferta: number | null;
  fotos: { id: string }[];
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
  precioRevista: string;
  precioNegociado: string;
  notasMecanicas: string;
  notasGenerales: string;
  photos: PhotoFile[];
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
  const [tipoOperacion, setTipoOperacion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [nombreComprador, setNombreComprador] = useState("");
  const [precioVentaTotal, setPrecioVentaTotal] = useState("");
  const [ingresosBrutos, setIngresosBrutos] = useState("");
  const [precioToma, setPrecioToma] = useState("");
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

  // Stock modal state
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockVehicles, setStockVehicles] = useState<StockVehicle[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedStockVehicleId, setSelectedStockVehicleId] = useState<string | null>(null);
  const [stockAutofillId, setStockAutofillId] = useState<string | null>(null);
  const [stockPhotoIds, setStockPhotoIds] = useState<string[]>([]);

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
  const [tradeInPrecioRevista, setTradeInPrecioRevista] = useState("");
  const [tradeInPrecioNegociado, setTradeInPrecioNegociado] = useState("");
  const [tradeInNotasMecanicas, setTradeInNotasMecanicas] = useState("");
  const [tradeInNotasGenerales, setTradeInNotasGenerales] = useState("");
  const [tradeInFieldErrors, setTradeInFieldErrors] = useState<Record<string, string>>({});
  const [tradeInPhotos, setTradeInPhotos] = useState<PhotoFile[]>([]);
  const [tradeInIsDragging, setTradeInIsDragging] = useState(false);
  const tradeInFileInputRef = useRef<HTMLInputElement>(null);

  // Data for selectors
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

  // Loading states
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch data on mount
  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  // Auto-calcular ingreso bruto como diferencia entre precio venta estimado y precio de toma
  useEffect(() => {
    const venta = parseFloat(precioVentaTotal);
    const toma = parseFloat(precioToma || "0");
    if (!isNaN(venta) && precioVentaTotal) {
      setIngresosBrutos((venta - toma).toFixed(2));
    } else {
      setIngresosBrutos("");
    }
  }, [precioVentaTotal, precioToma]);

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

  const resetTradeInForm = () => {
    setTradeInMarcaId("");
    setTradeInModelo("");
    setTradeInAnio("");
    setTradeInPatente("");
    setTradeInVersion("");
    setTradeInColor("");
    setTradeInKilometros("");
    setTradeInPrecioRevista("");
    setTradeInPrecioNegociado("");
    setTradeInNotasMecanicas("");
    setTradeInNotasGenerales("");
    setTradeInFieldErrors({});
    setTradeInPhotos([]);
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
    if (!tradeInPrecioRevista) {
      errors.tradeInPrecioRevista = "El precio revista es requerido";
    } else if (parseFloat(tradeInPrecioRevista) <= 0) {
      errors.tradeInPrecioRevista = "El precio debe ser mayor a 0";
    }
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
      precioRevista: tradeInPrecioRevista,
      precioNegociado: tradeInPrecioNegociado,
      notasMecanicas: tradeInNotasMecanicas.trim(),
      notasGenerales: tradeInNotasGenerales.trim(),
      photos: tradeInPhotos,
    };

    setTradeInVehicles((prev) => [...prev, newVehicle]);
    resetTradeInForm();
    setShowTradeInForm(false);
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.vehiculoUsado;
      return newErrors;
    });
  };

  const handleRemoveTradeInVehicle = (id: string) => {
    setTradeInVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleEditTradeInVehicle = (vehicle: TradeInVehicle) => {
    setTradeInVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    setTradeInMarcaId(vehicle.marcaId);
    setTradeInModelo(vehicle.modelo);
    setTradeInAnio(vehicle.anio);
    setTradeInPatente(vehicle.patente);
    setTradeInVersion(vehicle.version);
    setTradeInColor(vehicle.color);
    setTradeInKilometros(vehicle.kilometros);
    setTradeInPrecioRevista(vehicle.precioRevista);
    setTradeInPrecioNegociado(vehicle.precioNegociado);
    setTradeInNotasMecanicas(vehicle.notasMecanicas);
    setTradeInNotasGenerales(vehicle.notasGenerales);
    setTradeInPhotos(vehicle.photos);
    setTradeInFieldErrors({});
    setShowTradeInForm(true);
  };

  const fetchStockDisponibles = async () => {
    setStockLoading(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/stock/disponibles`);
      if (res.ok) {
        const data = await res.json();
        setStockVehicles(data.vehicles ?? []);
      } else {
        setStockVehicles([]);
      }
    } catch {
      setStockVehicles([]);
    } finally {
      setStockLoading(false);
    }
  };

  const handleOpenStockModal = () => {
    setSelectedStockVehicleId(null);
    setShowStockModal(true);
    fetchStockDisponibles();
  };

  const handleConfirmStockSelection = () => {
    const vehicle = stockVehicles.find((v) => v.id === selectedStockVehicleId);
    if (!vehicle) return;

    const brand = brands.find(
      (b) => b.nombre.toLowerCase() === vehicle.marca.toLowerCase()
    );
    if (brand) setMarcaId(brand.id);

    setModelo(vehicle.modelo);
    if (vehicle.anio != null) setAnio(String(vehicle.anio));
    setPatente(vehicle.patente ?? "");
    if (vehicle.categoriaId) setCategoriaId(vehicle.categoriaId);
    setVersion(vehicle.version ?? "");
    setColor(vehicle.color ?? "");
    setKilometros(vehicle.km != null ? String(vehicle.km) : "");
    setNotasMecanicas(vehicle.notasMecanicas ?? "");
    setNotasGenerales(vehicle.notasGenerales ?? "");
    setPrecioRevista(vehicle.precioRevista != null ? String(vehicle.precioRevista) : "");
    setPrecioOferta(vehicle.precioOferta != null ? String(vehicle.precioOferta) : "");
    setPrecioVentaTotal(vehicle.precioRevista != null ? String(vehicle.precioRevista) : "");

    ["marcaId", "modelo", "anio", "categoriaId", "color", "kilometros", "precioRevista", "precioVentaTotal"].forEach((f) =>
      handleInputChange(f)
    );

    setStockAutofillId(vehicle.id);
    setStockPhotoIds(vehicle.fotos.map((f) => f.id));
    setShowStockModal(false);
    setSelectedStockVehicleId(null);
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

  const handleTradeInPhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024
    );
    const newPhotos = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setTradeInPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleTradeInRemovePhoto = (id: string) => {
    setTradeInPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Operation fields validation
    if (!tipoOperacion) errors.tipoOperacion = "Seleccioná un tipo de operación";
    if (!fechaInicio) errors.fechaInicio = "La fecha de inicio es requerida";
    if (!nombreComprador.trim()) errors.nombreComprador = "El nombre del comprador es obligatorio";
    if (!precioVentaTotal) {
      errors.precioVentaTotal = "El precio de venta es requerido";
    } else if (parseFloat(precioVentaTotal) <= 0) {
      errors.precioVentaTotal = "El precio debe ser mayor a 0";
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

      formData.append("tipoOperacion", tipoOperacion);
      formData.append("fechaInicio", fechaInicio);
      formData.append("nombreComprador", nombreComprador.trim());
      formData.append("precioVentaTotal", precioVentaTotal);
      formData.append("ingresosBrutos", ingresosBrutos);

      if (precioToma) {
        formData.append("precioToma", precioToma);
      }
      if (stockAutofillId && tipoOperacion === "Venta desde stock") {
        formData.append("stockVehicleId", stockAutofillId);
      }

      if (tradeInVehicles.length > 0) {
        const { photos: tradeInVehiclePhotos, ...vehicleData } = tradeInVehicles[0];
        formData.append("vehiculoUsado", JSON.stringify(vehicleData));
        tradeInVehiclePhotos.forEach((photo) => {
          formData.append("vehiculoUsadoFotos", photo.file);
        });
      }

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
        setTipoOperacion(OPERATION_TYPES[0].nombre);
        setFechaInicio("");
        setNombreComprador("");
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
        setStockPhotoIds([]);
        setFieldErrors({});
        setTradeInVehicles([]);
        setPrecioToma("");
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
    setTipoOperacion(OPERATION_TYPES[0].nombre);
    const today = new Date().toISOString().split('T')[0];
    setFechaInicio(today);
    setNombreComprador("Juan Pérez");
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

  const isVentaDesdeStock = tipoOperacion === "Venta desde stock";

  const isFormValid =
    tipoOperacion &&
    fechaInicio &&
    nombreComprador.trim() &&
    marcaId &&
    modelo.trim() &&
    anio &&
    categoriaId &&
    version.trim() &&
    color.trim() &&
    kilometros &&
    precioRevista &&
    precioVentaTotal &&
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
    precioToma,
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
    setPrecioToma,
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                value={tipoOperacion}
                onChange={(e) => {
                  const prevTipo = tipoOperacion;
                  const newTipo = e.target.value;
                  setTipoOperacion(newTipo);
                  handleInputChange("tipoOperacion");
                  handleInputChange("vehiculoUsado");
                  if (
                    prevTipo === "Venta desde stock" &&
                    newTipo !== "Venta desde stock" &&
                    stockAutofillId
                  ) {
                    setMarcaId("");
                    setModelo("");
                    setPatente("");
                    setColor("");
                    setKilometros("");
                    setPrecioRevista("");
                    setPrecioOferta("");
                    setStockAutofillId(null);
                    setStockPhotoIds([]);
                  }
                }}
                className={`h-12 w-full appearance-none rounded-lg border ${
                  fieldErrors.tipoOperacion
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting}
              >
                <option value="">Seleccionar tipo de operación...</option>
                {OPERATION_TYPES.map((type) => (
                  <option key={type.id} value={type.nombre}>
                    {type.nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                expand_more
              </span>
            </div>
            {fieldErrors.tipoOperacion && (
              <span className="text-xs text-red-600">
                {fieldErrors.tipoOperacion}
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

          {/* Nombre del Comprador */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="nombreComprador"
              className="text-sm font-medium text-zinc-700"
            >
              Nombre del comprador <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                person
              </span>
              <input
                id="nombreComprador"
                type="text"
                value={nombreComprador}
                onChange={(e) => {
                  setNombreComprador(e.target.value);
                  handleInputChange("nombreComprador");
                }}
                placeholder="Nombre completo del comprador"
                className={`h-12 w-full rounded-lg border ${
                  fieldErrors.nombreComprador
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-300 bg-zinc-50"
                } pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                disabled={isSubmitting}
              />
            </div>
            {fieldErrors.nombreComprador && (
              <span className="text-xs text-red-600">
                {fieldErrors.nombreComprador}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botón Buscar en stock - visible para "Venta desde stock" */}
      {isVentaDesdeStock && (
        <button
          type="button"
          onClick={handleOpenStockModal}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 text-sm font-semibold text-indigo-700 transition-all hover:border-indigo-400 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined text-xl">search</span>
          <span>
            {stockAutofillId ? "Cambiar vehículo del stock" : "Buscar en stock"}
          </span>
        </button>
      )}

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
        stockPhotoIds={stockPhotoIds.length > 0 ? stockPhotoIds : undefined}
        stockVehicleId={stockAutofillId ?? undefined}
      />

      {/* Botón para añadir auto en parte de pago - Siempre visible */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowTradeInForm(true)}
          className={`flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
            fieldErrors.vehiculoUsado
              ? "border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100 focus:ring-red-500"
              : "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100 focus:ring-blue-500"
          }`}
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>Añadir auto en parte de pago</span>
        </button>
        {fieldErrors.vehiculoUsado && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{fieldErrors.vehiculoUsado}</span>
          </div>
        )}
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTradeInMarcaId(brands[0]?.id ?? "");
                      setTradeInModelo("Corolla");
                      setTradeInAnio("2021");
                      setTradeInPatente("ABC-123");
                      setTradeInVersion("XLE");
                      setTradeInColor("Blanco");
                      setTradeInKilometros("45000");
                      setTradeInPrecioRevista("18000000");
                      setTradeInPrecioNegociado("15000000");
                      setTradeInNotasMecanicas("Buen estado general");
                    }}
                    title="Autocompletar datos de prueba"
                    className="flex h-8 items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-2 text-xs text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <span className="material-symbols-outlined text-base">auto_fix_high</span>
                    Test
                  </button>
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

                {/* Precio Revista */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tradeInPrecioRevista"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Precio Revista <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      menu_book
                    </span>
                    <input
                      id="tradeInPrecioRevista"
                      type="number"
                      step="0.01"
                      value={tradeInPrecioRevista}
                      onChange={(e) => {
                        setTradeInPrecioRevista(e.target.value);
                        handleTradeInInputChange("tradeInPrecioRevista");
                      }}
                      placeholder="0.00"
                      className={`h-12 w-full rounded-lg border ${
                        tradeInFieldErrors.tradeInPrecioRevista
                          ? "border-red-300 bg-red-50"
                          : "border-zinc-300 bg-zinc-50"
                      } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {tradeInFieldErrors.tradeInPrecioRevista && (
                    <span className="text-xs text-red-600">
                      {tradeInFieldErrors.tradeInPrecioRevista}
                    </span>
                  )}
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

              {/* Fotos del vehículo en parte de pago */}
              <div className="flex flex-col gap-3 lg:col-span-2">
                <label className="text-sm font-medium text-zinc-700">
                  Fotos del vehículo
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setTradeInIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setTradeInIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setTradeInIsDragging(false); handleTradeInPhotoSelect(e.dataTransfer.files); }}
                  onClick={() => !isSubmitting && tradeInFileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all ${
                    tradeInIsDragging
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-zinc-300 bg-zinc-50 hover:border-emerald-400 hover:bg-emerald-50"
                  } ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <span className="material-symbols-outlined text-3xl text-emerald-500">cloud_upload</span>
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-700">
                      Arrastrá las fotos aquí o hacé clic para seleccionar
                    </p>
                    <p className="text-xs text-zinc-400">JPG, PNG o WEBP hasta 10MB por archivo</p>
                  </div>
                  <input
                    ref={tradeInFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => handleTradeInPhotoSelect(e.target.files)}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>

                {tradeInPhotos.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-600">
                        Fotos seleccionadas ({tradeInPhotos.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          tradeInPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
                          setTradeInPhotos([]);
                        }}
                        className="text-xs font-medium text-red-600 hover:text-red-700 focus:outline-none rounded px-1"
                        disabled={isSubmitting}
                      >
                        Eliminar todas
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {tradeInPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                        >
                          <img src={photo.preview} alt={photo.file.name} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleTradeInRemovePhoto(photo.id); }}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow transition-opacity hover:bg-red-700 focus:outline-none group-hover:opacity-100"
                            disabled={isSubmitting}
                            aria-label={`Eliminar foto ${photo.file.name}`}
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                            <p className="mt-1 text-sm text-zinc-600">
                              Revista: ${parseFloat(vehicle.precioRevista).toLocaleString()} • Estimado: ${parseFloat(vehicle.precioNegociado).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditTradeInVehicle(vehicle)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={isSubmitting}
                              aria-label="Editar vehículo"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveTradeInVehicle(vehicle.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                              disabled={isSubmitting}
                              aria-label="Eliminar vehículo"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
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
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditTradeInVehicle(vehicle)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                          aria-label="Editar vehículo"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTradeInVehicle(vehicle.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                          disabled={isSubmitting}
                          aria-label="Eliminar vehículo"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
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

      {/* Modal Buscar en stock */}
      {showStockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar vehículo en stock"
        >
          <div className="flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-indigo-600">
                  search
                </span>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Buscar vehículo en stock
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedStockVehicleId(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
              {stockLoading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-zinc-500">
                  <span className="material-symbols-outlined animate-spin text-2xl">
                    progress_activity
                  </span>
                  <span className="text-sm">Cargando vehículos disponibles...</span>
                </div>
              ) : stockVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-400">
                  <span className="material-symbols-outlined text-4xl">
                    directions_car
                  </span>
                  <p className="text-sm">No hay vehículos disponibles en stock.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {stockVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSelectedStockVehicleId(vehicle.id)}
                      className={`w-full rounded-lg border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        selectedStockVehicleId === vehicle.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {vehicle.fotos[0]?.id ? (
                            <div className="relative h-12 w-16 shrink-0">
                              <img
                                src={`/api/stock/${vehicle.id}/photos/${vehicle.fotos[0].id}`}
                                alt={`${vehicle.marca} ${vehicle.modelo}`}
                                className="h-12 w-16 rounded-lg object-cover"
                              />
                              {selectedStockVehicleId === vehicle.id && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-indigo-600/60">
                                  <span className="material-symbols-outlined text-lg text-white">
                                    check_circle
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg ${
                                selectedStockVehicleId === vehicle.id
                                  ? "bg-indigo-100"
                                  : "bg-zinc-100"
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined text-xl ${
                                  selectedStockVehicleId === vehicle.id
                                    ? "text-indigo-600"
                                    : "text-zinc-500"
                                }`}
                              >
                                {selectedStockVehicleId === vehicle.id
                                  ? "check_circle"
                                  : "directions_car"}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-zinc-900">
                              {vehicle.marca} {vehicle.modelo}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {vehicle.patente && (
                                <span className="mr-2">Patente: {vehicle.patente}</span>
                              )}
                              {vehicle.color && <span>{vehicle.color}</span>}
                              {vehicle.km != null && (
                                <span className="ml-2">
                                  · {vehicle.km.toLocaleString()} km
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {vehicle.precioRevista != null && (
                          <p className="shrink-0 text-sm font-medium text-zinc-700">
                            ${vehicle.precioRevista.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedStockVehicleId(null);
                }}
                className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmStockSelection}
                disabled={!selectedStockVehicleId}
                className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
              >
                <span className="material-symbols-outlined text-base">check</span>
                Seleccionar
              </button>
            </div>
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
