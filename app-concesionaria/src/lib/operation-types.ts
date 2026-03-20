export const OPERATION_TYPES = [
  { id: "venta-0km", nombre: "Venta 0km" },
  { id: "venta-stock", nombre: "Venta desde stock" },
] as const;

export type OperationTypeId = typeof OPERATION_TYPES[number]["id"];
export type OperationTypeName = typeof OPERATION_TYPES[number]["nombre"];

export const OPERATION_TYPE_NAMES: OperationTypeName[] = OPERATION_TYPES.map(
  (t) => t.nombre
);

export function getOperationTypeByName(nombre: string): typeof OPERATION_TYPES[number] | undefined {
  return OPERATION_TYPES.find((t) => t.nombre === nombre);
}

export function isValidOperationTypeName(nombre: string): nombre is OperationTypeName {
  return OPERATION_TYPE_NAMES.includes(nombre as OperationTypeName);
}
