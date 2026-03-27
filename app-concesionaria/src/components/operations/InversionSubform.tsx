"use client";

import React, { useState, useRef, useEffect } from "react";
import { NumericInput } from "@/components/ui/NumericInput";
import "material-symbols/outlined.css";

export interface InversionParticipante {
  localId: string;
  esConcecionaria: boolean;
  nombre: string;
  inversorId?: string | null;
  montoAporte: string;
  porcentajeUtilidad: string;
}

interface InversionSubformProps {
  hayInversion: boolean;
  onToggle: (value: boolean) => void;
  participantes: InversionParticipante[];
  onParticipantesChange: (participantes: InversionParticipante[]) => void;
  disabled?: boolean;
  variant?: "card" | "inline";
}

function calcularPorcentajes(participantes: InversionParticipante[]): number[] {
  const montos = participantes.map((p) => parseFloat(p.montoAporte) || 0);
  const total = montos.reduce((acc, m) => acc + m, 0);
  if (total === 0) return participantes.map(() => 0);
  return montos.map((m) => (m / total) * 100);
}

interface InversorOption {
  id: string;
  nombre: string;
}

export function InversionSubform({
  hayInversion,
  onToggle,
  participantes,
  onParticipantesChange,
  disabled = false,
  variant = "card",
}: InversionSubformProps) {
  const [showAddInversor, setShowAddInversor] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InversorOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const porcentajes = calcularPorcentajes(participantes);
  const totalMontos = participantes.reduce(
    (acc, p) => acc + (parseFloat(p.montoAporte) || 0),
    0
  );

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar inversores con debounce
  useEffect(() => {
    if (!showAddInversor) return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/inversores?q=${encodeURIComponent(searchQuery)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.inversores ?? []);
          setShowDropdown(true);
        }
      } catch {
        // silencioso
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showAddInversor]);

  const handleToggle = () => {
    if (disabled) return;
    if (!hayInversion) {
      onParticipantesChange([
        {
          localId: "concesionaria",
          esConcecionaria: true,
          nombre: "Concesionaria",
          inversorId: null,
          montoAporte: "",
          porcentajeUtilidad: "",
        },
      ]);
    } else {
      onParticipantesChange([]);
      setShowAddInversor(false);
      setSearchQuery("");
      setShowDropdown(false);
    }
    onToggle(!hayInversion);
  };

  const handleMontoChange = (localId: string, value: string) => {
    onParticipantesChange(
      participantes.map((p) =>
        p.localId === localId ? { ...p, montoAporte: value } : p
      )
    );
  };

  const handleUtilidadChange = (localId: string, value: string) => {
    const num = parseFloat(value);
    const clamped =
      value === "" ? "" : isNaN(num) ? "" : String(Math.min(100, Math.max(0, num)));
    onParticipantesChange(
      participantes.map((p) =>
        p.localId === localId ? { ...p, porcentajeUtilidad: clamped } : p
      )
    );
  };

  const handleRemove = (localId: string) => {
    onParticipantesChange(participantes.filter((p) => p.localId !== localId));
  };

  const handleSelectInversor = (inversor: InversorOption) => {
    const yaExiste = participantes.some((p) => p.inversorId === inversor.id);
    if (!yaExiste) {
      onParticipantesChange([
        ...participantes,
        {
          localId: inversor.id,
          esConcecionaria: false,
          nombre: inversor.nombre,
          inversorId: inversor.id,
          montoAporte: "",
          porcentajeUtilidad: "",
        },
      ]);
    }
    setShowAddInversor(false);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleCreateInversor = async () => {
    const nombre = searchQuery.trim();
    if (!nombre) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/inversores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (res.ok) {
        const data = await res.json();
        handleSelectInversor(data.inversor);
      }
    } catch {
      // silencioso
    } finally {
      setIsCreating(false);
    }
  };

  const formatPorcentaje = (idx: number): string => {
    if (totalMontos === 0) return "—";
    return `${porcentajes[idx].toFixed(2).replace(".", ",")}%`;
  };

  // Inversores ya agregados (para excluirlos del dropdown)
  const inversorIdsAgregados = new Set(
    participantes.filter((p) => p.inversorId).map((p) => p.inversorId as string)
  );
  const resultadosFiltrados = searchResults.filter(
    (r) => !inversorIdsAgregados.has(r.id)
  );
  const puedeCrear =
    searchQuery.trim().length > 0 &&
    !resultadosFiltrados.some(
      (r) => r.nombre.toLowerCase() === searchQuery.trim().toLowerCase()
    );

  const content = (
    <>
      {/* Header */}
      <div className={`flex items-center gap-2 ${variant === "inline" ? "border-t border-zinc-200 pt-4 mt-2 mb-4" : "mb-4 border-b border-zinc-200 pb-3"}`}>
        <span className="material-symbols-outlined text-2xl text-purple-600">
          group
        </span>
        <h2 className="text-lg font-semibold text-zinc-900">Inversión</h2>
      </div>

      {/* Toggle row */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-zinc-900">
            ¿Hay inversión en esta operación?
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {hayInversion
              ? "Completá los aportes de cada participante"
              : "Activá para registrar inversores y sus participaciones"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          role="switch"
          aria-checked={hayInversion}
          aria-label="Activar inversión en esta operación"
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            hayInversion ? "bg-purple-600" : "bg-zinc-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              hayInversion ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Subform */}
      {hayInversion && (
        <div className="mt-5 flex flex-col gap-3">
          {/* Column headers — visible en sm+ */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_160px_110px_160px_48px] sm:gap-3 sm:px-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Participante
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Monto de aporte
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Participación
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              % Utilidad (opc.)
            </span>
            <span />
          </div>

          {/* Participant rows */}
          {participantes.map((p, idx) => (
            <div
              key={p.localId}
              className={`rounded-lg border bg-zinc-50 p-4 sm:grid sm:grid-cols-[1fr_160px_110px_160px_48px] sm:items-center sm:gap-3 sm:rounded-lg sm:p-2 sm:pl-3 ${
                p.esConcecionaria
                  ? "border-blue-200 bg-blue-50/40"
                  : "border-zinc-200"
              }`}
            >
              {/* Nombre */}
              <div className="mb-3 flex items-center gap-2 sm:mb-0 sm:min-w-0">
                <span className="material-symbols-outlined shrink-0 text-lg text-zinc-400">
                  {p.esConcecionaria ? "store" : "person"}
                </span>
                <span className="truncate text-sm font-medium text-zinc-900">
                  {p.nombre}
                </span>
                {p.esConcecionaria && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Concesionaria
                  </span>
                )}
              </div>

              {/* Monto de aporte */}
              <div className="mb-3 flex flex-col gap-1 sm:mb-0">
                <span className="text-xs text-zinc-500 sm:hidden">
                  Monto de aporte
                </span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-zinc-400">
                    attach_money
                  </span>
                  <NumericInput
                    value={p.montoAporte}
                    onChange={(v) => handleMontoChange(p.localId, v)}
                    placeholder="0"
                    disabled={disabled}
                    aria-label={`Monto de aporte de ${p.nombre}`}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-zinc-100 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* % Participación (read-only) */}
              <div className="mb-3 flex flex-col gap-1 sm:mb-0">
                <span className="text-xs text-zinc-500 sm:hidden">
                  Participación
                </span>
                <div
                  className={`flex h-10 items-center justify-center rounded-lg border px-2 text-sm font-semibold ${
                    totalMontos > 0
                      ? "border-purple-200 bg-purple-50 text-purple-700"
                      : "border-zinc-200 bg-zinc-100 text-zinc-400"
                  }`}
                  aria-label={`Porcentaje de participación de ${p.nombre}`}
                >
                  {formatPorcentaje(idx)}
                </div>
              </div>

              {/* % Utilidad (opcional) */}
              <div className="mb-3 flex flex-col gap-1 sm:mb-0">
                <span className="text-xs text-zinc-500 sm:hidden">
                  % Utilidad (opc.)
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={p.porcentajeUtilidad}
                    onChange={(e) =>
                      handleUtilidadChange(p.localId, e.target.value)
                    }
                    placeholder="—"
                    disabled={disabled}
                    aria-label={`Porcentaje de utilidad de ${p.nombre}`}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 pr-7 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-zinc-100 disabled:opacity-60"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                    %
                  </span>
                </div>
              </div>

              {/* Botón quitar */}
              <div className="flex justify-end sm:justify-center">
                {!p.esConcecionaria ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(p.localId)}
                    disabled={disabled}
                    aria-label={`Quitar a ${p.nombre}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">
                      person_remove
                    </span>
                  </button>
                ) : (
                  <div className="h-9 w-9" aria-hidden="true" />
                )}
              </div>
            </div>
          ))}

          {/* Buscador de inversores */}
          {!disabled && (
            <div className="mt-1 flex flex-col gap-2">
              {showAddInversor ? (
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                      search
                    </span>
                    {isSearching && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                        …
                      </span>
                    )}
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Buscar inversor por nombre..."
                      aria-label="Buscar inversor"
                      autoFocus
                      className="h-11 w-full rounded-lg border border-purple-300 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    {/* Dropdown */}
                    {showDropdown && (resultadosFiltrados.length > 0 || puedeCrear) && (
                      <div
                        ref={dropdownRef}
                        className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg"
                      >
                        {resultadosFiltrados.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onMouseDown={() => handleSelectInversor(r)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-800 hover:bg-purple-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            <span className="material-symbols-outlined text-base text-zinc-400">
                              person
                            </span>
                            {r.nombre}
                          </button>
                        ))}
                        {puedeCrear && (
                          <button
                            type="button"
                            onMouseDown={handleCreateInversor}
                            disabled={isCreating}
                            className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-2.5 text-left text-sm font-medium text-purple-700 hover:bg-purple-50 last:rounded-b-lg disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">
                              person_add
                            </span>
                            {isCreating ? "Creando..." : `Crear "${searchQuery.trim()}"`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddInversor(false);
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    aria-label="Cancelar"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    <span className="material-symbols-outlined text-xl">
                      close
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddInversor(true);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-purple-300 bg-purple-50/60 px-4 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                >
                  <span className="material-symbols-outlined text-xl">
                    person_add
                  </span>
                  Agregar inversor
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
      {content}
    </div>
  );
}
