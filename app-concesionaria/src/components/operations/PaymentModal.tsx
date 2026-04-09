"use client";

import { useEffect, useRef, useState } from "react";
import { NumericInput } from "@/components/ui/NumericInput";

interface PaymentMethod {
  id: string;
  nombre: string;
}

interface PaymentData {
  fecha: string;
  metodoPagoId: string;
  monto: number;
  nota?: string;
}

interface PaymentModalProps {
  operacionId: string;
  pendiente: number;
  onSave: (data: PaymentData) => void;
  onClose: () => void;
  advertencia?: string;
}

export function PaymentModal({ pendiente, onSave, onClose, advertencia }: PaymentModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");

  // Payment method search
  const [metodoPagoQuery, setMetodoPagoQuery] = useState("");
  const [metodoPagoDropdown, setMetodoPagoDropdown] = useState(false);
  const [isSavingMetodo, setIsSavingMetodo] = useState(false);
  const [confirmDeleteMetodoId, setConfirmDeleteMetodoId] = useState<string | null>(null);
  const [isDeletingMetodoId, setIsDeletingMetodoId] = useState<string | null>(null);
  const [deletedMetodoIds, setDeletedMetodoIds] = useState<Set<string>>(new Set());
  const metodoPagoInputRef = useRef<HTMLInputElement>(null);
  const metodoPagoDropdownRef = useRef<HTMLDivElement>(null);

  const [montoError, setMontoError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        metodoPagoDropdownRef.current && !metodoPagoDropdownRef.current.contains(e.target as Node) &&
        metodoPagoInputRef.current && !metodoPagoInputRef.current.contains(e.target as Node)
      ) setMetodoPagoDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchPaymentMethods() {
    setLoadingMethods(true);
    try {
      const res = await fetch("/api/payment-methods");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data.paymentMethods ?? []);
      }
    } finally {
      setLoadingMethods(false);
    }
  }

  // Search results
  const metodoResultados = paymentMethods.filter(
    (pm) => !deletedMetodoIds.has(pm.id) && pm.nombre.toLowerCase().includes(metodoPagoQuery.toLowerCase())
  );
  const puedoCrearMetodo =
    metodoPagoQuery.trim().length > 0 &&
    !metodoResultados.some((pm) => pm.nombre.toLowerCase() === metodoPagoQuery.trim().toLowerCase());

  async function handleDeleteMetodo(id: string) {
    setIsDeletingMetodoId(id);
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletedMetodoIds((prev) => new Set(prev).add(id));
        if (metodoPagoId === id) {
          setMetodoPagoId("");
          setMetodoPagoQuery("");
        }
      }
    } finally {
      setIsDeletingMetodoId(null);
      setConfirmDeleteMetodoId(null);
    }
  }

  function handleSelectMetodo(pm: PaymentMethod) {
    setMetodoPagoId(pm.id);
    setMetodoPagoQuery(pm.nombre);
    setMetodoPagoDropdown(false);
  }

  async function handleCreateMetodo() {
    const nombre = metodoPagoQuery.trim().toUpperCase();
    if (!nombre) return;
    setIsSavingMetodo(true);
    try {
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (res.ok) {
        const newMethod: PaymentMethod = data.paymentMethod;
        setPaymentMethods((prev) => [...prev, newMethod].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        handleSelectMetodo(newMethod);
      }
    } finally {
      setIsSavingMetodo(false);
    }
  }

  function handleMontoChange(value: string) {
    setMonto(value);
    const num = parseFloat(value);
    if (value !== "" && (isNaN(num) || num <= 0)) {
      setMontoError("El monto debe ser mayor a cero");
    } else {
      setMontoError("");
    }
  }

  function handlePagoTodo() {
    setMonto(String(pendiente));
    setMontoError("");
  }

  const montoNum = parseFloat(monto);
  const isSaveDisabled =
    saving ||
    !fecha ||
    !metodoPagoId ||
    !monto ||
    isNaN(montoNum) ||
    montoNum <= 0;

  async function handleSave() {
    if (isSaveDisabled) return;
    setSaving(true);
    try {
      await onSave({
        fecha,
        metodoPagoId,
        monto: montoNum,
        nota: nota.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar pago"
      onClick={handleBackdropClick}
    >
      <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              payments
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">Registrar pago</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Advertencia */}
        {advertencia && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-3">
            <span className="material-symbols-outlined text-xl text-amber-600">warning</span>
            <p className="text-sm font-medium text-amber-800">{advertencia}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pago-fecha" className="text-sm font-medium text-zinc-700">
              Fecha
            </label>
            <input
              id="pago-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={saving}
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          {/* Forma de pago */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pago-metodo" className="text-sm font-medium text-zinc-700">
              Forma de pago
            </label>
            <div className="relative">
              {loadingMethods ? (
                <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-4">
                  <span className="material-symbols-outlined animate-spin text-sm text-zinc-400">
                    progress_activity
                  </span>
                  <span className="text-sm text-zinc-400">Cargando...</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                    credit_card
                  </span>
                  {metodoPagoId && !metodoPagoDropdown && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-base text-green-500">
                      check_circle
                    </span>
                  )}
                  <input
                    ref={metodoPagoInputRef}
                    id="pago-metodo"
                    type="text"
                    value={metodoPagoQuery}
                    onChange={(e) => {
                      setMetodoPagoQuery(e.target.value);
                      setMetodoPagoId("");
                      setMetodoPagoDropdown(true);
                    }}
                    onFocus={() => setMetodoPagoDropdown(true)}
                    placeholder="Buscar forma de pago..."
                    autoComplete="off"
                    disabled={saving}
                    aria-label="Buscar forma de pago"
                    className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                  {metodoPagoDropdown && (metodoResultados.length > 0 || puedoCrearMetodo) && (
                    <div
                      ref={metodoPagoDropdownRef}
                      className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg"
                    >
                      {metodoResultados.map((pm) => (
                        <div
                          key={pm.id}
                          className="flex items-center gap-1 px-2 hover:bg-blue-50 first:rounded-t-lg"
                        >
                          {confirmDeleteMetodoId === pm.id ? (
                            <div className="flex flex-1 items-center gap-2 py-2">
                              <span className="flex-1 text-sm text-zinc-700">¿Eliminar <strong>{pm.nombre}</strong>?</span>
                              <button
                                type="button"
                                onMouseDown={() => handleDeleteMetodo(pm.id)}
                                disabled={isDeletingMetodoId === pm.id}
                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {isDeletingMetodoId === pm.id ? "..." : "Sí"}
                              </button>
                              <button
                                type="button"
                                onMouseDown={() => setConfirmDeleteMetodoId(null)}
                                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onMouseDown={() => handleSelectMetodo(pm)}
                                className="flex flex-1 items-center gap-2 py-2.5 text-left text-sm text-zinc-800"
                              >
                                <span className="material-symbols-outlined text-base text-zinc-400">credit_card</span>
                                {pm.nombre}
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); e.nativeEvent.stopImmediatePropagation(); setConfirmDeleteMetodoId(pm.id); }}
                                aria-label={`Eliminar forma de pago ${pm.nombre}`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {puedoCrearMetodo && (
                        <button
                          type="button"
                          onMouseDown={handleCreateMetodo}
                          disabled={isSavingMetodo}
                          className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-2.5 text-left text-sm font-medium text-blue-700 hover:bg-blue-50 last:rounded-b-lg disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          {isSavingMetodo ? "Creando..." : `Crear "${metodoPagoQuery.trim()}"`}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Monto */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="pago-monto" className="text-sm font-medium text-zinc-700">
                Monto
              </label>
              <button
                type="button"
                onClick={handlePagoTodo}
                disabled={saving}
                className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                Pagó todo
              </button>
            </div>
            <NumericInput
              id="pago-monto"
              value={monto}
              onChange={handleMontoChange}
              placeholder="0"
              disabled={saving}
              className={`h-11 w-full rounded-lg border bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 ${
                montoError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            {montoError && (
              <p className="text-xs text-red-600">{montoError}</p>
            )}
          </div>

          {/* Nota (opcional) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pago-nota" className="text-sm font-medium text-zinc-700">
              Nota{" "}
              <span className="font-normal text-zinc-400">(opcional)</span>
            </label>
            <textarea
              id="pago-nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Seña, cuota 1..."
              rows={2}
              disabled={saving}
              className="w-full resize-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <span className="material-symbols-outlined animate-spin text-lg">
                progress_activity
              </span>
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
