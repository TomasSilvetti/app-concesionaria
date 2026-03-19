# porcion-006 — Modal de carga de pago — componente reutilizable [FRONT]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-007
**Tipo:** FRONT
**Prerequisitos:** porcion-004

## Descripción

Crear el modal de carga de pago como componente independiente y reutilizable. Incluye los campos fecha, forma de pago (usando el dropdown de porcion-004), monto y nota (opcional). Tiene un botón secundario "Pagó todo" que pre-completa el monto con el `pendiente` restante de la operación, y un botón principal "Guardar".

## Ejemplo de uso

El componente se abre con `<PaymentModal operacionId="op-123" pendiente={150000} onSave={handleSave} onClose={handleClose} />`. El usuario completa fecha, elige "Efectivo" como forma de pago, hace clic en "Pagó todo" y el campo monto se llena automáticamente con `150000`. Al guardar, se llama a `onSave` con los datos del pago.

## Criterios de aceptación

- [ ] El modal muestra los campos: fecha (date picker), forma de pago (dropdown porcion-004), monto (numérico) y nota (textarea opcional)
- [ ] El botón "Pagó todo" pre-completa el campo monto con el valor de `pendiente` recibido por props; no guarda directamente
- [ ] El botón "Guardar" está deshabilitado si fecha, forma de pago o monto están vacíos
- [ ] Al hacer clic en "Guardar" con campos válidos, llama al callback `onSave` con `{ fecha, metodoPagoId, monto, nota }`
- [ ] El monto no puede ser negativo ni cero; muestra error de validación si se ingresa
- [ ] El modal puede cerrarse con el botón cancelar o haciendo clic fuera, llamando a `onClose`
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al hacer clic en "Pagó todo", el campo monto toma el valor de `pendiente` recibido por props
- [ ] El botón "Guardar" está deshabilitado cuando `monto` es 0 o está vacío
- [ ] El botón "Guardar" está deshabilitado cuando `metodoPagoId` no está seleccionado
- [ ] Ingresar monto negativo muestra mensaje de error y no habilita el botón "Guardar"
- [ ] La nota es opcional: el formulario se puede enviar sin completarla

### Pruebas de integración

- [ ] Al completar todos los campos obligatorios y hacer clic en "Guardar", se llama a `onSave` con el objeto correcto `{ fecha, metodoPagoId, monto, nota }`
- [ ] El dropdown de formas de pago carga las opciones disponibles al abrir el modal
