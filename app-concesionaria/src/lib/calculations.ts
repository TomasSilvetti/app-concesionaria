/**
 * Calcula los ingresos netos descontando los gastos asociados a la operación.
 */
export function calcularIngresosNetos(
  ingresosBrutos: number,
  gastosAsociados: number
): number {
  return ingresosBrutos - gastosAsociados;
}

/**
 * Calcula la comisión como porcentaje de los ingresos netos sobre el precio de venta.
 * Retorna 0 si el precio de venta es 0 para evitar división por cero.
 */
export function calcularComision(
  precioVentaTotal: number,
  ingresosNetos: number
): number {
  if (precioVentaTotal === 0) return 0;
  return (ingresosNetos / precioVentaTotal) * 100;
}
