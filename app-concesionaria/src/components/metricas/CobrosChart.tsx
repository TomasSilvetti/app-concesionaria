"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "material-symbols/outlined.css";

interface CobrosPorMetodo {
  metodo: string;
  total: number;
}

interface CobrosChartProps {
  desde: string;
  hasta: string;
}

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
];

function formatMonto(value: number): string {
  return "$" + value.toLocaleString("es-AR");
}

async function fetchCobrosData(desde: string, hasta: string): Promise<CobrosPorMetodo[]> {
  const res = await fetch(`/api/cliente/metricas/cobros-por-metodo?desde=${desde}&hasta=${hasta}`);
  if (!res.ok) throw new Error("Error al obtener cobros");
  return res.json();
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: { porcentaje: number } }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-700">{item.name}</p>
      <p className="text-zinc-600">
        {formatMonto(item.value)}{" "}
        <span className="text-zinc-400">({item.payload.porcentaje}%)</span>
      </p>
    </div>
  );
}

interface CustomLegendProps {
  payload?: { value: string; color: string }[];
  data: (CobrosPorMetodo & { porcentaje: number })[];
}

function CustomLegend({ payload, data }: CustomLegendProps) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-col gap-1.5 mt-2">
      {payload.map((entry, i) => {
        const item = data[i];
        return (
          <li key={entry.value} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-700">{entry.value}</span>
            </span>
            <span className="text-zinc-500 text-xs tabular-nums">
              {formatMonto(item.total)}{" "}
              <span className="text-zinc-400">({item.porcentaje}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function CobrosChart({ desde, hasta }: CobrosChartProps) {
  const [data, setData] = useState<(CobrosPorMetodo & { porcentaje: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchCobrosData(desde, hasta);
      const total = result.reduce((acc, r) => acc + r.total, 0);
      const enriched = result.map((r) => ({
        ...r,
        porcentaje: total > 0 ? Math.round((r.total / total) * 100) : 0,
      }));
      setData(enriched);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  const isEmpty = !loading && !error && data.length === 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
          <span className="material-symbols-outlined text-xl text-emerald-600">
            payments
          </span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Cobros por método de pago
          </h2>
          <p className="text-xs text-zinc-500">
            Distribución del monto total cobrado según método en el período
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="h-48 w-48 animate-pulse rounded-full bg-zinc-200 flex-shrink-0" aria-label="Cargando" />
          <div className="flex flex-col gap-2 w-full max-w-xs pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 animate-pulse flex-shrink-0" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">error</span>
          No se pudieron cargar los datos de cobros.
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-400">
          <span className="material-symbols-outlined text-4xl">pie_chart</span>
          <p className="text-sm">Sin datos para el período seleccionado</p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="w-full max-w-[220px] flex-shrink-0">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="metodo"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full">
            <Legend content={<CustomLegend data={data} />} />
          </div>
        </div>
      )}
    </div>
  );
}
