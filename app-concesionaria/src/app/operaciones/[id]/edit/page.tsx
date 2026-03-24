"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { OperationExpensesSection } from "@/components/operations/OperationExpensesSection";
import { OperationCobranzasSection } from "@/components/operations/OperationCobranzasSection";
import "material-symbols/outlined.css";

interface VehicleExchange {
  vehicleId: string;
  marcaId: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  precioNegociado: number | null;
  version?: string;
  color?: string;
  kilometros?: number;
}

interface Brand {
  id: string;
  nombre: string;
}

interface Category {
  id: string;
  nombre: string;
}

interface ExchangeVehicleEdit {
  vehicleId: string;
  marcaId: string;
  modelo: string;
  anio: string;
  patente: string;
  version: string;
  color: string;
  kilometros: string;
  precioNegociado: string;
  precioToma: string;
}

interface Expense {
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
}

interface OperationType {
  id: string;
  nombre: string;
}

interface VehiclePhoto {
  id: string;
  nombreArchivo: string;
  orden: number;
}

interface OperationDetail {
  idOperacion: string;
  fechaInicio: string;
  fechaVenta: string | null;
  modelo: string;
  anio: number;
  patente: string;
  version: string | null;
  color: string | null;
  kilometros: number | null;
  notasMecanicas: string | null;
  notasGenerales: string | null;
  precioRevista: number | null;
  precioOferta: number | null;
  fotos: VehiclePhoto[];
  precioVentaTotal: number;
  ingresosBrutos: number;
  gastosAsociados: number;
  ingresosNetos: number;
  comision: number;
  precioToma: number | null;
  estado: "abierta" | "cerrada" | "cancelada";
  diasVenta: number | null;
  marcaNombre: string;
  categoriaNombre: string;
  tipoOperacionNombre: string;
  marcaId: string;
  categoriaId: string;
  tipoOperacionId: string;
  vehiculosIntercambiados: VehicleExchange[];
  gastos: Expense[];
  nombreComprador: string | null;
}

export default function OperacionEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [operation, setOperation] = useState<OperationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPagosIncompletosModal, setShowPagosIncompletosModal] = useState(false);
  const [cerrandoOperacion, setCerrandoOperacion] = useState(false);
  const [showOperacionCerradaModal, setShowOperacionCerradaModal] = useState(false);
  const [reabriendo, setReabriendo] = useState(false);

  // Form fields (solo campos editables de la operación)
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaVenta, setFechaVenta] = useState("");
  const [precioVentaTotal, setPrecioVentaTotal] = useState("");
  const [ingresosBrutos, setIngresosBrutos] = useState("");
  const [precioToma, setPrecioToma] = useState("");
  const [estado, setEstado] = useState<"abierta" | "cerrada" | "cancelada">("abierta");
  const [tipoOperacionId, setTipoOperacionId] = useState("");

  // Calculated fields
  const [ingresosNetos, setIngresosNetos] = useState(0);
  const [comision, setComision] = useState(0);
  const [gastosAsociados, setGastosAsociados] = useState(0);
  const [pendienteReal, setPendienteReal] = useState(0);

  // Original values for change detection
  const [originalValues, setOriginalValues] = useState<any>(null);

  // Data for selectors
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);

  // Vehicle fields (editable)
  const [vehicleModelo, setVehicleModelo] = useState("");
  const [vehicleAnio, setVehicleAnio] = useState("");
  const [vehiclePatente, setVehiclePatente] = useState("");
  const [vehicleVersion, setVehicleVersion] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleKilometros, setVehicleKilometros] = useState("");
  const [vehiclePrecioRevista, setVehiclePrecioRevista] = useState("");
  const [vehiclePrecioOferta, setVehiclePrecioOferta] = useState("");
  const [vehicleNotasMecanicas, setVehicleNotasMecanicas] = useState("");
  const [vehicleNotasGenerales, setVehicleNotasGenerales] = useState("");
  const [vehicleMarcaId, setVehicleMarcaId] = useState("");
  const [vehicleCategoriaId, setVehicleCategoriaId] = useState("");

  // Exchange vehicles (editable)
  const [exchangeVehicles, setExchangeVehicles] = useState<ExchangeVehicleEdit[]>([]);

  // Data for selectors
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOperation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${baseUrl}/api/operations/${id}`);

        if (res.ok) {
          const data = await res.json();
          setOperation(data);
          
          // Initialize form fields (solo campos editables)
          setFechaInicio(data.fechaInicio ? data.fechaInicio.split('T')[0] : "");
          setFechaVenta(data.fechaVenta ? data.fechaVenta.split('T')[0] : "");
          setPrecioVentaTotal(data.precioVentaTotal?.toString() || "");
          setIngresosBrutos(data.ingresosBrutos?.toString() || "");
          setPrecioToma(data.precioToma != null ? data.precioToma.toString() : "");
          setEstado(data.estado || "abierta");
          setTipoOperacionId(data.tipoOperacionId || "");
          setGastosAsociados(data.gastosAsociados || 0);
          // Recalculate ingresosNetos and comision with correct formula
          const ingresosCalculados = (data.ingresosBrutos || 0) - (data.gastosAsociados || 0);
          const comisionCalculada = data.precioVentaTotal > 0 
            ? (ingresosCalculados / data.precioVentaTotal) * 100 
            : 0;
          setIngresosNetos(ingresosCalculados);
          setComision(comisionCalculada);

          // Initialize vehicle fields
          setVehicleModelo(data.modelo || "");
          setVehicleAnio(data.anio?.toString() || "");
          setVehiclePatente(data.patente || "");
          setVehicleVersion(data.version || "");
          setVehicleColor(data.color || "");
          setVehicleKilometros(data.kilometros?.toString() || "");
          setVehiclePrecioRevista(data.precioRevista?.toString() || "");
          setVehiclePrecioOferta(data.precioOferta?.toString() || "");
          setVehicleNotasMecanicas(data.notasMecanicas || "");
          setVehicleNotasGenerales(data.notasGenerales || "");
          setVehicleMarcaId(data.marcaId || "");
          setVehicleCategoriaId(data.categoriaId || "");

          // Initialize exchange vehicles
          setExchangeVehicles(
            (data.vehiculosIntercambiados || []).map((v: VehicleExchange) => ({
              vehicleId: v.vehicleId,
              marcaId: v.marcaId,
              modelo: v.modelo,
              anio: v.anio?.toString() || "",
              patente: v.patente || "",
              version: v.version || "",
              color: v.color || "",
              kilometros: v.kilometros?.toString() || "",
              precioNegociado: v.precioNegociado?.toString() || "",
              precioToma: v.precioToma?.toString() || "",
            }))
          );

          // Store original values for change detection
          setOriginalValues({
            fechaInicio: data.fechaInicio ? data.fechaInicio.split('T')[0] : "",
            fechaVenta: data.fechaVenta ? data.fechaVenta.split('T')[0] : "",
            precioVentaTotal: data.precioVentaTotal?.toString() || "",
            ingresosBrutos: data.ingresosBrutos?.toString() || "",
            precioToma: data.precioToma != null ? data.precioToma.toString() : "",
            estado: data.estado || "abierta",
            tipoOperacionId: data.tipoOperacionId || "",
          });
        } else if (res.status === 404) {
          setError("Operación no encontrada");
        } else {
          setError("Error al cargar la operación");
        }
      } catch {
        setError("Error al cargar la operación");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOperation();
    }
  }, [id]);

  useEffect(() => {
    fetchOperationTypes();
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchOperationTypes = async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/operation-types`);
      if (res.ok) {
        const data = await res.json();
        setOperationTypes(data.types ?? []);
      }
    } catch {
      setOperationTypes([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/vehicle-brands`);
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands ?? []);
      }
    } catch {
      setBrands([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/vehicle-categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories ?? []);
      }
    } catch {
      setCategories([]);
    }
  };

  // Recalculate ingresosBrutos, ingresosNetos and comision when precioVentaTotal, precioToma or gastosAsociados change
  useEffect(() => {
    const precio = parseFloat(precioVentaTotal) || 0;
    const toma = parseFloat(precioToma) || 0;
    const gastos = gastosAsociados || 0;

    const ingresos = precio - toma;
    setIngresosBrutos(ingresos.toString());

    const netos = ingresos - gastos;
    setIngresosNetos(netos);

    const comisionCalculada = precio > 0 ? (netos / precio) * 100 : 0;
    setComision(comisionCalculada);
  }, [precioVentaTotal, precioToma, gastosAsociados]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getEstadoBadge = (estadoValue: string) => {
    switch (estadoValue) {
      case "abierta":
        return {
          color: "bg-green-50 text-green-700 border-green-200",
          dotColor: "bg-green-600",
          label: "Abierta",
        };
      case "cerrada":
        return {
          color: "bg-zinc-100 text-zinc-600 border-zinc-300",
          dotColor: "bg-zinc-400",
          label: "Cerrada",
        };
      case "cancelada":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          dotColor: "bg-red-600",
          label: "Cancelada",
        };
      default:
        return {
          color: "bg-zinc-100 text-zinc-600 border-zinc-300",
          dotColor: "bg-zinc-400",
          label: estadoValue,
        };
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fechaInicio) {
      errors.fechaInicio = "La fecha de inicio es requerida";
    }

    if (fechaVenta && fechaInicio) {
      const inicio = new Date(fechaInicio);
      const venta = new Date(fechaVenta);
      if (venta < inicio) {
        errors.fechaVenta = "La fecha de venta no puede ser anterior a la fecha de inicio";
      }
    }

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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getModifiedFields = () => {
    if (!originalValues) return {};

    const modified: any = {};

    if (fechaInicio !== originalValues.fechaInicio) {
      modified.fechaInicio = fechaInicio;
    }
    if (fechaVenta !== originalValues.fechaVenta) {
      modified.fechaVenta = fechaVenta || null;
    }
    if (precioVentaTotal !== originalValues.precioVentaTotal) {
      modified.precioVentaTotal = parseFloat(precioVentaTotal);
    }
    if (ingresosBrutos !== originalValues.ingresosBrutos) {
      modified.ingresosBrutos = parseFloat(ingresosBrutos);
    }
    if (precioToma !== originalValues.precioToma) {
      modified.precioToma = precioToma ? parseFloat(precioToma) : null;
    }
    if (estado !== originalValues.estado) {
      modified.estado = estado;
    }
    return modified;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const modifiedFields = getModifiedFields();

    const payload: Record<string, unknown> = { ...modifiedFields };

    // Incluir datos del vehículo principal
    payload.vehiculo = {
      marcaId: vehicleMarcaId,
      categoriaId: vehicleCategoriaId,
      modelo: vehicleModelo,
      anio: parseInt(vehicleAnio) || undefined,
      patente: vehiclePatente,
      version: vehicleVersion,
      color: vehicleColor,
      kilometros: vehicleKilometros !== "" ? parseInt(vehicleKilometros) : undefined,
      precioRevista: vehiclePrecioRevista !== "" ? parseFloat(vehiclePrecioRevista) : undefined,
      precioOferta: vehiclePrecioOferta !== "" ? parseFloat(vehiclePrecioOferta) : null,
      notasMecanicas: vehicleNotasMecanicas,
      notasGenerales: vehicleNotasGenerales,
    };

    // Incluir vehículos de intercambio si existen
    if (exchangeVehicles.length > 0) {
      payload.vehiculosIntercambiados = exchangeVehicles.map((v) => ({
        vehicleId: v.vehicleId,
        marcaId: v.marcaId,
        modelo: v.modelo,
        anio: v.anio !== "" ? parseInt(v.anio) : undefined,
        patente: v.patente,
        version: v.version,
        color: v.color,
        kilometros: v.kilometros !== "" ? parseInt(v.kilometros) : undefined,
        precioNegociado: v.precioNegociado !== "" ? parseFloat(v.precioNegociado) : null,
        precioToma: v.precioToma !== "" ? parseFloat(v.precioToma) : null,
      }));
    }

    setIsSaving(true);
    setError(null);

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/operations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push(`/operaciones/${id}`);
      } else if (res.status === 400) {
        setError(data.message ?? "Datos inválidos. Verificá los campos.");
      } else if (res.status === 404) {
        setError("Operación no encontrada");
      } else {
        setError(data.message ?? "Error al guardar los cambios");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCerrarOperacion = async () => {
    setCerrandoOperacion(true);
    try {
      const res = await fetch(`/api/operations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "cerrada" }),
      });
      if (!res.ok) throw new Error();
      setShowOperacionCerradaModal(true);
    } finally {
      setCerrandoOperacion(false);
    }
  };

  const handleReabrir = async () => {
    setReabriendo(true);
    try {
      const res = await fetch(`/api/operations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "abierta" }),
      });
      if (!res.ok) throw new Error();
      setOperation((prev) => prev ? { ...prev, estado: "abierta" } : null);
      setEstado("abierta");
    } catch {
      // silencioso, el banner seguirá visible
    } finally {
      setReabriendo(false);
    }
  };

  const handleCancel = () => {
    router.push(`/operaciones/${id}`);
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
            progress_activity
          </span>
          <p className="mt-4 text-sm text-zinc-600">Cargando operación...</p>
        </div>
      </AppLayout>
    );
  }

  if (error && !operation) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <span className="material-symbols-outlined text-4xl text-red-600">
              error
            </span>
          </div>
          <p className="mt-4 text-base font-medium text-zinc-900">
            {error}
          </p>
          <button
            onClick={handleCancel}
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver al listado
          </button>
        </div>
      </AppLayout>
    );
  }

  const estadoBadge = getEstadoBadge(estado);
  const hasValidationErrors = Object.keys(fieldErrors).length > 0;
  const isCerrada = operation?.estado === "cerrada";

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header con breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <button
            onClick={() => router.push("/operaciones")}
            className="hover:text-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Operaciones
          </button>
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
          <button
            onClick={handleCancel}
            className="hover:text-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Operación #{operation?.idOperacion}
          </button>
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
          <span className="text-zinc-900 font-medium">Editar</span>
        </nav>

        {/* Header con título y acciones */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600">
              <span className="material-symbols-outlined text-3xl text-white">
                edit
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">
                Editar Operación #{operation?.idOperacion}
              </h1>
              <p className="text-sm text-zinc-500">
                Modificá los campos necesarios y guardá los cambios
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              aria-label="Cancelar edición"
            >
              <span className="material-symbols-outlined text-xl">close</span>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || hasValidationErrors || isCerrada}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Guardar cambios"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">
                    progress_activity
                  </span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">save</span>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>

        {/* Banner operación cerrada */}
        {isCerrada && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-amber-600 shrink-0">lock</span>
            <p className="text-sm text-amber-800 flex-1">
              Esta operación está cerrada. Para editarla, primero debés reabrirla.
            </p>
            <button
              type="button"
              onClick={handleReabrir}
              disabled={reabriendo}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
            >
              {reabriendo && (
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              )}
              <span className="material-symbols-outlined text-sm">lock_open</span>
              Abrir operación
            </button>
          </div>
        )}

        {/* Mensaje de error global */}
        {error && operation && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">error</span>
            {error}
          </div>
        )}

        {/* Contenido principal en grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sección: Datos del vehículo (editable) */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2 lg:row-start-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                directions_car
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Datos del Vehículo
              </h2>
            </div>

            {/* Fotos del vehículo */}
            {operation && operation.fotos && operation.fotos.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {operation.fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="relative aspect-video overflow-hidden rounded-lg border border-zinc-300 bg-white"
                  >
                    <img
                      src={`/api/photos/${foto.id}`}
                      alt={`Foto del vehículo - ${foto.nombreArchivo}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Marca */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Marca</label>
                <div className="relative">
                  <select
                    value={vehicleMarcaId}
                    onChange={(e) => setVehicleMarcaId(e.target.value)}
                    disabled={isSaving || isCerrada}
                    className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  >
                    <option value="">Seleccioná una marca</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">expand_more</span>
                </div>
              </div>

              {/* Modelo */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Modelo</label>
                <input
                  type="text"
                  value={vehicleModelo}
                  onChange={(e) => setVehicleModelo(e.target.value)}
                  disabled={isSaving || isCerrada}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {/* Año */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Año</label>
                <input
                  type="number"
                  value={vehicleAnio}
                  onChange={(e) => setVehicleAnio(e.target.value)}
                  disabled={isSaving || isCerrada}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {/* Patente */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Patente</label>
                <input
                  type="text"
                  value={vehiclePatente}
                  onChange={(e) => setVehiclePatente(e.target.value)}
                  disabled={isSaving || isCerrada}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {/* Categoría */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Categoría</label>
                <div className="relative">
                  <select
                    value={vehicleCategoriaId}
                    onChange={(e) => setVehicleCategoriaId(e.target.value)}
                    disabled={isSaving || isCerrada}
                    className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  >
                    <option value="">Seleccioná una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">expand_more</span>
                </div>
              </div>

              {/* Versión */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Versión</label>
                <input
                  type="text"
                  value={vehicleVersion}
                  onChange={(e) => setVehicleVersion(e.target.value)}
                  disabled={isSaving || isCerrada}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {/* Color */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Color</label>
                <input
                  type="text"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  disabled={isSaving || isCerrada}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {/* Kilómetros */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Kilómetros</label>
                <input
                  type="number"
                  value={vehicleKilometros}
                  onChange={(e) => setVehicleKilometros(e.target.value)}
                  disabled={isSaving || isCerrada}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {/* Precio de Toma */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Precio de Toma</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">handshake</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precioToma}
                    onChange={(e) => {
                      setPrecioToma(e.target.value);
                      handleInputChange("precioToma");
                    }}
                    disabled={isSaving || isCerrada}
                    placeholder="0.00"
                    className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Precio Revista */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Precio Revista</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">attach_money</span>
                  <input
                    type="number"
                    step="0.01"
                    value={vehiclePrecioRevista}
                    onChange={(e) => setVehiclePrecioRevista(e.target.value)}
                    disabled={isSaving || isCerrada}
                    placeholder="0.00"
                    className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Precio Oferta */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">Precio Oferta</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">sell</span>
                  <input
                    type="number"
                    step="0.01"
                    value={vehiclePrecioOferta}
                    onChange={(e) => setVehiclePrecioOferta(e.target.value)}
                    disabled={isSaving || isCerrada}
                    placeholder="0.00"
                    className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Comprador (solo lectura) */}
              {operation?.nombreComprador && (
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-sm font-medium text-zinc-700">Comprador</label>
                  <div className="flex h-12 items-center rounded-lg border border-zinc-200 bg-zinc-100 px-4 text-sm text-zinc-700">
                    {operation.nombreComprador}
                  </div>
                </div>
              )}

              {/* Notas Mecánicas */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-sm font-medium text-zinc-700">Notas Mecánicas</label>
                <textarea
                  value={vehicleNotasMecanicas}
                  onChange={(e) => setVehicleNotasMecanicas(e.target.value)}
                  disabled={isSaving || isCerrada}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-none"
                />
              </div>

              {/* Notas Generales */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-sm font-medium text-zinc-700">Notas Generales</label>
                <textarea
                  value={vehicleNotasGenerales}
                  onChange={(e) => setVehicleNotasGenerales(e.target.value)}
                  disabled={isSaving || isCerrada}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sección: Módulo de Gastos */}
          <div className="lg:col-span-1 lg:row-span-3 lg:row-start-1">
            <OperationExpensesSection
              operacionId={id}
              onTotalChange={setGastosAsociados}
              readOnly={false}
            />
          </div>

          {/* Sección: Fechas */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2 lg:row-start-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                calendar_today
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">Fechas</h2>
            </div>
            <div className="space-y-4">
              {/* Fecha Inicio */}
              <div className="flex flex-col gap-2">
                <label htmlFor="fechaInicio" className="text-sm font-medium text-zinc-700">
                  Fecha Inicio
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
                    disabled={isSaving || isCerrada}
                  />
                </div>
                {fieldErrors.fechaInicio && (
                  <span className="text-xs text-red-600">{fieldErrors.fechaInicio}</span>
                )}
              </div>

              {/* Fecha Venta */}
              <div className="flex flex-col gap-2">
                <label htmlFor="fechaVenta" className="text-sm font-medium text-zinc-700">
                  Fecha Venta
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    event_available
                  </span>
                  <input
                    id="fechaVenta"
                    type="date"
                    value={fechaVenta}
                    onChange={(e) => {
                      setFechaVenta(e.target.value);
                      handleInputChange("fechaVenta");
                    }}
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.fechaVenta
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={isSaving || isCerrada}
                  />
                </div>
                {fieldErrors.fechaVenta && (
                  <span className="text-xs text-red-600">{fieldErrors.fechaVenta}</span>
                )}
                <p className="text-xs text-zinc-500">
                  Dejá vacío si la operación aún no se vendió
                </p>
              </div>

              {/* Días de Venta (calculado) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  Días de Venta
                </label>
                <div className="flex h-12 items-center rounded-lg border border-zinc-300 bg-zinc-100 px-4 text-sm font-medium text-zinc-700">
                  {fechaVenta && fechaInicio
                    ? Math.ceil(
                        (new Date(fechaVenta).getTime() - new Date(fechaInicio).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + " días"
                    : "—"}
                </div>
                <p className="text-xs text-zinc-500">
                  Se calcula automáticamente según las fechas
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Cobranzas */}
          <div className="lg:col-span-2">
            <OperationCobranzasSection
              operacionId={id}
              precioVentaTotal={parseFloat(precioVentaTotal) || 0}
              estado={estado}
              onPendienteChange={setPendienteReal}
              readOnly={false}
            />
          </div>

          {/* Sección: Información financiera */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                payments
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Información Financiera
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Precio Venta Total */}
              <div className="flex flex-col gap-2">
                <label htmlFor="precioVentaTotal" className="text-sm font-medium text-zinc-700">
                  Precio Venta Total
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    attach_money
                  </span>
                  <input
                    id="precioVentaTotal"
                    type="number"
                    step="0.01"
                    value={precioVentaTotal}
                    onChange={(e) => {
                      setPrecioVentaTotal(e.target.value);
                      handleInputChange("precioVentaTotal");
                    }}
                    placeholder="0.00"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.precioVentaTotal
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={isSaving || isCerrada}
                  />
                </div>
                {fieldErrors.precioVentaTotal && (
                  <span className="text-xs text-red-600">{fieldErrors.precioVentaTotal}</span>
                )}
              </div>

              {/* Precio de Toma */}
              <div className="flex flex-col gap-2">
                <label htmlFor="precioToma" className="text-sm font-medium text-zinc-700">
                  Precio de Toma
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    handshake
                  </span>
                  <input
                    id="precioToma"
                    type="number"
                    step="0.01"
                    value={precioToma}
                    onChange={(e) => {
                      setPrecioToma(e.target.value);
                      handleInputChange("precioToma");
                    }}
                    placeholder="0.00"
                    className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    disabled={isSaving || isCerrada}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Precio al que la concesionaria compra el vehículo (opcional)
                </p>
              </div>

              {/* Ingresos Brutos (calculado) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  Ingresos Brutos
                </label>
                <div className="flex h-12 items-center rounded-lg border border-zinc-300 bg-zinc-100 px-4 text-sm font-medium text-zinc-900">
                  {formatCurrency(parseFloat(ingresosBrutos) || 0)}
                </div>
                <p className="text-xs text-zinc-500">
                  Precio Venta Total - Precio de Toma
                </p>
              </div>

              {/* Gastos Asociados (solo lectura) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  Gastos Asociados
                </label>
                <div className="flex h-12 items-center rounded-lg border border-zinc-300 bg-zinc-100 px-4 text-sm font-medium text-red-600">
                  {formatCurrency(gastosAsociados)}
                </div>
                <p className="text-xs text-zinc-500">
                  Se actualiza automáticamente desde Gastos
                </p>
              </div>

              {/* Ganancia Neta (calculado) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-green-700">
                  Ganancia Neta
                </label>
                <div className="flex h-12 items-center rounded-lg border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700">
                  {formatCurrency(ingresosNetos)}
                </div>
                <p className="text-xs text-zinc-500">
                  Ingresos Brutos - Gastos Asociados
                </p>
              </div>

              {/* Comisión (calculado) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  Comisión
                </label>
                <div className="flex h-12 items-center rounded-lg border border-zinc-300 bg-zinc-100 px-4 text-sm font-medium text-zinc-900">
                  {formatPercentage(comision)}
                </div>
                <p className="text-xs text-zinc-500">
                  Se calcula automáticamente
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Estado y tipo */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                info
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Estado y Tipo
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Estado */}
              <div className="flex flex-col gap-2">
                <label htmlFor="estado" className="text-sm font-medium text-zinc-700">
                  Estado
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    toggle_on
                  </span>
                  <select
                    id="estado"
                    value={estado}
                    onChange={(e) => {
                      setEstado(e.target.value as "abierta" | "cerrada" | "cancelada");
                      handleInputChange("estado");
                    }}
                    className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    disabled={isSaving || isCerrada}
                  >
                    <option value="abierta">Abierta</option>
                    <option value="cerrada">Cerrada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    expand_more
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge.color}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${estadoBadge.dotColor}`}
                    />
                    {estadoBadge.label}
                  </span>
                </div>
              </div>

              {/* Tipo de Operación (solo lectura) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  Tipo de Operación
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    category
                  </span>
                  <div className="flex h-12 w-full items-center rounded-lg border border-zinc-200 bg-zinc-100 pl-11 pr-4 text-sm text-zinc-700">
                    {operationTypes.find((t) => t.id === tipoOperacionId)?.nombre || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Vehículos de intercambio (editable) */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                swap_horiz
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Vehículos de Intercambio
              </h2>
            </div>

            {exchangeVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                  <span className="material-symbols-outlined text-2xl text-zinc-400">
                    swap_horiz
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-600">
                  Sin vehículos de intercambio
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {exchangeVehicles.map((vehicle, index) => (
                  <div key={vehicle.vehicleId} className="rounded-lg border border-zinc-200 p-4">
                    <p className="mb-4 text-sm font-semibold text-zinc-700">
                      Vehículo {index + 1}
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Marca */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Marca</label>
                        <div className="relative">
                          <select
                            value={vehicle.marcaId}
                            onChange={(e) => {
                              const updated = [...exchangeVehicles];
                              updated[index] = { ...updated[index], marcaId: e.target.value };
                              setExchangeVehicles(updated);
                            }}
                            disabled={isSaving || isCerrada}
                            className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                          >
                            <option value="">Seleccioná una marca</option>
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>{b.nombre}</option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">expand_more</span>
                        </div>
                      </div>

                      {/* Modelo */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Modelo</label>
                        <input
                          type="text"
                          value={vehicle.modelo}
                          onChange={(e) => {
                            const updated = [...exchangeVehicles];
                            updated[index] = { ...updated[index], modelo: e.target.value };
                            setExchangeVehicles(updated);
                          }}
                          disabled={isSaving || isCerrada}
                          className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />
                      </div>

                      {/* Año */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Año</label>
                        <input
                          type="number"
                          value={vehicle.anio}
                          onChange={(e) => {
                            const updated = [...exchangeVehicles];
                            updated[index] = { ...updated[index], anio: e.target.value };
                            setExchangeVehicles(updated);
                          }}
                          disabled={isSaving || isCerrada}
                          className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />
                      </div>

                      {/* Patente */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Patente</label>
                        <input
                          type="text"
                          value={vehicle.patente}
                          onChange={(e) => {
                            const updated = [...exchangeVehicles];
                            updated[index] = { ...updated[index], patente: e.target.value };
                            setExchangeVehicles(updated);
                          }}
                          disabled={isSaving || isCerrada}
                          className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />
                      </div>

                      {/* Versión */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Versión</label>
                        <input
                          type="text"
                          value={vehicle.version}
                          onChange={(e) => {
                            const updated = [...exchangeVehicles];
                            updated[index] = { ...updated[index], version: e.target.value };
                            setExchangeVehicles(updated);
                          }}
                          disabled={isSaving || isCerrada}
                          className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />
                      </div>

                      {/* Color */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Color</label>
                        <input
                          type="text"
                          value={vehicle.color}
                          onChange={(e) => {
                            const updated = [...exchangeVehicles];
                            updated[index] = { ...updated[index], color: e.target.value };
                            setExchangeVehicles(updated);
                          }}
                          disabled={isSaving || isCerrada}
                          className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />
                      </div>

                      {/* Kilómetros */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Kilómetros</label>
                        <input
                          type="number"
                          value={vehicle.kilometros}
                          onChange={(e) => {
                            const updated = [...exchangeVehicles];
                            updated[index] = { ...updated[index], kilometros: e.target.value };
                            setExchangeVehicles(updated);
                          }}
                          disabled={isSaving || isCerrada}
                          className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />
                      </div>

                      {/* Precio de Toma */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Precio de Toma</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">sell</span>
                          <input
                            type="number"
                            step="0.01"
                            value={vehicle.precioToma}
                            onChange={(e) => {
                              const updated = [...exchangeVehicles];
                              updated[index] = { ...updated[index], precioToma: e.target.value };
                              setExchangeVehicles(updated);
                            }}
                            disabled={isSaving || isCerrada}
                            placeholder="0.00"
                            className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* Precio Venta Estimado */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Precio Venta Estimado</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">handshake</span>
                          <input
                            type="number"
                            step="0.01"
                            value={vehicle.precioNegociado}
                            onChange={(e) => {
                              const updated = [...exchangeVehicles];
                              updated[index] = { ...updated[index], precioNegociado: e.target.value };
                              setExchangeVehicles(updated);
                            }}
                            disabled={isSaving || isCerrada}
                            placeholder="0.00"
                            className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cerrar operación */}
          {!isCerrada && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm lg:col-span-3">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-2xl text-amber-600">warning</span>
                  <div>
                    <h2 className="text-base font-semibold text-amber-900">Cerrar operación</h2>
                    <p className="mt-0.5 text-sm text-amber-700">
                      Ingresa el pago final para cerrar la operación
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (pendienteReal > 0) {
                      setShowPagosIncompletosModal(true);
                    } else {
                      handleCerrarOperacion();
                    }
                  }}
                  disabled={cerrandoOperacion}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">lock</span>
                  Cerrar operación
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {showPagosIncompletosModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pagos incompletos"
        >
          <div className="flex w-full max-w-sm flex-col rounded-xl bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-4">
              <span className="material-symbols-outlined text-2xl text-amber-600">warning</span>
              <h2 className="text-base font-semibold text-zinc-900">No se puede cerrar la operación</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-zinc-700">
                Debes completar todos los pagos antes de cerrar la operación.
              </p>
            </div>
            <div className="flex justify-end border-t border-zinc-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowPagosIncompletosModal(false)}
                className="flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showOperacionCerradaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Operación cerrada"
        >
          <div className="flex w-full max-w-sm flex-col rounded-xl bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-4">
              <span className="material-symbols-outlined text-2xl text-green-600">check_circle</span>
              <h2 className="text-base font-semibold text-zinc-900">Operación cerrada</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-zinc-700">
                La operación ha sido cerrada exitosamente. Todos los pagos han sido registrados.
              </p>
            </div>
            <div className="flex justify-end border-t border-zinc-200 px-6 py-4">
              <button
                type="button"
                onClick={() => router.push("/operaciones")}
                className="flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
