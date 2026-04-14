"use client";

import { useState, useEffect, useCallback } from "react";
import "material-symbols/outlined.css";

interface AgingData {
  dias0_30: number;
  dias31_60: number;
  dias60plus: number;
}

interface AgingDeudaChartProps {
  desde: string;
  hasta: string;
}

function formatPesos(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Mock data — reemplazar con fetch real cuando esté el endpoint
function fetchAgingData(_desde: string, _hasta: string): Promise<AgingData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        dias0_30: 500000,
        dias31_60: 200000,
        dias60plus: 80000,
      });
    }, 900);
  });
}

const SEGMENTS = [
  {
    key: "dias0_30" as keyof AgingData,
    label: "0–30 días",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    key: "dias31_60" as keyof AgingData,
    label: "31–60 días",
    bar: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  {
    key: "dias60plus" as keyof AgingData,
    label: "+60 días",
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-500",
  },
];

export function AgingDeudaChart({ desde, hasta }: AgingDeudaChartProps) {
  const [data, setData] = useState<AgingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchAgingData(desde, hasta);
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  const total = data ? data.dias0_30 + data.dias31_60 + data.dias60plus : 0;
  const isEmpty = !loading && !error && total === 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
          <span className="material-symbols-outlined text-xl text-amber-600">
            hourglass_bottom
          </span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Aging de deuda</h2>
          <p className="text-xs text-zinc-500">Distribución de la deuda pendiente por antigüedad</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" aria-label="Cargando" />
          <div className="flex gap-4">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">error</span>
          No se pudieron cargar los datos de aging.
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-400">
          <span className="material-symbols-outlined text-4xl">inbox</span>
          <p className="text-sm">Sin datos para el período seleccionado</p>
        </div>
      )}

      {!loading && !error && !isEmpty && data && (
        <div className="flex flex-col gap-5">
          {/* Stacked bar */}
          <div
            className="flex h-10 w-full overflow-hidden rounded-lg"
            role="img"
            aria-label="Barra de distribución de deuda por antigüedad"
          >
            {SEGMENTS.map((seg) => {
              const value = data[seg.key];
              const pct = total > 0 ? (value / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={seg.key}
                  className={`${seg.bar} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${seg.label}: ${formatPesos(value)}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {SEGMENTS.map((seg) => {
              const value = data[seg.key];
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
              return (
                <div key={seg.key} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full flex-shrink-0 ${seg.dot}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-700">{seg.label}</span>
                    <span className="text-xs text-zinc-500">
                      {formatPesos(value)}{" "}
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${seg.badge}`}>
                        {pct}%
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t border-zinc-100 pt-3">
            <p className="text-sm text-zinc-500">
              Total deuda:{" "}
              <span className="font-semibold text-zinc-900">{formatPesos(total)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
