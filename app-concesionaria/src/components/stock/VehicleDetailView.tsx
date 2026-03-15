"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "material-symbols/outlined.css";

interface VehiclePhoto {
  id: string;
  nombreArchivo: string;
  orden: number;
}

interface OperacionVehiculoVendido {
  marca: string;
  modelo: string;
  patente: string | null;
}

interface Operacion {
  idOperacion: string;
  vehiculoVendido: OperacionVehiculoVendido | null;
}

interface Vehicle {
  id: string;
  marcaId: string;
  modelo: string;
  anio: number;
  categoriaId: string;
  patente: string | null;
  version: string | null;
  color: string | null;
  kilometros: number | null;
  notasMecanicas: string | null;
  notasGenerales: string | null;
  precioRevista: number | null;
  precioOferta: number | null;
  estado: string | null;
  operacionId: string | null;
  creadoEn: string;
  actualizadoEn: string;
  VehicleBrand: { nombre: string };
  VehicleCategory: { nombre: string };
  VehiclePhoto: VehiclePhoto[];
  operacion?: Operacion | null;
}

interface VehicleDetailViewProps {
  vehicleId: string;
}

export function VehicleDetailView({ vehicleId }: VehicleDetailViewProps) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${baseUrl}/api/stock/${vehicleId}`);
        if (res.ok) {
          const data = await res.json();
          setVehicle(data.vehicle);
        } else if (res.status === 404) {
          setError("Vehículo no encontrado.");
        } else {
          setError("No se pudieron cargar los datos del vehículo.");
        }
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatKilometers = (km: number | null) => {
    if (km === null) return "—";
    return new Intl.NumberFormat("es-AR").format(km) + " km";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
          progress_activity
        </span>
        <p className="mt-4 text-sm text-zinc-500">Cargando vehículo...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <span className="material-symbols-outlined text-4xl text-red-500">
            error
          </span>
        </div>
        <p className="mt-4 text-base font-medium text-zinc-900">
          {error ?? "No se encontró el vehículo"}
        </p>
        <button
          onClick={() => router.push("/stock")}
          className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Volver al listado
        </button>
      </div>
    );
  }

  const photos = vehicle.VehiclePhoto;
  const currentPhoto = photos[photoIndex] ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Datos básicos */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
          <span className="material-symbols-outlined text-xl text-blue-600">
            info
          </span>
          Datos básicos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Marca" value={vehicle.VehicleBrand.nombre} />
          <DetailField label="Modelo" value={vehicle.modelo} />
          <DetailField label="Año" value={vehicle.anio.toString()} />
          <DetailField label="Categoría" value={vehicle.VehicleCategory.nombre} />
          <DetailField label="Patente" value={vehicle.patente} />
          <DetailField label="Versión" value={vehicle.version} />
          <DetailField label="Color" value={vehicle.color} />
          <DetailField
            label="Kilómetros"
            value={formatKilometers(vehicle.kilometros)}
          />
          {vehicle.estado && (
            <DetailField label="Estado" value={vehicle.estado} />
          )}
          <DetailField label="Ingresado el" value={formatDate(vehicle.creadoEn)} />
        </div>
      </div>

      {/* Precios */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
          <span className="material-symbols-outlined text-xl text-blue-600">
            payments
          </span>
          Precios
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Precio Revista
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">
              {formatCurrency(vehicle.precioRevista)}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-green-600">
              Precio Oferta
            </p>
            <p className="mt-1 text-xl font-semibold text-green-700">
              {formatCurrency(vehicle.precioOferta)}
            </p>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
          <span className="material-symbols-outlined text-xl text-blue-600">
            notes
          </span>
          Notas
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Notas Mecánicas
            </p>
            {vehicle.notasMecanicas ? (
              <p className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                {vehicle.notasMecanicas}
              </p>
            ) : (
              <p className="text-sm italic text-zinc-400">Sin notas mecánicas</p>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Notas Generales
            </p>
            {vehicle.notasGenerales ? (
              <p className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                {vehicle.notasGenerales}
              </p>
            ) : (
              <p className="text-sm italic text-zinc-400">Sin notas generales</p>
            )}
          </div>
        </div>
      </div>

      {/* Fotos */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
          <span className="material-symbols-outlined text-xl text-blue-600">
            photo_library
          </span>
          Fotos
          {photos.length > 0 && (
            <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {photos.length}
            </span>
          )}
        </h2>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-12">
            <span className="material-symbols-outlined text-4xl text-zinc-300">
              image_not_supported
            </span>
            <p className="mt-2 text-sm text-zinc-400">Sin fotos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Foto principal */}
            <div className="relative overflow-hidden rounded-xl bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/stock/${vehicleId}/photos/${currentPhoto!.id}`}
                alt={`Foto ${photoIndex + 1} de ${vehicle.VehicleBrand.nombre} ${vehicle.modelo}`}
                className="h-72 w-full object-contain sm:h-96"
              />

              {/* Controles de navegación */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
                    }
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Foto anterior"
                  >
                    <span className="material-symbols-outlined text-xl text-zinc-700">
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      setPhotoIndex((i) => (i + 1) % photos.length)
                    }
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Foto siguiente"
                  >
                    <span className="material-symbols-outlined text-xl text-zinc-700">
                      chevron_right
                    </span>
                  </button>

                  {/* Indicador de posición */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
                    {photoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setPhotoIndex(index)}
                    className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      index === photoIndex
                        ? "border-blue-600"
                        : "border-transparent hover:border-zinc-300"
                    }`}
                    aria-label={`Ver foto ${index + 1}`}
                    aria-pressed={index === photoIndex}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/stock/${vehicleId}/photos/${photo.id}`}
                      alt={`Miniatura ${index + 1}`}
                      className="h-16 w-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Operación asociada */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
          <span className="material-symbols-outlined text-xl text-blue-600">
            receipt_long
          </span>
          Operación asociada
        </h2>

        {vehicle.operacionId && vehicle.operacion ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  ID de Operación
                </p>
                <p className="mt-1 font-mono text-sm font-medium text-zinc-900">
                  {vehicle.operacion.idOperacion}
                </p>
              </div>
              {vehicle.operacion.vehiculoVendido && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                    Vehículo vendido en la operación
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {vehicle.operacion.vehiculoVendido.marca}{" "}
                    {vehicle.operacion.vehiculoVendido.modelo}
                    {vehicle.operacion.vehiculoVendido.patente && (
                      <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs text-zinc-700">
                        {vehicle.operacion.vehiculoVendido.patente}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : vehicle.operacionId ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-zinc-600">
              Operación ID:{" "}
              <span className="font-mono font-medium text-zinc-900">
                {vehicle.operacionId}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm italic text-zinc-400">Sin operación asociada</p>
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-zinc-900">
        {value ?? "—"}
      </p>
    </div>
  );
}
