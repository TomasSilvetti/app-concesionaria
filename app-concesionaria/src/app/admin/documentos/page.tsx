"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlantillasTable } from "@/components/documents/PlantillasTable";
import { PlantillaEditorModal } from "@/components/documents/PlantillaEditorModal";
import { AsignarEmpresasModal } from "@/components/documents/AsignarEmpresasModal";

export default function DocumentosAdminPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [editandoPlantillaId, setEditandoPlantillaId] = useState<string | null>(null);
  const [asignandoPlantilla, setAsignandoPlantilla] = useState<{ id: string; nombre: string } | null>(null);

  const handleCreatePlantilla = () => {
    setIsCreating(true);
  };

  const handleEditPlantilla = (plantilla: { id: string; nombre: string }) => {
    setEditandoPlantillaId(plantilla.id);
  };

  const handleAsignarEmpresas = (plantilla: { id: string; nombre: string }) => {
    setAsignandoPlantilla(plantilla);
  };

  return (
    <AppLayout>
      <PlantillasTable
        onCreatePlantilla={handleCreatePlantilla}
        onEditPlantilla={handleEditPlantilla}
        onAsignarEmpresas={handleAsignarEmpresas}
        refreshTrigger={refreshTrigger}
      />
      {asignandoPlantilla && (
        <AsignarEmpresasModal
          plantillaId={asignandoPlantilla.id}
          plantillaNombre={asignandoPlantilla.nombre}
          onClose={() => setAsignandoPlantilla(null)}
        />
      )}
      {editandoPlantillaId && (
        <PlantillaEditorModal
          plantillaId={editandoPlantillaId}
          onClose={() => setEditandoPlantillaId(null)}
          onSaved={() => {
            setEditandoPlantillaId(null);
            setRefreshTrigger((n) => n + 1);
          }}
        />
      )}
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
