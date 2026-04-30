"use client";

import React, { useEffect, useState } from "react";
import CardSwap, { Card } from "./CardSwap";
import "material-symbols/outlined.css";

function useResponsiveCard() {
  const [dims, setDims] = useState({ w: 560, h: 400 });
  useEffect(() => {
    function update() {
      const vw = window.innerWidth;
      if (vw < 480) setDims({ w: Math.min(vw - 32, 340), h: 280 });
      else if (vw < 768) setDims({ w: Math.min(vw - 48, 440), h: 320 });
      else setDims({ w: 560, h: 400 });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return dims;
}

interface CarouselVehicle {
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

interface VehicleCarouselProps {
  vehicles: CarouselVehicle[];
}

export function VehicleCarousel({ vehicles }: VehicleCarouselProps) {
  const { w: CARD_W, h: CARD_H } = useResponsiveCard();

  if (vehicles.length === 0) return null;

  return (
    <div className="relative flex items-center justify-center" style={{ height: CARD_H + 100, width: CARD_W }}>
      <CardSwap
        width={CARD_W}
        height={CARD_H}
        cardDistance={65}
        verticalDistance={20}
        delay={3500}
        pauseOnHover
        easing="elastic"
        skewAmount={3}
      >
        {vehicles.map((v) => (
          <Card key={v.id} customClass="bg-[#0d0d0d] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            {/* Navbar superior */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <span className="material-symbols-outlined text-sm text-white/70">
                    directions_car
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 leading-none">
                    {v.marca}
                  </p>
                  <p className="text-sm font-bold text-white leading-tight">
                    {v.modelo}
                    {v.version && (
                      <span className="ml-1 text-xs font-normal text-white/60">{v.version}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80 ring-1 ring-white/10">
                  {v.anio}
                </span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60 ring-1 ring-white/15 capitalize">
                  {v.categoria}
                </span>
              </div>
            </div>

            {/* Photo background */}
            <div className="absolute inset-0">
              {v.fotoId ? (
                <img
                  src={`/api/portal/${v.slug}/photos/${v.fotoId}`}
                  alt={`${v.marca} ${v.modelo}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                  <span className="material-symbols-outlined text-8xl text-zinc-700">
                    directions_car
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/40" />
            </div>

            {/* Footer con info */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-end justify-between">
                <div className="flex flex-wrap gap-2">
                  {v.kilometros != null && (
                    <div className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/10">
                      <span className="material-symbols-outlined text-sm text-white/60">speed</span>
                      <span className="text-xs font-semibold text-white">
                        {v.kilometros.toLocaleString("es-AR")} km
                      </span>
                    </div>
                  )}
                  {v.color && (
                    <div className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/10">
                      <span className="material-symbols-outlined text-sm text-white/60">palette</span>
                      <span className="text-xs font-semibold text-white">{v.color}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/20">
                  <span className="material-symbols-outlined text-sm text-white">arrow_forward</span>
                  <span className="text-xs font-semibold text-white">Ver detalle</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </CardSwap>
    </div>
  );
}
