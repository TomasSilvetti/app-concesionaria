"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { OperationExpensesSection } from "@/components/operations/OperationExpensesSection";
import { OperationCobranzasSection } from "@/components/operations/OperationCobranzasSection";
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
  estado: "abierta" | "cerrada" | "cancelada";
  diasVenta: number | null;
  marcaNombre: string;
  categoriaNombre: string;
  tipoOperacionNombre: string;
  vehiculosIntercambiados: VehicleExchange[];
  gastos: Expense[];
}

export default function OperacionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [operation, setOperation] = useState<OperationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gastosTotal, setGastosTotal] = useState<number | null>(null);

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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
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
          label: estado,
        };
    }
  };

  const handleVolver = () => {
    router.push("/operaciones");
  };

  const handleEditar = () => {
    router.push(`/operaciones/${id}/edit`);
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

  if (error || !operation) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <span className="material-symbols-outlined text-4xl text-red-600">
              error
            </span>
          </div>
          <p className="mt-4 text-base font-medium text-zinc-900">
            {error || "Operación no encontrada"}
          </p>
          <button
            onClick={handleVolver}
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver al listado
          </button>
        </div>
      </AppLayout>
    );
  }

  const estadoBadge = getEstadoBadge(operation.estado);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header con breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <button
            onClick={handleVolver}
            className="hover:text-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Operaciones
          </button>
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
          <span className="text-zinc-900 font-medium">Operación #{operation.idOperacion}</span>
        </nav>

        {/* Header con título y acciones */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <span className="material-symbols-outlined text-3xl text-white">
                description
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">
                Operación #{operation.idOperacion}
              </h1>
              <p className="text-sm text-zinc-500">
                Detalle completo de la operación
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Volver al listado de operaciones"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              Volver
            </button>
            <button
              onClick={handleEditar}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Editar operación"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Editar
            </button>
          </div>
        </div>

        {/* Contenido principal en grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sección: Datos del vehículo */}
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
            {operation.fotos && operation.fotos.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {operation.fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
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
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Marca</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation.marcaNombre}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Modelo</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation.modelo}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Año</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation.anio}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Patente</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation.patente || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Categoría</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation.categoriaNombre}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Versión</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation.version || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Color</dt>
                <dd className="text-sm font-medium text-zinc-900">{operation.color || "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Kilómetros</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {operation.kilometros !== null ? `${operation.kilometros.toLocaleString("es-AR")} km` : "—"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Precio Revista</dt>
                <dd className="text-sm font-medium text-zinc-900">{formatCurrency(operation.precioRevista)}</dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <dt className="text-sm text-zinc-500">Precio Oferta</dt>
                <dd className="text-sm font-semibold text-green-600">{formatCurrency(operation.precioOferta)}</dd>
              </div>
              {operation.notasMecanicas && (
                <div className="flex flex-col gap-1 border-b border-zinc-100 pb-2 sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Notas Mecánicas</dt>
                  <dd className="text-sm text-zinc-900">{operation.notasMecanicas}</dd>
                </div>
              )}
              {operation.notasGenerales && (
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <dt className="text-sm text-zinc-500">Notas Generales</dt>
                  <dd className="text-sm text-zinc-900">{operation.notasGenerales}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Sección: Módulo de Gastos */}
          <div className="lg:col-span-1 lg:row-span-3 lg:row-start-1">
            <OperationExpensesSection
            operacionId={operation.idOperacion}
            onTotalChange={setGastosTotal}
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
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1 border-b border-zinc-100 pb-2 sm:border-b-0">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Fecha Inicio</dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {formatDate(operation.fechaInicio)}
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-zinc-100 pb-2 sm:border-b-0">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Fecha Venta</dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {formatDate(operation.fechaVenta)}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Días de Venta</dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {operation.diasVenta !== null ? `${operation.diasVenta} días` : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Sección: Cobranzas */}
          <OperationCobranzasSection
            operacionId={operation.idOperacion}
            precioVentaTotal={operation.precioVentaTotal}
          />

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
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-zinc-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Precio Venta Total
                </dt>
                <dd className="mt-2 text-xl font-semibold text-zinc-900">
                  {formatCurrency(operation.precioVentaTotal)}
                </dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Ingresos Brutos
                </dt>
                <dd className="mt-2 text-xl font-semibold text-zinc-900">
                  {formatCurrency(operation.ingresosBrutos)}
                </dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Gastos Asociados
                </dt>
                <dd className="mt-2 text-xl font-semibold text-red-600">
                  {formatCurrency(gastosTotal ?? operation.gastosAsociados)}
                </dd>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-green-700">
                  Ganancia Neta
                </dt>
                <dd className="mt-2 text-xl font-semibold text-green-700">
                  {formatCurrency(
                    gastosTotal !== null
                      ? operation.ingresosNetos - operation.gastosAsociados + gastosTotal
                      : operation.ingresosNetos
                  )}
                </dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Comisión
                </dt>
                <dd className="mt-2 text-xl font-semibold text-zinc-900">
                  {formatPercentage(operation.comision)}
                </dd>
              </div>
            </dl>
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start sm:gap-8">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Estado
                </dt>
                <dd className="mt-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${estadoBadge.color}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${estadoBadge.dotColor}`}
                    />
                    {estadoBadge.label}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Tipo de Operación
                </dt>
                <dd className="mt-2 text-sm font-semibold text-zinc-900">
                  {operation.tipoOperacionNombre}
                </dd>
              </div>
            </div>
          </div>

          {/* Sección: Vehículos de intercambio */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">
                swap_horiz
              </span>
              <h2 className="text-lg font-semibold text-zinc-900">
                Vehículos de Intercambio
              </h2>
            </div>

            {operation.vehiculosIntercambiados.length === 0 ? (
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
                    {operation.vehiculosIntercambiados.map((vehicle, index) => (
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
