# porcion-011 — Tabla de ROI por inversor — vista [FRONT]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-012
**Tipo:** FRONT
**Prerequisitos:** porcion-002
**Estado:** 🔄 En progreso

## Descripción

Crear la sección de ROI por inversor con una tabla que lista cada inversor con su monto aportado, retorno obtenido y porcentaje de ROI en las operaciones del período seleccionado. Incluye estado vacío y skeleton de carga.

## Ejemplo de uso

El usuario ve una tabla con columnas: Inversor, Monto Aportado, Retorno, ROI%. Cada fila representa un inversor. Si no hay inversiones en el período, aparece el mensaje "No hay inversiones registradas en este período".

## Criterios de aceptación

- [ ] La tabla muestra las columnas: Inversor, Monto Aportado, Retorno, ROI%
- [ ] Los montos se muestran formateados en pesos (ej: "$1.500.000")
- [ ] El ROI% se muestra con dos decimales y el símbolo % (ej: "23.45%")
- [ ] Cuando no hay datos, se muestra el mensaje "No hay inversiones registradas en este período"
- [ ] Mientras carga, se muestra un skeleton en lugar de la tabla
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con datos de 3 inversores, la tabla renderiza exactamente 3 filas
- [ ] Los montos se formatean correctamente con separadores de miles
- [ ] Con array de datos vacío, se renderiza el mensaje "No hay inversiones registradas en este período"
- [ ] En estado de carga, se renderiza el skeleton en lugar de la tabla

### Pruebas de integración

- [ ] Al cambiar el período global, el componente llama al endpoint de ROI con los nuevos parámetros `desde` y `hasta`
- [ ] Si el endpoint devuelve error, se muestra el estado vacío sin romper el resto del dashboard
- [ ] Al recibir los datos, la tabla se actualiza y el skeleton desaparece
