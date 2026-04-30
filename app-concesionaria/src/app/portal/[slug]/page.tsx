"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { VehicleCarousel } from "@/components/portal/VehicleCarousel";
import { VehicleCard } from "@/components/portal/VehicleCard";
import "material-symbols/outlined.css";

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  version?: string | null;
  color?: string | null;
  kilometros?: number | null;
  categoria: string;
  patente?: string | null;
  notasGenerales?: string | null;
  fotoId?: string | null;
}

interface PortalData {
  empresa: { nombre: string; logo: string | null };
  vehicles: Vehicle[];
}

const CAROUSEL_COUNT = 6;

export default function PortalPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/portal/${slug}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        setData(json);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-5xl text-blue-600">
            progress_activity
          </span>
          <p className="text-sm text-zinc-500">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100">
          <span className="material-symbols-outlined text-5xl text-zinc-400">search_off</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Empresa no encontrada</h1>
        <p className="text-sm text-zinc-500">El portal que buscás no existe o no está disponible.</p>
      </div>
    );
  }

  const { empresa, vehicles } = data;
  const carouselVehicles = vehicles.slice(0, CAROUSEL_COUNT).map((v) => ({ ...v, slug }));
  const gridVehicles = vehicles.map((v) => ({ ...v, slug }));

  return (
    <PortalLayout empresaNombre={empresa.nombre} empresaLogo={empresa.logo}>
      <div className="flex flex-col gap-8">
        {/* Hero + Carousel */}
        {carouselVehicles.length > 0 ? (
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-0">
            {/* Hero section */}
            <div className="flex flex-col gap-4 lg:flex-1">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm text-white/60">directions_car</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Catálogo oficial</span>
              </div>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-6xl" style={{ color: "#ffffff" }}>
                {empresa.nombre}
              </h1>
              <p className="max-w-md text-base text-white/45 leading-relaxed">
                Explorá nuestro stock de vehículos disponibles. Encontrá tu próximo auto con toda la información que necesitás antes de visitar la concesionaria.
              </p>
              <p className="text-sm font-medium text-white/50">
                {vehicles.length} {vehicles.length === 1 ? "vehículo disponible" : "vehículos disponibles"}
              </p>
            </div>

            {/* Carousel */}
            <div className="flex w-full justify-center overflow-hidden py-6 lg:w-auto lg:flex-1 lg:justify-end lg:pr-16">
              <VehicleCarousel vehicles={carouselVehicles} />
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-white">{empresa.nombre}</h1>
            <p className="text-sm text-white/60">
              {vehicles.length} {vehicles.length === 1 ? "vehículo disponible" : "vehículos disponibles"}
            </p>
          </div>
        )}

        {/* Grid */}
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/20 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <span className="material-symbols-outlined text-4xl text-white/40">inventory_2</span>
            </div>
            <p className="text-base font-medium text-white/70">No hay vehículos en stock por el momento</p>
            <p className="text-sm text-white/40">Volvé a consultar pronto.</p>
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-base font-medium text-white/50 uppercase tracking-widest">Todo el stock</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gridVehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  id={v.id}
                  slug={slug}
                  marca={v.marca}
                  modelo={v.modelo}
                  anio={v.anio}
                  version={v.version}
                  color={v.color}
                  kilometros={v.kilometros}
                  categoria={v.categoria}
                  fotoId={v.fotoId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
