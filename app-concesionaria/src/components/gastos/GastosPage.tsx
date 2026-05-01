"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, subMonths, subWeeks, subYears } from "date-fns";
import "material-symbols/outlined.css";
import { GastosCharts } from "./GastosCharts";
import { GastosTabla } from "./GastosTabla";

interface DetalleItem {
  id: string | number;
  monto: number;
  fecha: string | null;
  descripcion: string;
}

interface DetalleOpCerrada {
  id: string;
  descripcion: string;
  precioVenta: number;
  precioToma: number;
  neto: number;
  fecha: string | null;
}

interface DesgloseCaja {
  ingresosPorOps: number;
  ingresosExtraordinarios: number;
  egresos: number;
}

interface DetalleCaja {
  operacionesCerradas: DetalleOpCerrada[];
  ingresosExtraordinarios: DetalleItem[];
  egresos: DetalleItem[];
}

interface Metricas {
  cajaDinero: number;
  desgloseCaja: DesgloseCaja;
  detalleCaja: DetalleCaja;
  plataPorCobrar: number;
}

interface KpiData {
  ticketPromedio: number | null;
  tasaConversion: number | null;
  capitalStock: number | null;
}

function formatPesos(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

type Preset = "semana" | "mes_actual" | "mes" | "anio" | "custom";

function getPresetRange(preset: Preset): { desde: string; hasta: string } {
  const today = new Date();
  switch (preset) {
    case "semana":
      return {
        desde: format(subWeeks(today, 1), "yyyy-MM-dd"),
        hasta: format(today, "yyyy-MM-dd"),
      };
    case "mes_actual":
      return {
        desde: format(startOfMonth(today), "yyyy-MM-dd"),
        hasta: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "mes": {
      const lastMonth = subMonths(today, 1);
      return {
        desde: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        hasta: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      };
    }
    case "anio":
      return {
        desde: format(subYears(today, 1), "yyyy-MM-dd"),
        hasta: format(today, "yyyy-MM-dd"),
      };
    default:
      return {
        desde: format(startOfMonth(today), "yyyy-MM-dd"),
        hasta: format(endOfMonth(today), "yyyy-MM-dd"),
      };
  }
}

function getDefaultPeriod() {
  const today = new Date();
  return {
    desde: format(startOfMonth(today), "yyyy-MM-dd"),
    hasta: format(endOfMonth(today), "yyyy-MM-dd"),
  };
}

export function GastosPage() {
  const defaultPeriod = getDefaultPeriod();
  const [preset, setPreset] = useState<Preset>("custom");
  const [desde, setDesde] = useState(defaultPeriod.desde);
  const [hasta, setHasta] = useState(defaultPeriod.hasta);

  const handlePresetChange = (value: Preset) => {
    setPreset(value);
    if (value !== "custom") {
      const range = getPresetRange(value);
      setDesde(range.desde);
      setHasta(range.hasta);
    }
  };

  const [metricasGlobales, setMetricasGlobales] = useState<Metricas | null>(null);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [kpisGlobales, setKpisGlobales] = useState<Pick<KpiData, "capitalStock"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGlobales, setLoadingGlobales] = useState(true);
  const [error, setError] = useState("");

  const fetchMetricas = useCallback(async (d: string, h: string) => {
    try {
      setLoading(true);
      setError("");
      const kpisRes = await fetch(`/api/cliente/metricas/kpis?desde=${d}&hasta=${h}`);
      if (kpisRes.ok) {
        const kpisData = await kpisRes.json();
        setKpis(kpisData);
      }
    } catch {
      setError("No se pudieron cargar las métricas de gastos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetricas(desde, hasta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMetricas]);

  useEffect(() => {
    const hoy = format(new Date(), "yyyy-MM-dd");
    Promise.all([
      fetch(`/api/gastos/metricas?desde=2000-01-01&hasta=${hoy}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/cliente/metricas/kpis?desde=2000-01-01&hasta=${hoy}`).then((r) => r.ok ? r.json() : null),
    ]).then(([gastosData, kpisData]) => {
      if (gastosData) setMetricasGlobales(gastosData);
      if (kpisData) setKpisGlobales(kpisData);
    }).finally(() => setLoadingGlobales(false));
  }, []);

  const handleActualizar = () => {
    fetchMetricas(desde, hasta);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
          <span className="material-symbols-outlined text-3xl text-white">
            receipt_long
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Finanzas</h1>
          <p className="text-sm text-zinc-500">
            Gestión detallada de egresos y rentabilidad de inventario.
          </p>
        </div>
      </div>

      {/* Sección actualidad */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-zinc-400">radio_button_checked</span>
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Actualidad — refleja el estado al día de hoy
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CajaFuerteCard
            value={metricasGlobales?.cajaDinero ?? null}
            desglose={metricasGlobales?.desgloseCaja ?? null}
            detalle={metricasGlobales?.detalleCaja ?? null}
            loading={loadingGlobales}
          />
          <MetricCard
            label="Plata por cobrar (ops. abiertas)"
            value={metricasGlobales?.plataPorCobrar ?? null}
            loading={loadingGlobales}
            icon="pending_actions"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
          <MetricCard
            label="Capital inmovilizado en stock"
            value={kpisGlobales?.capitalStock ?? null}
            loading={loadingGlobales}
            icon="inventory_2"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
        </div>
      </div>

      {/* Separador + Selector de período */}
      <div className="flex flex-col gap-4 border-t border-zinc-200 pt-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-zinc-400">date_range</span>
            <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Por período — métricas, gráficos y movimientos filtrados
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Período
              </label>
              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value as Preset)}
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="custom">Personalizado</option>
                <option value="semana">Última semana</option>
                <option value="mes_actual">Mes actual</option>
                <option value="mes">Último mes</option>
                <option value="anio">Último año</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="gastos-desde"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                Desde
              </label>
              <input
                id="gastos-desde"
                type="date"
                value={desde}
                onChange={(e) => { setDesde(e.target.value); setPreset("custom"); }}
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Fecha desde"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="gastos-hasta"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                Hasta
              </label>
              <input
                id="gastos-hasta"
                type="date"
                value={hasta}
                onChange={(e) => { setHasta(e.target.value); setPreset("custom"); }}
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Fecha hasta"
              />
            </div>
            <button
              type="button"
              onClick={handleActualizar}
              className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-xl">filter_list</span>
              Actualizar
            </button>
          </div>
        </div>

        {/* Tarjetas filtradas por período */}
        {error ? (
          <div
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            <span className="material-symbols-outlined text-xl text-red-500">error</span>
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Ticket promedio de venta"
              value={kpis?.ticketPromedio ?? null}
              loading={loading}
              icon="sell"
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <MetricCard
              label="Tasa de conversión"
              value={kpis?.tasaConversion ?? null}
              loading={loading}
              icon="conversion_path"
              iconBg="bg-violet-100"
              iconColor="text-violet-600"
              format="percent"
            />
          </div>
        )}
      </div>

      {/* Gráficos */}
      <GastosCharts desde={desde} hasta={hasta} />

      {/* Tabla de gastos */}
      <GastosTabla desde={desde} hasta={hasta} />
    </div>
  );
}

// ─── CajaFuerteCard ───────────────────────────────────────────────────────────

interface CajaFuerteCardProps {
  value: number | null;
  desglose: DesgloseCaja | null;
  detalle: DetalleCaja | null;
  loading: boolean;
}

function CajaFuerteCard({ value, desglose, detalle, loading }: CajaFuerteCardProps) {
  const [open, setOpen] = useState(false);
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);

  const toggleSeccion = (key: string) =>
    setSeccionAbierta((prev) => (prev === key ? null : key));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-l-4 border-blue-500 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <span className="material-symbols-outlined text-xl text-blue-600">lock</span>
        </div>
        {!loading && desglose && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-200"
            aria-expanded={open}
          >
            <span className="material-symbols-outlined text-sm">
              {open ? "expand_less" : "expand_more"}
            </span>
            Desglose
          </button>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500">Caja Empresa (dinero liquido)</p>
        {loading ? (
          <div className="mt-1.5 h-8 w-36 animate-pulse rounded-lg bg-zinc-200" aria-label="Cargando" />
        ) : (
          <p className="text-2xl font-bold text-blue-600">
            {value != null ? formatPesos(value) : "$—"}
          </p>
        )}
      </div>
      {open && desglose && detalle && (
        <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-3">
          {/* Ingresos por operaciones cerradas */}
          <OpsCerradasSeccion
            label="Ops. cerradas (neto)"
            value={desglose.ingresosPorOps}
            items={detalle.operacionesCerradas}
            abierta={seccionAbierta === "ops"}
            onToggle={() => toggleSeccion("ops")}
          />
          {/* Ingresos extraordinarios */}
          {desglose.ingresosExtraordinarios > 0 && (
            <DesgloseSeccion
              label="Ingresos extraordinarios"
              value={desglose.ingresosExtraordinarios}
              items={detalle.ingresosExtraordinarios}
              abierta={seccionAbierta === "ingresos"}
              onToggle={() => toggleSeccion("ingresos")}
            />
          )}
          {/* Egresos */}
          {desglose.egresos > 0 && (
            <DesgloseSeccion
              label="Egresos"
              value={-desglose.egresos}
              items={detalle.egresos}
              abierta={seccionAbierta === "egresos"}
              onToggle={() => toggleSeccion("egresos")}
              negativo
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── OpsCerradasSeccion ───────────────────────────────────────────────────────

interface OpsCerradasSeccionProps {
  label: string;
  value: number;
  items: DetalleOpCerrada[];
  abierta: boolean;
  onToggle: () => void;
}

function OpsCerradasSeccion({ label, value, items, abierta, onToggle }: OpsCerradasSeccionProps) {
  const hasItems = items.length > 0;
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={hasItems ? onToggle : undefined}
        className={`flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left transition-colors ${hasItems ? "cursor-pointer hover:bg-zinc-50" : "cursor-default"}`}
      >
        <div className="flex items-center gap-1">
          {hasItems && (
            <span className="material-symbols-outlined text-[13px] text-zinc-400">
              {abierta ? "expand_less" : "chevron_right"}
            </span>
          )}
          <span className="text-xs text-zinc-500">{label}</span>
        </div>
        <span className="text-xs font-semibold text-emerald-700">{formatPesos(value)}</span>
      </button>
      {abierta && hasItems && (
        <div className="ml-4 flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-2">
          {items.map((op) => (
            <div key={op.id} className="flex items-start justify-between gap-2 py-0.5">
              <div className="flex flex-col">
                <span className="text-[11px] text-zinc-600 leading-tight">{op.descripcion}</span>
                <span className="text-[10px] text-zinc-400">
                  Venta {formatPesos(op.precioVenta)}
                  {op.precioToma > 0 ? ` — Toma ${formatPesos(op.precioToma)}` : ""}
                </span>
                {op.fecha && (
                  <span className="text-[10px] text-zinc-400">
                    {new Date(op.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-emerald-700">{formatPesos(op.neto)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DesgloseSeccion ──────────────────────────────────────────────────────────

interface DesgloseSeccionProps {
  label: string;
  value: number;
  items: DetalleItem[];
  abierta: boolean;
  onToggle: () => void;
  negativo?: boolean;
}

function DesgloseSeccion({ label, value, items, abierta, onToggle, negativo }: DesgloseSeccionProps) {
  const hasItems = items && items.length > 0;
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={hasItems ? onToggle : undefined}
        className={`flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left transition-colors ${hasItems ? "cursor-pointer hover:bg-zinc-50" : "cursor-default"}`}
      >
        <div className="flex items-center gap-1">
          {hasItems && (
            <span className="material-symbols-outlined text-[13px] text-zinc-400">
              {abierta ? "expand_less" : "chevron_right"}
            </span>
          )}
          <span className="text-xs text-zinc-500">{label}</span>
        </div>
        <span className={`text-xs font-semibold ${negativo ? "text-red-600" : "text-zinc-700"}`}>
          {formatPesos(value)}
        </span>
      </button>
      {abierta && hasItems && (
        <div className="ml-4 flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2 py-0.5">
              <div className="flex flex-col">
                <span className="text-[11px] text-zinc-600 leading-tight">{item.descripcion}</span>
                {item.fecha && (
                  <span className="text-[10px] text-zinc-400">
                    {new Date(item.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                )}
              </div>
              <span className={`shrink-0 text-[11px] font-semibold ${negativo ? "text-red-600" : "text-zinc-700"}`}>
                {formatPesos(item.monto)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number | null;
  loading: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
  badge?: string;
  format?: "pesos" | "percent";
}

function MetricCard({
  label,
  value,
  loading,
  icon,
  iconBg,
  iconColor,
  highlight,
  badge,
  format = "pesos",
}: MetricCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm ${
        highlight ? "border-l-4 border-blue-500" : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          <span className={`material-symbols-outlined text-xl ${iconColor}`}>
            {icon}
          </span>
        </div>
        {badge && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        {loading ? (
          <div
            className="mt-1.5 h-8 w-36 animate-pulse rounded-lg bg-zinc-200"
            aria-label="Cargando"
          />
        ) : (
          <p
            className={`text-2xl font-bold ${
              highlight ? "text-blue-600" : "text-zinc-900"
            }`}
          >
            {value != null
              ? format === "percent"
                ? `${value}%`
                : formatPesos(value)
              : format === "percent" ? "—" : "$—"}
          </p>
        )}
      </div>
    </div>
  );
}
