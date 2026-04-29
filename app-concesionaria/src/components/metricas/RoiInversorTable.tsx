"use client";

import { useState, useEffect, useCallback } from "react";
import "material-symbols/outlined.css";

interface RoiInversor {
  inversor: string;
  montoAportado: number;
  retorno: number;
  roi: number;
}

interface RoiInversorTableProps {
  desde: string;
  hasta: string;
}

function formatMonto(value: number): string {
  return "$" + value.toLocaleString("es-AR");
}

function formatRoi(value: number): string {
  return value.toFixed(2) + "%";
}

async function fetchRoiData(desde: string, hasta: string): Promise<RoiInversor[]> {
  const res = await fetch(`/api/cliente/metricas/roi-inversores?desde=${desde}&hasta=${hasta}`);
  if (!res.ok) throw new Error("Error al obtener ROI");
  return res.json();
}

export function RoiInversorTable({ desde, hasta }: RoiInversorTableProps) {
  const [data, setData] = useState<RoiInversor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchRoiData(desde, hasta);
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
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
          <span className="material-symbols-outlined text-xl text-violet-600">
            groups
          </span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">ROI por inversor</h2>
          <p className="text-xs text-zinc-500">
            Retorno sobre la inversión por cada inversor en el período
          </p>
        </div>
      </div>

      {loading && (
        <div className="overflow-hidden rounded-lg border border-zinc-100" aria-label="Cargando">
          <div className="grid grid-cols-4 gap-4 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-zinc-200" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 border-b border-zinc-100 px-4 py-3 last:border-0">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 animate-pulse rounded bg-zinc-100" />
              ))}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">error</span>
          No se pudieron cargar los datos de ROI.
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-400">
          <span className="material-symbols-outlined text-4xl">group_off</span>
          <p className="text-sm">No hay inversiones registradas en este período</p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 font-semibold text-zinc-300 text-xs uppercase tracking-wider rounded-tl-lg">
                  Inversor
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-300 text-xs uppercase tracking-wider text-right">
                  Monto Aportado
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-300  text-xs uppercase tracking-wider text-right">
                  Retorno
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-300 text-xs uppercase tracking-wider text-right rounded-tr-lg">
                  ROI%
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {row.inversor}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700">
                    {formatMonto(row.montoAportado)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600 font-medium">
                    {formatMonto(row.retorno)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                      {formatRoi(row.roi)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
