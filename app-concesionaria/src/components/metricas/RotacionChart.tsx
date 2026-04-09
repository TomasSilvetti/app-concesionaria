"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "material-symbols/outlined.css";

interface RotacionPoint {
  mes: string;
  indice: number;
}

interface RotacionChartProps {
  desde: string;
  hasta: string;
}

// Mock data — reemplazar con fetch real cuando esté el endpoint
function fetchRotacionData(_desde: string, _hasta: string): Promise<RotacionPoint[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { mes: "Nov 2025", indice: 0.42 },
        { mes: "Dic 2025", indice: 0.38 },
        { mes: "Ene 2026", indice: 0.51 },
        { mes: "Feb 2026", indice: 0.47 },
        { mes: "Mar 2026", indice: 0.63 },
        { mes: "Abr 2026", indice: 0.58 },
      ]);
    }, 700);
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-700">{label}</p>
      <p className="text-blue-600">
        Índice:{" "}
        <span className="font-bold">{payload[0].value.toFixed(2)}</span>
      </p>
    </div>
  );
}

export function RotacionChart({ desde, hasta }: RotacionChartProps) {
  const [data, setData] = useState<RotacionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchRotacionData(desde, hasta);
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

  const isEmpty = !loading && !error && data.length === 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
          <span className="material-symbols-outlined text-xl text-blue-600">
            autorenew
          </span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Rotación mensual</h2>
          <p className="text-xs text-zinc-500">
            Ratio entre operaciones cerradas y stock disponible, mes a mes
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          <div className="h-48 w-full animate-pulse rounded-lg bg-zinc-200" aria-label="Cargando" />
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">error</span>
          No se pudieron cargar los datos de rotación.
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-400">
          <span className="material-symbols-outlined text-4xl">show_chart</span>
          <p className="text-sm">Sin datos para el período seleccionado</p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(2)}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="indice"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#1d4ed8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
