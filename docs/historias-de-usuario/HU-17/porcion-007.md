# porcion-007 — Validación de dimensiones de imagen al seleccionar fotos [FRONT]

**Historia de usuario:** HU-17: Optimización de almacenamiento y carga de fotos de vehículos
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-002

## Descripción

Agregar validación client-side de dimensiones de imagen en todos los puntos donde el usuario selecciona fotos de vehículos. Cuando el usuario elige un archivo de imagen, antes de agregarlo al lote se verifica que su lado más largo mida al menos **800px** usando el API nativo `Image` del navegador. Si una imagen no supera el requisito, **no se agrega** al lote y se muestra un mensaje de error visible en la zona de subida indicando el nombre del archivo y el motivo.

Los puntos de carga afectados son:

1. **`VehicleFieldsForm.tsx`** — función `handlePhotoSelect` (y `handleDrop` que la llama): fotos del vehículo en creación y edición de stock, y fotos del vehículo vendido en creación de operación.
2. **`CreateOperationForm.tsx`** — función `handleTradeInPhotoSelect`: fotos del vehículo usado en intercambio.

La validación debe ser **asíncrona**: se leen las dimensiones naturales del archivo mediante `URL.createObjectURL` + `new Image()` antes de actualizar el estado. Las imágenes válidas se agregan normalmente; las inválidas se acumulan en una lista de errores que se muestra bajo la zona de drop y se limpia cuando el usuario selecciona nuevos archivos.

**Archivos a modificar:**
- `src/components/stock/VehicleFieldsForm.tsx`
- `src/components/operations/CreateOperationForm.tsx`

## Ejemplo de uso

```tsx
// Función auxiliar para leer dimensiones
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

// En handlePhotoSelect — ahora async
const handlePhotoSelect = async (files: FileList | null) => {
  if (!files) return;
  const rejected: string[] = [];

  const validFiles: File[] = [];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) continue;
    try {
      const { width, height } = await getImageDimensions(file);
      if (Math.max(width, height) < 800) {
        rejected.push(file.name);
      } else {
        validFiles.push(file);
      }
    } catch {
      rejected.push(file.name);
    }
  }

  if (rejected.length > 0) {
    setPhotoErrors(
      rejected.map((name) => `"${name}" no cumple el mínimo de 800px en su lado más largo.`)
    );
  } else {
    setPhotoErrors([]);
  }

  // Agregar solo las válidas al estado (lógica existente de slots disponibles)
  handlers.setPhotos((prev) => {
    const existingCount = (stockPhotoIds?.length ?? 0) + prev.length;
    const slots = Math.max(0, 10 - existingCount);
    const toAdd = validFiles.slice(0, slots).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    return [...prev, ...toAdd];
  });
};

// Mensaje de error bajo la zona de drop
{photoErrors.length > 0 && (
  <ul className="mt-2 space-y-1">
    {photoErrors.map((msg, i) => (
      <li key={i} className="flex items-center gap-1 text-xs text-red-600">
        <span className="material-symbols-outlined text-sm">error</span>
        {msg}
      </li>
    ))}
  </ul>
)}
```

## Criterios de aceptación

- [ ] Al seleccionar una imagen con lado más largo ≥ 800px, se agrega normalmente al lote sin ningún mensaje de error.
- [ ] Al seleccionar una imagen con lado más largo < 800px, **no se agrega** al lote y se muestra un mensaje de error debajo de la zona de subida con el nombre del archivo.
- [ ] Al seleccionar un lote mixto (algunas válidas, algunas inválidas), las válidas se agregan y solo se muestran errores por las inválidas.
- [ ] El mensaje de error desaparece al seleccionar una nueva tanda de archivos (todos válidos).
- [ ] La validación aplica tanto al clic en el input de tipo `file` como al drag & drop.
- [ ] La validación aplica en `VehicleFieldsForm` (fotos del vehículo principal) y en `CreateOperationForm` (fotos del vehículo en intercambio).
- [ ] No se puede enviar el formulario mientras haya imágenes pendientes de validación (la operación async debe completarse antes de actualizar el estado).
- [ ] El componente es responsivo: el mensaje de error es visible en pantallas de escritorio y móvil. *(criterio de responsividad obligatorio)*

## Pruebas

### Pruebas unitarias

1. **Imagen válida (1200x800):** Mockear `getImageDimensions` para retornar `{ width: 1200, height: 800 }`. Simular selección y verificar que la imagen se agrega al estado y no hay mensajes de error.
2. **Imagen inválida (600x400):** Mockear para retornar `{ width: 600, height: 400 }`. Verificar que no se agrega al estado y el mensaje de error contiene el nombre del archivo.
3. **Lote mixto:** Tres archivos donde uno es inválido. Verificar que el estado tiene dos fotos y hay exactamente un mensaje de error.
4. **Limpieza de errores:** Después de mostrar errores, simular nueva selección con archivos válidos y verificar que `photoErrors` queda vacío.

### Pruebas de integración

1. **Flujo completo en CreateVehicleForm:** Montar el formulario completo, simular la selección de una imagen pequeña y verificar que el mensaje de error aparece en el DOM y el formulario no incluye esa imagen al enviar.
2. **Drag & drop:** Simular un evento `drop` con un archivo inválido y verificar que el error se muestra igualmente.
