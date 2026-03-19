"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import "material-symbols/outlined.css";

interface VehicleExchange {
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  precioNegociado: number | null;
  version?: string;
  color?: string;
  kilometros?: number;
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

  // Original values for change detection
  const [originalValues, setOriginalValues] = useState<any>(null);

  // Data for selectors
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);

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

  // Recalculate ingresosNetos and comision when ingresosBrutos or gastosAsociados change
  useEffect(() => {
    const ingresos = parseFloat(ingresosBrutos) || 0;
    const gastos = gastosAsociados || 0;
    const precio = parseFloat(precioVentaTotal) || 0;

    const netos = ingresos - gastos;
    setIngresosNetos(netos);

    const comisionCalculada = precio > 0 ? (netos / precio) * 100 : 0;
    setComision(comisionCalculada);
  }, [ingresosBrutos, gastosAsociados, precioVentaTotal]);

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

    if (!tipoOperacionId) {
      errors.tipoOperacionId = "Seleccioná un tipo de operación";
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
    if (tipoOperacionId !== originalValues.tipoOperacionId) {
      modified.tipoOperacionId = tipoOperacionId;
    }

    return modified;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const modifiedFields = getModifiedFields();

    if (Object.keys(modifiedFields).length === 0) {
      setError("No hay cambios para guardar");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/operations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modifiedFields),
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
              disabled={isSaving || hasValidationErrors}
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

        {/* Mensaje de error global */}
        {error && operation && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">error</span>
            {error}
          </div>
        )}

        {/* Contenido principal en grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sección: Datos del vehículo (solo lectura) */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-zinc-600">
                directions_car
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Datos del Vehículo
                </h2>
                <p className="text-xs text-zinc-500">
                  Los datos del vehículo no son editables desde la operación
                </p>
              </div>
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

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Marca</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation?.marcaNombre}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Modelo</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation?.modelo}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Año</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation?.anio}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Patente</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation?.patente || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Categoría</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation?.categoriaNombre}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Versión</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation?.version || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Color</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation?.color || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Kilómetros</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {operation?.kilometros !== null && operation?.kilometros !== undefined 
                    ? `${operation.kilometros.toLocaleString("es-AR")} km` 
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Precio Revista</dt>
                <dd className="text-sm font-medium text-zinc-900">{formatCurrency(operation?.precioRevista || null)}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <dt className="text-sm text-zinc-600">Precio Oferta</dt>
                <dd className="text-sm font-semibold text-green-600">{formatCurrency(operation?.precioOferta || null)}</dd>
              </div>
              {operation?.nombreComprador && (
                <div className="flex justify-between border-b border-zinc-200 pb-2 sm:col-span-2">
                  <dt className="text-sm text-zinc-600">Comprador</dt>
                  <dd className="text-sm font-medium text-zinc-900">{operation.nombreComprador}</dd>
                </div>
              )}
              {operation?.notasMecanicas && (
                <div className="flex flex-col gap-1 border-b border-zinc-200 pb-2 sm:col-span-2">
                  <dt className="text-sm text-zinc-600">Notas Mecánicas</dt>
                  <dd className="text-sm text-zinc-900">{operation.notasMecanicas}</dd>
                </div>
              )}
              {operation?.notasGenerales && (
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <dt className="text-sm text-zinc-600">Notas Generales</dt>
                  <dd className="text-sm text-zinc-900">{operation.notasGenerales}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Sección: Fechas */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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

          {/* Sección: Gastos asociados (solo lectura) - al lado de Fechas */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-zinc-400">
                receipt_long
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Gastos Asociados
              </h2>
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                Solo lectura
              </span>
            </div>

            {operation && operation.gastos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                  <span className="material-symbols-outlined text-2xl text-zinc-400">
                    receipt_long
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-600">
                  Sin gastos asociados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Descripción
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {operation?.gastos.map((gasto, index) => (
                      <tr key={index} className="transition-colors hover:bg-zinc-50">
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {formatDate(gasto.fecha)}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {gasto.descripcion}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {gasto.categoria}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-red-600">
                          {formatCurrency(gasto.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sección: Información financiera */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
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
                    disabled={isSaving}
                  />
                </div>
                {fieldErrors.precioVentaTotal && (
                  <span className="text-xs text-red-600">{fieldErrors.precioVentaTotal}</span>
                )}
              </div>

              {/* Ingresos Brutos */}
              <div className="flex flex-col gap-2">
                <label htmlFor="ingresosBrutos" className="text-sm font-medium text-zinc-700">
                  Ingresos Brutos
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    monetization_on
                  </span>
                  <input
                    id="ingresosBrutos"
                    type="number"
                    step="0.01"
                    value={ingresosBrutos}
                    onChange={(e) => {
                      setIngresosBrutos(e.target.value);
                      handleInputChange("ingresosBrutos");
                    }}
                    placeholder="0.00"
                    className={`h-12 w-full rounded-lg border ${
                      fieldErrors.ingresosBrutos
                        ? "border-red-300 bg-red-50"
                        : "border-zinc-300 bg-zinc-50"
                    } pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    disabled={isSaving}
                  />
                </div>
                {fieldErrors.ingresosBrutos && (
                  <span className="text-xs text-red-600">{fieldErrors.ingresosBrutos}</span>
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
                    disabled={isSaving}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Precio al que la concesionaria compra el vehículo (opcional)
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
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
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
                    disabled={isSaving}
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

              {/* Tipo de Operación */}
              <div className="flex flex-col gap-2">
                <label htmlFor="tipoOperacion" className="text-sm font-medium text-zinc-700">
                  Tipo de Operación
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
                    disabled={isSaving}
                  >
                    <option value="">Seleccionar tipo...</option>
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
                  <span className="text-xs text-red-600">{fieldErrors.tipoOperacionId}</span>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Vehículos de intercambio (solo lectura) */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-zinc-400">
                swap_horiz
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Vehículos de Intercambio
              </h2>
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                Solo lectura
              </span>
            </div>

            {operation && operation.vehiculosIntercambiados.length === 0 ? (
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Marca
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Modelo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Año
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Patente
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Precio Negociado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {operation?.vehiculosIntercambiados.map((vehicle, index) => (
                      <tr key={index} className="transition-colors hover:bg-zinc-50">
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {vehicle.marca}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {vehicle.modelo}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {vehicle.anio}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-900">
                          {vehicle.patente}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900">
                          {formatCurrency(vehicle.precioNegociado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
