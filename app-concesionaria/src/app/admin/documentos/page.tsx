"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlantillasTable } from "@/components/documents/PlantillasTable";
import { PlantillaEditorModal } from "@/components/documents/PlantillaEditorModal";

export default function DocumentosAdminPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlantilla = () => {
    setIsCreating(true);
  };

  const handleEditPlantilla = (plantilla: { id: string; nombre: string }) => {
    // porcion-006: modal/página de edición de plantilla
    alert(`Editar "${plantilla.nombre}" — próximamente (porcion-006)`);
  };

  const handleAsignarEmpresas = (plantilla: { id: string; nombre: string }) => {
    // porcion-008: modal de asignación de empresas
    alert(`Asignar empresas a "${plantilla.nombre}" — próximamente (porcion-008)`);
  };

  return (
    <AppLayout>
      <PlantillasTable
        onCreatePlantilla={handleCreatePlantilla}
        onEditPlantilla={handleEditPlantilla}
        onAsignarEmpresas={handleAsignarEmpresas}
        refreshTrigger={refreshTrigger}
      />
      {isCreating && (
        <PlantillaEditorModal
          onClose={() => setIsCreating(false)}
          onSaved={() => {
            setIsCreating(false);
            setRefreshTrigger((n) => n + 1);
          }}
        />
      )}
    </AppLayout>
  );
}
