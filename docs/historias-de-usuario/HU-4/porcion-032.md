# porcion-032 — Exportación de catálogo PDF — selección y generación [FRONT+BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** —
**Tipo:** FRONT+BACK
**Prerequisitos:** porcion-018, porcion-019

## Descripción

Implementar la funcionalidad de exportación de catálogo PDF. Los usuarios pueden seleccionar múltiples vehículos mediante checkboxes en la tabla y hacer clic en "Exportar catálogo" para generar un PDF con fotos, marca, modelo, versión, color, kilómetros, precio revista y precio oferta de cada vehículo seleccionado.

⚠️ **Diseño de datos actual:** El modelo es `Vehicle`. El campo `marca` no es un string directo en el modelo, sino que viene de la relación `VehicleBrand.nombre`. Los datos de los vehículos disponibles en `StockTable` ya incluyen `marca` (string resuelto) y `modelo` en la respuesta del GET `/api/stock`. Las fotos **no se incluyen** en el listado del GET `/api/stock` (para no saturar). Para incluir fotos en el PDF, cada foto debe cargarse individualmente via GET `/api/photos/[id]` (endpoint de fotos ya existente) o se puede optar por generar el PDF sin fotos si no están disponibles en el contexto del listado.

## Ejemplo de uso

El usuario selecciona 5 vehículos usando los checkboxes junto a cada fila. Hace clic en "Exportar catálogo". El sistema genera un PDF con una página por vehículo mostrando sus fotos y datos principales, y descarga automáticamente el archivo "catalogo-stock-2026-03-14.pdf" en el navegador.

## Criterios de aceptación

- [ ] Cada fila de la tabla tiene un checkbox para seleccionar el vehículo
- [ ] Hay un checkbox en el encabezado para seleccionar/deseleccionar todos
- [ ] El botón "Exportar catálogo" solo está habilitado si hay al menos un vehículo seleccionado
- [ ] Al hacer clic en "Exportar catálogo", se genera un PDF usando jspdf
- [ ] El PDF incluye para cada vehículo seleccionado: fotos (si tiene), marca, modelo, versión, color, kilómetros, precio revista y precio oferta (si existe)
- [ ] El PDF tiene un diseño profesional y legible
- [ ] El archivo PDF se descarga automáticamente con nombre descriptivo (ej: catalogo-stock-YYYY-MM-DD.pdf)
- [ ] Mientras se genera el PDF, se muestra un indicador de carga
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al seleccionar un checkbox, el vehículo se agrega al estado de seleccionados
- [ ] Al deseleccionar un checkbox, el vehículo se quita del estado de seleccionados
- [ ] El checkbox "Seleccionar todos" marca/desmarca todos los vehículos
- [ ] El botón "Exportar catálogo" se habilita solo si hay vehículos seleccionados
- [ ] La función de generación de PDF recibe correctamente los datos de los vehículos seleccionados

### Pruebas de integración

- [ ] Al hacer clic en "Exportar catálogo", se genera un archivo PDF
- [ ] El PDF contiene todos los vehículos seleccionados
- [ ] Cada vehículo en el PDF muestra todos los campos requeridos
- [ ] Las fotos de los vehículos se incluyen correctamente en el PDF
- [ ] El PDF se descarga automáticamente en el navegador
- [ ] Después de exportar, los checkboxes se mantienen seleccionados (no se resetean)
