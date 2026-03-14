"use client";

import React, { useState, useEffect } from "react";
import "material-symbols/outlined.css";

interface VehicleBrand {
  id: string;
  nombre: string;
}

interface VehicleCategory {
  id: string;
  nombre: string;
}

export interface StockFilters {
  marcaId?: string;
  categoriaId?: string;
  precioMin?: number;
  precioMax?: number;
  anio?: number;
  kilometrosMax?: number;
}

interface StockFiltersProps {
  onApplyFilters: (filters: StockFilters) => void;
  onClearFilters: () => void;
}

export function StockFilters({
  onApplyFilters,
  onClearFilters,
}: StockFiltersProps) {
  const [marcaId, setMarcaId] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [precioMin, setPrecioMin] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");
  const [anio, setAnio] = useState<string>("");
  const [kilometrosMax, setKilometrosMax] = useState<string>("");

  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${baseUrl}/api/vehicle-brands`);
        if (res.ok) {
          const data = await res.json();
          setBrands(data.brands ?? data ?? []);
        } else {
          setBrands([]);
        }
      } catch {
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${baseUrl}/api/vehicle-categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories ?? data ?? []);
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchBrands();
    fetchCategories();
  }, []);

  const hasActiveFilters =
    marcaId !== "" ||
    categoriaId !== "" ||
    precioMin !== "" ||
    precioMax !== "" ||
    anio !== "" ||
    kilometrosMax !== "";

  const handleApplyFilters = () => {
    const filters: StockFilters = {};

    if (marcaId) filters.marcaId = marcaId;
    if (categoriaId) filters.categoriaId = categoriaId;
    if (precioMin) filters.precioMin = parseFloat(precioMin);
    if (precioMax) filters.precioMax = parseFloat(precioMax);
    if (anio) filters.anio = parseInt(anio, 10);
    if (kilometrosMax) filters.kilometrosMax = parseFloat(kilometrosMax);

    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setMarcaId("");
    setCategoriaId("");
    setPrecioMin("");
    setPrecioMax("");
    setAnio("");
    setKilometrosMax("");
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (marcaId) count++;
    if (categoriaId) count++;
    if (precioMin || precioMax) count++;
    if (anio) count++;
    if (kilometrosMax) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="marca" className="text-sm font-medium text-zinc-700">
            Marca
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              directions_car
            </span>
            <select
              id="marca"
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              disabled={brandsLoading}
            >
              <option value="">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.nombre}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              expand_more
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="categoria" className="text-sm font-medium text-zinc-700">
            Categoría
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              category
            </span>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              disabled={categoriesLoading}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              expand_more
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="precioMin" className="text-sm font-medium text-zinc-700">
            Precio mínimo
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              attach_money
            </span>
            <input
              id="precioMin"
              type="number"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="precioMax" className="text-sm font-medium text-zinc-700">
            Precio máximo
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              attach_money
            </span>
            <input
              id="precioMax"
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              placeholder="999999999"
              min="0"
              step="1000"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="anio" className="text-sm font-medium text-zinc-700">
            Año
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              calendar_today
            </span>
            <input
              id="anio"
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="2024"
              min="1900"
              max="2100"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="kilometrosMax" className="text-sm font-medium text-zinc-700">
            Kilómetros máximos
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
              speed
            </span>
            <input
              id="kilometrosMax"
              type="number"
              value={kilometrosMax}
              onChange={(e) => setKilometrosMax(e.target.value)}
              placeholder="200000"
              min="0"
              step="1000"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {activeFiltersCount > 0 && (
            <>
              <span className="text-sm font-medium text-zinc-700">
                Filtros activos:
              </span>
              {marcaId && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    directions_car
                  </span>
                  {brands.find((b) => b.id === marcaId)?.nombre ?? "Marca"}
                </span>
              )}
              {categoriaId && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    category
                  </span>
                  {categories.find((c) => c.id === categoriaId)?.nombre ?? "Categoría"}
                </span>
              )}
              {(precioMin || precioMax) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    attach_money
                  </span>
                  {precioMin && precioMax
                    ? `$${precioMin} - $${precioMax}`
                    : precioMin
                    ? `Desde $${precioMin}`
                    : `Hasta $${precioMax}`}
                </span>
              )}
              {anio && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    calendar_today
                  </span>
                  Año {anio}
                </span>
              )}
              {kilometrosMax && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span className="material-symbols-outlined text-sm">
                    speed
                  </span>
                  Hasta {kilometrosMax} km
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
            aria-label="Limpiar filtros"
          >
            <span className="material-symbols-outlined text-xl">
              filter_alt_off
            </span>
            Limpiar filtros
          </button>

          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={!hasActiveFilters}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
            aria-label="Aplicar filtros"
          >
            <span className="material-symbols-outlined text-xl">
              filter_alt
            </span>
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
