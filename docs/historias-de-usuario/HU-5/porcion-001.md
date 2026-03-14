# porcion-001 — Agregar campo patente al formulario de stock [FRONT]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Agregar el campo "patente" al formulario de carga de vehículos en el módulo de stock, para que capture la misma información que el formulario de operaciones y mantenga consistencia entre ambos módulos.

## Ejemplo de uso

El vendedor accede al módulo de stock, hace clic en "Agregar Vehículo", completa todos los campos incluyendo el nuevo campo "Patente" (ej: "ABC123"), y guarda el vehículo exitosamente con todos sus datos.

## Criterios de aceptación

- [ ] El formulario de stock incluye un campo "Patente" entre los campos existentes
- [ ] El campo patente es opcional (no tiene asterisco rojo)
- [ ] El campo patente acepta texto alfanumérico
- [ ] El campo patente tiene un placeholder indicativo (ej: "ABC123")
- [ ] El campo patente tiene el mismo estilo visual que los demás campos del formulario
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El campo patente se renderiza correctamente en el formulario
- [ ] El campo patente acepta valores alfanuméricos válidos
- [ ] El campo patente permite quedar vacío sin generar error de validación
- [ ] El campo patente actualiza su estado correctamente cuando el usuario escribe

### Pruebas de integración

- [ ] Al enviar el formulario con el campo patente completado, el valor se incluye en el payload enviado al backend
- [ ] Al enviar el formulario sin completar el campo patente, el formulario se envía exitosamente sin ese campo
- [ ] El campo patente se limpia correctamente cuando el formulario se resetea después de un guardado exitoso
