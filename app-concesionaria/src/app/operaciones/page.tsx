"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { OperationsTable, OperationFilters } from "@/components/operations/OperationsTable";
import { OperationsFilters } from "@/components/operations/OperationsFilters";
import { CreateOperationForm } from "@/components/operations/CreateOperationForm";
import "material-symbols/outlined.css";

export default function OperacionesPage() {
  const [filters, setFilters] = useState<OperationFilters>({ estado: "abierta" });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleNuevaOperacion = () => {
    setShowCreateForm(true);
  };

  const handleApplyFilters = (newFilters: OperationFilters) => {
    setFilters(newFilters);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header con breadcrumb */}
        <div className="flex flex-col gap-4">
          {showCreateForm && (
            <nav className="flex items-center gap-2 text-sm text-zinc-500">
              <button
                onClick={() => setShowCreateForm(false)}
                className="hover:text-zinc-700 transition-colors"
              >
                Operaciones
              </button>
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
              <span className="text-zinc-900 font-medium">Nueva Operación</span>
            </nav>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <span className="material-symbols-outlined text-3xl text-white">
                  work
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-zinc-900">
                  {showCreateForm ? "Registrar Operación" : "Gestión de Operaciones"}
                </h1>
                <p className="text-sm text-zinc-500">
                  {showCreateForm
                    ? "Complete los datos técnicos y comerciales para dar de alta una nueva operación."
                    : "Administrá las operaciones de venta de vehículos"}
                </p>
              </div>
            </div>

            {!showCreateForm && (
              <button
                onClick={handleNuevaOperacion}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Crear nueva operación"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                Nueva operación
              </button>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        {showCreateForm ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <CreateOperationForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <OperationsFilters
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <OperationsTable filters={filters} refreshTrigger={refreshTrigger} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
