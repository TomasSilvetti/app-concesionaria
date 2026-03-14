# HU-5: Mejoras en el módulo de operaciones

**Como** vendedor de la concesionaria,
**quiero** tener tipos de operación específicos y un formulario completo para cargar vehículos,
**para** registrar operaciones de manera más precisa y consistente con el resto del sistema.

## Descripción

Esta historia mejora el módulo de operaciones en dos aspectos clave. Primero, redefine los tipos de operación disponibles para que reflejen con precisión los procesos reales de venta de la concesionaria: venta desde stock, venta con toma de usado, venta 0km y a conseguir. Segundo, unifica los formularios de carga de vehículos entre los módulos de stock y operaciones, asegurando que ambos capturen la misma información completa del vehículo (incluyendo la patente que actualmente falta en el formulario de stock). Esta consistencia facilita el trabajo del vendedor y evita discrepancias en los datos registrados.

## Criterios de aceptación

- [ ] El selector de tipo de operación muestra únicamente las opciones: "Venta desde stock", "Venta con toma de usado", "Venta 0km", "A conseguir"
- [ ] Cuando se selecciona "Venta con toma de usado", el sistema valida que se haya añadido un vehículo usado antes de permitir guardar la operación
- [ ] Si se intenta guardar una operación de tipo "Venta con toma de usado" sin vehículo usado, se muestra el mensaje: "Debés añadir el vehículo usado antes de guardar esta operación"
- [ ] El formulario de carga de operaciones incluye todos los campos del vehículo: marca, modelo, año, categoría, versión, color, kilómetros, patente, notas mecánicas, notas generales, precios y fotos
- [ ] El formulario de carga de stock incluye el campo "patente" que actualmente falta
- [ ] Ambos formularios (stock y operaciones) capturan exactamente los mismos campos del vehículo
- [ ] El formulario de operaciones incluye campos adicionales específicos de la operación (como tipo de operación) además de los campos del vehículo
- [ ] Todos los campos obligatorios están marcados visualmente con asterisco rojo
- [ ] La validación de campos obligatorios funciona correctamente en ambos formularios

## Flujos

### Flujo principal — Registrar operación con nuevo tipo

1. El vendedor accede al módulo de operaciones
2. Hace clic en "Nueva operación"
3. Selecciona uno de los tipos de operación disponibles: "Venta desde stock", "Venta con toma de usado", "Venta 0km" o "A conseguir"
4. Completa todos los campos del vehículo en el formulario unificado (marca, modelo, año, categoría, versión, color, kilómetros, patente, precios, etc.)
5. Completa los campos específicos de la operación
6. Hace clic en "Guardar"
7. El sistema valida todos los campos y guarda la operación exitosamente

### Flujo principal — Cargar vehículo en stock con patente

1. El vendedor accede al módulo de stock
2. Hace clic en "Agregar Vehículo"
3. Completa el formulario incluyendo el nuevo campo "patente"
4. Completa el resto de los campos (marca, modelo, año, categoría, versión, color, kilómetros, precios, fotos)
5. Hace clic en "Guardar Vehículo"
6. El sistema valida y guarda el vehículo con todos sus datos incluyendo la patente

### Flujo alternativo 1 — Venta con toma de usado sin vehículo

1. El vendedor selecciona tipo de operación "Venta con toma de usado"
2. Completa los datos del vehículo a vender
3. Intenta guardar la operación sin haber añadido el vehículo usado que se toma como parte de pago
4. El sistema detecta que falta el vehículo usado y muestra el mensaje: "Debés añadir el vehículo usado antes de guardar esta operación"
5. El formulario no se envía y permanece en pantalla
6. El vendedor debe añadir el vehículo usado antes de poder continuar

### Flujo alternativo 2 — Campos obligatorios faltantes

1. El vendedor intenta guardar el formulario (de stock u operaciones) sin completar todos los campos obligatorios
2. El sistema marca en rojo los campos faltantes
3. El sistema muestra mensajes de error específicos debajo de cada campo inválido
4. El botón de guardar permanece deshabilitado hasta que todos los campos obligatorios estén completos
5. El vendedor completa los campos faltantes
6. El sistema habilita el botón de guardar y permite continuar

### Flujo alternativo 3 — Valores inválidos en campos numéricos

1. El vendedor ingresa valores inválidos en campos numéricos (año fuera de rango, kilómetros negativos, precios menores o iguales a cero)
2. El sistema muestra mensajes de error específicos para cada campo inválido
3. El vendedor corrige los valores
4. El sistema elimina los mensajes de error y permite continuar

## Notas técnicas

⚠️ **Base de datos:** Esta historia requiere modificar la estructura de datos de operaciones para reflejar los nuevos tipos de operación. También implica agregar el campo "patente" a la tabla de vehículos si aún no existe. El equipo deberá verificar si es necesario crear una migración de base de datos para actualizar registros existentes con los nuevos tipos de operación, y validar que el campo patente se almacene correctamente en ambos flujos (stock y operaciones).

⚠️ **Validación condicional:** La validación de "vehículo usado añadido" solo aplica cuando el tipo de operación es "Venta con toma de usado". Esta lógica debe implementarse tanto en el frontend (para feedback inmediato) como en el backend (para seguridad).

⚠️ **Reutilización de componentes:** Considerar extraer los campos comunes del vehículo en un componente reutilizable que pueda usarse tanto en el formulario de stock como en el de operaciones, para mantener la consistencia y facilitar el mantenimiento futuro.
