# porcion-008 — Endpoint de rotación mensual [BACK]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-007
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Crear el endpoint que calcula el índice de rotación mensual (operaciones cerradas / stock disponible) para cada mes dentro del rango de fechas solicitado, devolviendo un array de puntos mes a mes.

## Ejemplo de uso

El frontend llama a `GET /api/cliente/metricas/rotacion?desde=2026-01-01&hasta=2026-04-30` y recibe un array con 4 objetos, uno por mes, cada uno con el nombre del mes y su índice de rotación.

## Criterios de aceptación

- [ ] El endpoint acepta los parámetros `desde` y `hasta` como fechas ISO en la query string
- [ ] Devuelve un array de objetos con los campos `mes` (ej: "2026-01") y `rotacion` (número con dos decimales)
- [ ] `rotacion` se calcula como `operaciones cerradas en el mes / stock disponible a fin de mes`
- [ ] Si el stock disponible es 0 en un mes, el índice de ese mes se devuelve como 0 (sin división por cero)
- [ ] Solo se incluyen meses completos o parciales dentro del rango `desde`-`hasta`
- [ ] Todas las consultas se filtran por `clienteId` del usuario autenticado
- [ ] Si no hay datos, devuelve un array vacío

## Pruebas

### Pruebas unitarias

- [ ] Con 5 operaciones cerradas y 20 vehículos disponibles en un mes, devuelve `rotacion = 0.25`
- [ ] Con stock disponible = 0 en un mes, devuelve `rotacion = 0` sin error
- [ ] El array resultante contiene exactamente un objeto por mes dentro del rango

### Pruebas de integración

- [ ] Con un rango de 3 meses con datos, el endpoint devuelve 3 objetos en el array con valores correctos
- [ ] Con período sin operaciones cerradas, el endpoint devuelve el array con `rotacion = 0` en cada mes
- [ ] Un usuario no autenticado recibe 401
- [ ] Los datos pertenecen únicamente al `clienteId` del usuario autenticado
