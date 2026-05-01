"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { StockTable } from "@/components/stock/StockTable";
import { StockFilters, StockFilters as StockFiltersType } from "@/components/stock/StockFilters";
import "material-symbols/outlined.css";

interface SelectedVehicle {
  id: string;
  marca: string;
  modelo: string;
  version: string | null;
  color: string | null;
  kilometros: number | null;
  precioRevista: number | null;
  precioOferta: number | null;
}

export default function StockPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<StockFiltersType>({});
  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleAgregarVehiculo = () => {
    router.push("/stock/nuevo");
  };

  const handleApplyFilters = (newFilters: StockFiltersType) => {
    setFilters(newFilters);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setRefreshTrigger((prev) => prev + 1);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatKilometers = (km: number | null) => {
    if (km === null) return "—";
    return new Intl.NumberFormat("es-AR").format(km) + " km";
  };

  const handleExportCatalog = async () => {
    if (selectedVehicles.length === 0) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 12;
      const baseUrl = window.location.origin;

      // Paleta negro/rojo/gris
      const C_BLACK   = [15, 15, 15] as const;   // fondo principal
      const C_RED     = [185, 28, 28] as const;   // acento rojo
      const C_GRAY_D  = [30, 30, 30] as const;    // gris oscuro (barras)
      const C_GRAY_M  = [80, 80, 80] as const;    // gris medio (texto secundario)
      const C_GRAY_L  = [220, 220, 220] as const; // gris claro (bordes)
      const C_WHITE   = [255, 255, 255] as const;

      // Cargar logo desde localStorage
      const clienteId = session?.user?.clienteId || "admin";
      const companyLogo = localStorage.getItem(`company_logo_${clienteId}`) || "";
      const companyName = localStorage.getItem(`company_name_${clienteId}`) || "CONCESIONARIA";

      // ── Helpers ─────────────────────────────────────────────────────────────

      const fetchPhoto = async (photoId: string): Promise<{ dataUrl: string; format: string; imgW: number; imgH: number } | null> => {
        try {
          console.log("[PDF] fetchPhoto: fetching", `${baseUrl}/api/photos/${photoId}`);
          const res = await fetch(`${baseUrl}/api/photos/${photoId}`);
          console.log("[PDF] fetchPhoto: response status", res.status, res.headers.get("Content-Type"));
          if (!res.ok) {
            console.error("[PDF] fetchPhoto: response not ok", res.status);
            return null;
          }
          const blob = await res.blob();
          console.log("[PDF] fetchPhoto: blob size", blob.size, "type", blob.type);
          // Detect format from actual blob MIME type
          const rawDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          console.log("[PDF] fetchPhoto: rawDataUrl prefix", rawDataUrl.substring(0, 50));
          // Convert to JPEG via Canvas for maximum jsPDF compatibility (handles WEBP, AVIF, PNG, etc.)
          const img = new Image();
          img.src = rawDataUrl;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => { console.log("[PDF] fetchPhoto: image loaded, size", img.naturalWidth, "x", img.naturalHeight); resolve(); };
            img.onerror = (e) => { console.error("[PDF] fetchPhoto: image load error", e); reject(e); };
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d")!.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          console.log("[PDF] fetchPhoto: jpeg dataUrl prefix", dataUrl.substring(0, 50));
          return { dataUrl, format: "JPEG", imgW: img.naturalWidth, imgH: img.naturalHeight };
        } catch (e) {
          console.error("[PDF] fetchPhoto error:", e);
          return null;
        }
      };

      // ── Pre-fetch photo IDs for all vehicles ──────────────────────────────

      const allPhotoIds: Record<string, string[]> = {};
      for (const v of selectedVehicles) {
        try {
          console.log("[PDF] fetching vehicle detail", `${baseUrl}/api/stock/${v.id}`);
          const res = await fetch(`${baseUrl}/api/stock/${v.id}`);
          console.log("[PDF] vehicle detail status", res.status);
          if (res.ok) {
            const data = await res.json();
            const ids = (data.vehicle?.VehiclePhoto ?? []).map((p: { id: string }) => p.id);
            console.log("[PDF] vehicle", v.id, "photo IDs:", ids);
            allPhotoIds[v.id] = ids;
          } else {
            console.warn("[PDF] vehicle detail not ok", res.status);
            allPhotoIds[v.id] = [];
          }
        } catch (e) {
          console.error("[PDF] vehicle detail fetch error", e);
          allPhotoIds[v.id] = [];
        }
      }

      // ── PORTADA ─────────────────────────────────────────────────────────────

      // Fondo negro superior
      doc.setFillColor(...C_BLACK);
      doc.rect(0, 0, pageW, pageH * 0.52, "F");

      // Franja roja decorativa
      doc.setFillColor(...C_RED);
      doc.rect(0, pageH * 0.42, pageW, 10, "F");

      const datePortada = new Date().toLocaleDateString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      // Logo de la empresa (si existe)
      let logoLoaded = false;
      if (companyLogo) {
        try {
          const logoImg = new Image();
          logoImg.src = companyLogo;
          await new Promise<void>((resolve) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => resolve();
          });
          if (logoImg.naturalWidth > 0) {
            const canvas = document.createElement("canvas");
            canvas.width = logoImg.naturalWidth;
            canvas.height = logoImg.naturalHeight;
            canvas.getContext("2d")!.drawImage(logoImg, 0, 0);
            const logoDataUrl = canvas.toDataURL("image/png");
            const maxLogoW = 50;
            const maxLogoH = 25;
            const aspect = logoImg.naturalWidth / logoImg.naturalHeight;
            let lw = maxLogoW;
            let lh = maxLogoW / aspect;
            if (lh > maxLogoH) { lh = maxLogoH; lw = maxLogoH * aspect; }
            doc.addImage(logoDataUrl, "PNG", pageW / 2 - lw / 2, 28, lw, lh);
            logoLoaded = true;
          }
        } catch {}
      }

      // Nombre de la empresa (si no hay logo)
      if (!logoLoaded) {
        doc.setTextColor(...C_GRAY_L);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(companyName.toUpperCase(), pageW / 2, 55, { align: "center" });
      }

      // Título principal
      doc.setTextColor(...C_WHITE);
      doc.setFontSize(44);
      doc.setFont("helvetica", "bold");
      doc.text("CATÁLOGO", pageW / 2, logoLoaded ? 76 : 90, { align: "center" });

      doc.setFontSize(22);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C_GRAY_L);
      doc.text("DE STOCK", pageW / 2, logoLoaded ? 89 : 103, { align: "center" });

      // Línea decorativa blanca
      doc.setDrawColor(...C_WHITE);
      doc.setLineWidth(0.6);
      const lineY = logoLoaded ? 96 : 110;
      doc.line(pageW / 2 - 35, lineY, pageW / 2 + 35, lineY);

      // Fecha
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C_WHITE);
      doc.text(datePortada, pageW / 2, lineY + 9, { align: "center" });

      // Fondo gris claro inferior
      doc.setFillColor(245, 245, 245);
      doc.rect(0, pageH * 0.52, pageW, pageH * 0.48, "F");

      // Lista de vehículos en portada
      const listStartY = pageH * 0.52 + 14;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C_RED);
      doc.text(`${selectedVehicles.length} VEHÍCULO${selectedVehicles.length !== 1 ? "S" : ""} INCLUIDO${selectedVehicles.length !== 1 ? "S" : ""}`, margin + 4, listStartY);

      doc.setDrawColor(...C_RED);
      doc.setLineWidth(0.3);
      doc.line(margin + 4, listStartY + 2, pageW - margin - 4, listStartY + 2);

      selectedVehicles.slice(0, 24).forEach((v, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + 4 + col * ((pageW - margin * 2 - 8) / 2);
        const y = listStartY + 10 + row * 8;
        doc.setFillColor(...C_RED);
        doc.circle(x + 1, y - 1.5, 0.8, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_GRAY_D);
        const label = `${v.marca} ${v.modelo}${v.version ? ` · ${v.version}` : ""}`;
        doc.text(label, x + 4, y);
      });

      // Pie de portada
      doc.setFontSize(8);
      doc.setTextColor(...C_GRAY_M);
      doc.text(`Generado el ${new Date().toLocaleDateString("es-AR")}`, pageW / 2, pageH - 8, { align: "center" });

      // ── PÁGINAS DE VEHÍCULOS (4 por página) ──────────────────────────────

      const vehiclesPerPage = 4;
      const headerH = 13;
      const contentStartY = headerH + 4;
      const bottomPad = 10;
      const cardH = (pageH - contentStartY - bottomPad) / vehiclesPerPage; // ~90mm

      const totalContentPages = Math.ceil(selectedVehicles.length / vehiclesPerPage);
      const totalPages = totalContentPages + 1; // +1 portada

      for (let pageIdx = 0; pageIdx < totalContentPages; pageIdx++) {
        doc.addPage();

        const pageVehicles = selectedVehicles.slice(
          pageIdx * vehiclesPerPage,
          (pageIdx + 1) * vehiclesPerPage
        );

        // Header de página
        doc.setFillColor(...C_BLACK);
        doc.rect(0, 0, pageW, headerH, "F");
        doc.setFillColor(...C_RED);
        doc.rect(0, headerH - 2, pageW, 2, "F");
        doc.setTextColor(...C_WHITE);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.text("CATÁLOGO DE STOCK", margin, 8.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(new Date().toLocaleDateString("es-AR"), pageW - margin, 8.5, { align: "right" });

        for (let cardIdx = 0; cardIdx < pageVehicles.length; cardIdx++) {
          const vehicle = pageVehicles[cardIdx];
          const cardY = contentStartY + cardIdx * cardH;
          const innerPad = 4;

          // Fondo de card
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(...C_GRAY_L);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, cardY, pageW - margin * 2, cardH - 2, 2, 2, "FD");

          // Barra roja izquierda
          doc.setFillColor(...C_RED);
          doc.roundedRect(margin, cardY, 3.5, cardH - 2, 1, 1, "F");

          const textX = margin + 3.5 + innerPad;
          const photoW = 66;
          const photoH = cardH - 2 - innerPad * 2;
          const photoX = pageW - margin - photoW - innerPad;
          const textW = photoX - textX - 3;

          // Foto
          const photoIds = allPhotoIds[vehicle.id] ?? [];
          console.log("[PDF] vehicle", vehicle.id, "photoIds:", photoIds);
          let photoLoaded = false;
          if (photoIds.length > 0) {
            const photo = await fetchPhoto(photoIds[0]);
            console.log("[PDF] fetchPhoto result:", photo ? "ok (dataUrl length: " + photo.dataUrl.length + ")" : "null");
            if (photo) {
              try {
                // Fit image within box maintaining aspect ratio
                const imgAspect = photo.imgW / photo.imgH;
                const boxAspect = photoW / photoH;
                let renderW = photoW;
                let renderH = photoH;
                let renderX = photoX;
                let renderY = cardY + innerPad;
                if (imgAspect > boxAspect) {
                  renderH = photoW / imgAspect;
                  renderY = cardY + innerPad + (photoH - renderH) / 2;
                } else {
                  renderW = photoH * imgAspect;
                  renderX = photoX + (photoW - renderW) / 2;
                }
                doc.addImage(photo.dataUrl, photo.format, renderX, renderY, renderW, renderH);
                photoLoaded = true;
                console.log("[PDF] addImage OK");
              } catch (imgErr) {
                console.error("[PDF] addImage error:", imgErr, "format:", photo.format, "dataUrl prefix:", photo.dataUrl.substring(0, 60));
              }
            }
          }
          if (!photoLoaded) {
            doc.setFillColor(240, 240, 240);
            doc.setDrawColor(...C_GRAY_L);
            doc.setLineWidth(0.2);
            doc.roundedRect(photoX, cardY + innerPad, photoW, photoH, 1.5, 1.5, "FD");
            doc.setTextColor(...C_GRAY_M);
            doc.setFontSize(7);
            doc.setFont("helvetica", "italic");
            doc.text("Sin foto", photoX + photoW / 2, cardY + innerPad + photoH / 2, { align: "center" });
          }

          // Texto
          let ty = cardY + innerPad + 6;

          // Marca + Modelo
          doc.setTextColor(...C_BLACK);
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          const titleText = `${vehicle.marca} ${vehicle.modelo}`;
          // Truncate if too wide
          const truncTitle = doc.getTextWidth(titleText) > textW
            ? doc.splitTextToSize(titleText, textW)[0]
            : titleText;
          doc.text(truncTitle, textX, ty);
          ty += 6;

          // Versión
          if (vehicle.version) {
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...C_GRAY_M);
            doc.text(vehicle.version, textX, ty);
            ty += 5;
          }

          // Separador
          ty += 2;
          doc.setDrawColor(...C_GRAY_L);
          doc.setLineWidth(0.2);
          doc.line(textX, ty, textX + textW, ty);
          ty += 5;

          // Campo Color
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C_GRAY_M);
          doc.text("COLOR", textX, ty);
          ty += 3.5;
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...C_BLACK);
          doc.text(vehicle.color || "—", textX, ty);
          ty += 5;

          // Campo Kilómetros
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C_GRAY_M);
          doc.text("KILÓMETROS", textX, ty);
          ty += 3.5;
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...C_BLACK);
          doc.text(formatKilometers(vehicle.kilometros), textX, ty);
          ty += 5;

          // Campo Precio
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C_GRAY_M);
          doc.text("PRECIO", textX, ty);
          ty += 4;

          const hasOffer = vehicle.precioOferta !== null;
          const showStrike =
            hasOffer &&
            vehicle.precioRevista !== null &&
            vehicle.precioOferta! < vehicle.precioRevista;

          if (showStrike) {
            // Precio revista tachado en rojo
            const strikeText = formatCurrency(vehicle.precioRevista);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(220, 38, 38);
            doc.text(strikeText, textX, ty);
            const strikeW = doc.getTextWidth(strikeText);
            doc.setDrawColor(220, 38, 38);
            doc.setLineWidth(0.4);
            doc.line(textX, ty - 1.2, textX + strikeW, ty - 1.2);

            // Precio oferta en verde al lado
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(22, 163, 74);
            doc.text(formatCurrency(vehicle.precioOferta), textX + strikeW + 3, ty);
          } else if (hasOffer) {
            // Precio oferta solo, sin tachado
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(22, 163, 74);
            doc.text(formatCurrency(vehicle.precioOferta), textX, ty);
          } else {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...C_BLACK);
            doc.text(formatCurrency(vehicle.precioRevista), textX, ty);
          }
        }

        // Número de página
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_GRAY_M);
        doc.text(`${pageIdx + 2} / ${totalPages}`, pageW - margin, pageH - 4, { align: "right" });
      }

      const today = new Date().toISOString().slice(0, 10);
      doc.save(`catalogo-stock-${today}.pdf`);
      toast.success(
        `PDF generado con ${selectedVehicles.length} vehículo${selectedVehicles.length !== 1 ? "s" : ""}`
      );
    } catch (e) {
      console.error(e);
      toast.error("Error al generar el PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <span className="material-symbols-outlined text-3xl text-white">
                directions_car
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">
                Stock de Vehículos
              </h1>
              <p className="text-sm text-zinc-500">
                Administrá el inventario de vehículos disponibles
              </p>
            </div>
          </div>

          <button
            onClick={handleAgregarVehiculo}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Agregar nuevo vehículo"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Agregar vehículo
          </button>
        </div>

        {/* Filtros */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <StockFilters
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            selectedCount={selectedVehicles.length}
            onExportCatalog={handleExportCatalog}
            isExporting={isExporting}
          />
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <StockTable
            refreshTrigger={refreshTrigger}
            filters={filters}
            onSelectionChange={setSelectedVehicles}
          />
        </div>
      </div>
    </AppLayout>
  );
}
