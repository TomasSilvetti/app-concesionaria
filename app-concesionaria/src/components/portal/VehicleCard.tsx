import React from "react";
import "material-symbols/outlined.css";

interface VehicleCardProps {
  id: string;
  slug: string;
  marca: string;
  modelo: string;
  anio: number;
  version?: string | null;
  color?: string | null;
  kilometros?: number | null;
  categoria: string;
  fotoId?: string | null;
}

export function VehicleCard({
  id,
  slug,
  marca,
  modelo,
  anio,
  version,
  color,
  kilometros,
  categoria,
  fotoId,
}: VehicleCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:bg-white/8 hover:-translate-y-0.5 hover:border-white/20">
      {/* Photo */}
      <div className="relative h-48 w-full overflow-hidden bg-white/5">
        {fotoId ? (
          <img
            src={`/api/portal/${slug}/photos/${fotoId}?thumb=true`}
            alt={`${marca} ${modelo}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5">
            <span className="material-symbols-outlined text-5xl text-white/20">directions_car</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/80 ring-1 ring-white/20 backdrop-blur-sm">
            Disponible
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">{marca}</p>
          <h3 className="text-base font-semibold text-white">
            {modelo} {version && <span className="font-normal text-white/50">{version}</span>}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-white/60 ring-1 ring-white/10">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {anio}
          </span>
          {kilometros != null && (
            <span className="flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-white/60 ring-1 ring-white/10">
              <span className="material-symbols-outlined text-sm">speed</span>
              {kilometros.toLocaleString("es-AR")} km
            </span>
          )}
          {color && (
            <span className="flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-white/60 ring-1 ring-white/10">
              <span className="material-symbols-outlined text-sm">palette</span>
              {color}
            </span>
          )}
        </div>

        {categoria && (
          <p className="text-xs text-white/30">{categoria}</p>
        )}
      </div>
    </div>
  );
}
