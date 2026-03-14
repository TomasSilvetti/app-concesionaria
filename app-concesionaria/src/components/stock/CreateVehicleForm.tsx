"use client";

import React, { useState, useEffect } from "react";
import "material-symbols/outlined.css";
import {
  VehicleFieldsForm,
  type PhotoFile,
  type VehicleFieldsData,
  type VehicleFieldsHandlers,
} from "./VehicleFieldsForm";

interface VehicleBrand {
  id: string;
  nombre: string;
}

interface VehicleCategory {
  id: string;
  nombre: string;
}

interface CreateVehicleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateVehicleForm({
  onSuccess,
  onCancel,
}: CreateVehicleFormProps) {
  const [marcaId, setMarcaId] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [patente, setPatente] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [version, setVersion] = useState("");
  const [color, setColor] = useState("");
  const [kilometros, setKilometros] = useState("");
  const [notasMecanicas, setNotasMecanicas] = useState("");
  const [notasGenerales, setNotasGenerales] = useState("");
  const [precioRevista, setPrecioRevista] = useState("");
  const [precioOferta, setPrecioOferta] = useState("");
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

  const fetchBrands = async () => {
    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/vehicle-brands`);
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands ?? []);
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
        setCategories(data.categories ?? []);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!marcaId) errors.marcaId = "Seleccioná una marca";
    if (!modelo.trim()) errors.modelo = "El modelo es requerido";
    if (!anio) {
      errors.anio = "El año es requerido";
    } else {
      const anioNum = parseInt(anio);
      if (isNaN(anioNum) || anioNum < 1900 || anioNum > 2100) {
        errors.anio = "El año debe estar entre 1900 y 2100";
      }
    }
    if (!categoriaId) errors.categoriaId = "Seleccioná una categoría";
    if (!version.trim()) errors.version = "La versión es requerida";
    if (!color.trim()) errors.color = "El color es requerido";
    if (!kilometros) {
      errors.kilometros = "Los kilómetros son requeridos";
    } else if (parseFloat(kilometros) < 0) {
      errors.kilometros = "Los kilómetros no pueden ser negativos";
    }
    if (!precioRevista) {
      errors.precioRevista = "El precio revista es requerido";
    } else if (parseFloat(precioRevista) <= 0) {
      errors.precioRevista = "El precio debe ser mayor a 0";
    }
    if (precioOferta && parseFloat(precioOferta) <= 0) {
      errors.precioOferta = "El precio debe ser mayor a 0";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";

      const formData = new FormData();
      formData.append("marcaId", marcaId);
      formData.append("modelo", modelo.trim());
      formData.append("anio", anio);
      formData.append("categoriaId", categoriaId);
      formData.append("version", version.trim());
      formData.append("color", color.trim());
      formData.append("kilometros", kilometros);
      formData.append("precioRevista", precioRevista);
      
      if (patente.trim()) {
        formData.append("patente", patente.trim());
      }
      if (precioOferta) {
        formData.append("precioOferta", precioOferta);
      }
      if (notasMecanicas.trim()) {
        formData.append("notasMecanicas", notasMecanicas.trim());
      }
      if (notasGenerales.trim()) {
        formData.append("notasGenerales", notasGenerales.trim());
      }

      photos.forEach((photo, index) => {
        formData.append("fotos", photo.file);
        formData.append(`foto_orden_${index}`, index.toString());
      });

      const res = await fetch(`${baseUrl}/api/stock`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setSuccessMessage("Vehículo creado exitosamente");
        setMarcaId("");
        setModelo("");
        setAnio("");
        setPatente("");
        setCategoriaId("");
        setVersion("");
        setColor("");
        setKilometros("");
        setNotasMecanicas("");
        setNotasGenerales("");
        setPrecioRevista("");
        setPrecioOferta("");
        setPhotos([]);
        setFieldErrors({});
        onSuccess?.();
      } else if (res.status === 400) {
        setError(data.message ?? "Datos inválidos. Verificá los campos.");
      } else {
        setError(
          data.message ?? "Ocurrió un error al crear el vehículo. Intentá nuevamente."
        );
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) setError(null);
  };

  const vehicleData: VehicleFieldsData = {
    marcaId,
    modelo,
    anio,
    patente,
    categoriaId,
    version,
    color,
    kilometros,
    notasMecanicas,
    notasGenerales,
    precioRevista,
    precioOferta,
    photos,
  };

  const vehicleHandlers: VehicleFieldsHandlers = {
    setMarcaId,
    setModelo,
    setAnio,
    setPatente,
    setCategoriaId,
    setVersion,
    setColor,
    setKilometros,
    setNotasMecanicas,
    setNotasGenerales,
    setPrecioRevista,
    setPrecioOferta,
    setPhotos,
  };

  const isFormValid =
    marcaId &&
    modelo.trim() &&
    anio &&
    categoriaId &&
    version.trim() &&
    color.trim() &&
    kilometros &&
    precioRevista &&
    Object.keys(fieldErrors).length === 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {successMessage && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <VehicleFieldsForm
        data={vehicleData}
        handlers={vehicleHandlers}
        brands={brands}
        categories={categories}
        brandsLoading={brandsLoading}
        categoriesLoading={categoriesLoading}
        fieldErrors={fieldErrors}
        onFieldChange={handleInputChange}
        disabled={isSubmitting}
        isDragging={isDragging}
        onDragStateChange={setIsDragging}
      />

      {/* Botones de acción */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="order-2 flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:order-1"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="order-1 flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:order-2 sm:flex-initial sm:px-6"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">
                progress_activity
              </span>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">save</span>
              <span>Guardar Vehículo</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
