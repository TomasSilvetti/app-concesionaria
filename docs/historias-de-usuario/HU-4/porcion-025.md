# porcion-025 — Formulario de creación de vehículo — endpoint POST [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-024
**Tipo:** BACK
**Prerequisitos:** porcion-017

## Descripción

Crear el endpoint POST `/api/stock` que reciba los datos del nuevo vehículo, valide los campos obligatorios, y cree el registro en la base de datos. El vehículo se crea sin operación asociada (`operacionId` null) y pertenece al cliente autenticado.

## Ejemplo de uso

Al recibir POST `/api/stock` con body `{ clienteId: "abc", version: "1.8 XEi", color: "Rojo", kilometros: 50000, tipoIngreso: "Compra", precioRevista: 15000 }`, el endpoint valida los datos, crea el registro en la tabla Stock con `operacionId: null`, y devuelve status 201 con el vehículo creado.

## Criterios de aceptación

- [ ] El endpoint responde en la ruta POST `/api/stock`
- [ ] Requiere autenticación y valida que el usuario tenga acceso al cliente
- [ ] Valida que los campos obligatorios estén presentes: version, color, kilometros, tipoIngreso, precioRevista
- [ ] Crea el registro en la tabla Stock con `operacionId: null`
- [ ] Genera un ID único para el vehículo
- [ ] Establece `creadoEn` y `actualizadoEn` con la fecha actual
- [ ] Devuelve status 201 con el vehículo creado
- [ ] Devuelve status 400 si faltan campos obligatorios con mensaje descriptivo
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 500 con mensaje de error si falla la creación

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta cuando falta un campo obligatorio
- [ ] La función de validación acepta datos válidos
- [ ] Los valores numéricos se validan como números positivos
- [ ] El campo `tipoIngreso` se valida contra valores permitidos (Compra, Parte de pago, Consignación)

### Pruebas de integración

- [ ] POST `/api/stock` con datos válidos devuelve status 201 y crea el registro en la BD
- [ ] El vehículo creado tiene `operacionId: null`
- [ ] El vehículo creado pertenece al `clienteId` especificado
- [ ] POST `/api/stock` sin campo obligatorio devuelve status 400 con mensaje de error
- [ ] POST `/api/stock` con kilometros negativo devuelve status 400
- [ ] POST `/api/stock` sin autenticación devuelve status 401
- [ ] El vehículo creado aparece en el listado GET `/api/stock`
