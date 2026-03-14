# porcion-021 — Ordenamiento por columnas — lógica en endpoint [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-020
**Tipo:** BACK
**Prerequisitos:** porcion-019

## Descripción

Implementar la lógica de ordenamiento en el endpoint GET `/api/stock` para que acepte los parámetros `orderBy` (nombre de columna) y `order` (asc/desc) y devuelva los vehículos ordenados según esos criterios usando las capacidades de Prisma.

## Ejemplo de uso

Al recibir GET `/api/stock?clienteId=abc&orderBy=precioRevista&order=desc`, el endpoint ejecuta una query de Prisma con `orderBy: { precioRevista: 'desc' }` y devuelve los vehículos ordenados de mayor a menor precio.

## Criterios de aceptación

- [ ] El endpoint acepta el parámetro `orderBy` con valores válidos: marca, modelo, version, color, kilometros, precioRevista, precioOferta
- [ ] El endpoint acepta el parámetro `order` con valores: asc, desc
- [ ] Si no se especifica ordenamiento, devuelve los vehículos ordenados por fecha de creación descendente (más recientes primero)
- [ ] Si se especifica un `orderBy` inválido, devuelve error 400 con mensaje descriptivo
- [ ] La query de Prisma aplica correctamente el ordenamiento solicitado
- [ ] El ordenamiento funciona en combinación con filtros

## Pruebas

### Pruebas unitarias

- [ ] La función de construcción de query incluye correctamente el `orderBy` de Prisma
- [ ] Si `orderBy` es inválido, se lanza un error de validación
- [ ] Si `order` no es asc ni desc, se usa asc por defecto
- [ ] Si no hay parámetros de ordenamiento, se usa `creadoEn: desc` por defecto

### Pruebas de integración

- [ ] GET `/api/stock?clienteId=test&orderBy=marca&order=asc` devuelve vehículos ordenados alfabéticamente por marca
- [ ] GET `/api/stock?clienteId=test&orderBy=precioRevista&order=desc` devuelve vehículos ordenados de mayor a menor precio
- [ ] GET `/api/stock?clienteId=test&orderBy=kilometros&order=asc` devuelve vehículos ordenados de menor a mayor kilometraje
- [ ] GET `/api/stock?clienteId=test&orderBy=columnaInvalida` devuelve status 400
- [ ] GET `/api/stock?clienteId=test&marca=Toyota&orderBy=precio&order=asc` devuelve solo Toyotas ordenados por precio
