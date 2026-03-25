import { randomUUID } from "crypto";
import { db } from "./db";

// ─── Client ───────────────────────────────────────────────────────────────────

export async function seedCliente(params?: {
  id?: string;
  nombre?: string;
  activo?: boolean;
  modulos?: object;
}) {
  return db.client.create({
    data: {
      id: params?.id ?? randomUUID(),
      nombre: params?.nombre ?? "Cliente Test",
      activo: params?.activo ?? true,
      modulos: params?.modulos ?? {},
      actualizadoEn: new Date(),
    },
  });
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function seedUser(params?: {
  id?: string;
  username?: string;
  nombre?: string;
  password?: string;
  rol?: string;
  clienteId?: string;
  activo?: boolean;
}) {
  return db.user.create({
    data: {
      id: params?.id ?? randomUUID(),
      username: params?.username ?? `user_${randomUUID().slice(0, 8)}`,
      nombre: params?.nombre ?? "Usuario Test",
      // bcrypt hash de "password123" pre-calculado para no depender de bcrypt en seeds
      password:
        params?.password ??
        "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      rol: params?.rol ?? "usuario",
      clienteId: params?.clienteId ?? null,
      activo: params?.activo ?? true,
      actualizadoEn: new Date(),
    },
  });
}

// ─── VehicleBrand ─────────────────────────────────────────────────────────────

export async function seedVehicleBrand(params?: {
  id?: string;
  clienteId?: string;
  nombre?: string;
}) {
  const clienteId = params?.clienteId ?? (await seedCliente()).id;
  return db.vehicleBrand.create({
    data: {
      id: params?.id ?? randomUUID(),
      clienteId,
      nombre: params?.nombre ?? `Marca_${randomUUID().slice(0, 6)}`,
      actualizadoEn: new Date(),
    },
  });
}

// ─── VehicleCategory ──────────────────────────────────────────────────────────

export async function seedVehicleCategory(params?: {
  id?: string;
  clienteId?: string;
  nombre?: string;
}) {
  const clienteId = params?.clienteId ?? (await seedCliente()).id;
  return db.vehicleCategory.create({
    data: {
      id: params?.id ?? randomUUID(),
      clienteId,
      nombre: params?.nombre ?? `Categoria_${randomUUID().slice(0, 6)}`,
    },
  });
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export async function seedVehiculo(params?: {
  id?: string;
  clienteId?: string;
  marcaId?: string;
  categoriaId?: string;
  modelo?: string;
  anio?: number;
  estado?: string;
}) {
  const clienteId = params?.clienteId ?? (await seedCliente()).id;
  const marcaId = params?.marcaId ?? (await seedVehicleBrand({ clienteId })).id;
  const categoriaId =
    params?.categoriaId ?? (await seedVehicleCategory({ clienteId })).id;

  return db.vehicle.create({
    data: {
      id: params?.id ?? randomUUID(),
      clienteId,
      marcaId,
      categoriaId,
      modelo: params?.modelo ?? "Modelo Test",
      anio: params?.anio ?? 2020,
      estado: params?.estado ?? "disponible",
      actualizadoEn: new Date(),
    },
  });
}

// ─── PaymentMethod ────────────────────────────────────────────────────────────

export async function seedPaymentMethod(params?: {
  id?: string;
  clienteId?: string;
  nombre?: string;
}) {
  const clienteId = params?.clienteId ?? (await seedCliente()).id;
  return db.paymentMethod.create({
    data: {
      id: params?.id ?? randomUUID(),
      clienteId,
      nombre: params?.nombre ?? `MetodoPago_${randomUUID().slice(0, 6)}`,
    },
  });
}

// ─── Category (de gastos) ─────────────────────────────────────────────────────

export async function seedCategory(params?: {
  id?: string;
  clienteId?: string;
  nombre?: string;
}) {
  const clienteId = params?.clienteId ?? (await seedCliente()).id;
  return db.category.create({
    data: {
      id: params?.id ?? randomUUID(),
      clienteId,
      nombre: params?.nombre ?? `CategoriaGasto_${randomUUID().slice(0, 6)}`,
    },
  });
}

// ─── Origin ───────────────────────────────────────────────────────────────────

export async function seedOrigin(params?: {
  id?: string;
  clienteId?: string;
  nombre?: string;
}) {
  const clienteId = params?.clienteId ?? (await seedCliente()).id;
  return db.origin.create({
    data: {
      id: params?.id ?? randomUUID(),
      clienteId,
      nombre: params?.nombre ?? `Origen_${randomUUID().slice(0, 6)}`,
    },
  });
}

// ─── Operation ────────────────────────────────────────────────────────────────
// Crea automáticamente las dependencias (marca, categoría, vehículo) si no se pasan.

export async function seedOperacion(params?: {
  id?: string;
  clienteId?: string;
  marcaId?: string;
  categoriaId?: string;
  vehiculoVendidoId?: string;
  idOperacion?: string;
  tipoOperacion?: string;
  estado?: string;
  precioVentaTotal?: number;
  ingresosBrutos?: number;
  comision?: number;
  ingresosNetos?: number;
  nombreComprador?: string;
}) {
  const clienteId = params?.clienteId ?? (await seedCliente()).id;
  const marcaId =
    params?.marcaId ?? (await seedVehicleBrand({ clienteId })).id;
  const categoriaId =
    params?.categoriaId ?? (await seedVehicleCategory({ clienteId })).id;
  const vehiculoVendidoId =
    params?.vehiculoVendidoId ??
    (await seedVehiculo({ clienteId, marcaId, categoriaId })).id;

  return db.operation.create({
    data: {
      id: params?.id ?? randomUUID(),
      idOperacion: params?.idOperacion ?? `OP-${randomUUID().slice(0, 8)}`,
      clienteId,
      marcaId,
      categoriaId,
      vehiculoVendidoId,
      tipoOperacion: params?.tipoOperacion ?? "venta",
      estado: params?.estado ?? "open",
      fechaInicio: new Date(),
      precioVentaTotal: params?.precioVentaTotal ?? 10000,
      ingresosBrutos: params?.ingresosBrutos ?? 10000,
      comision: params?.comision ?? 500,
      gastosAsociados: 0,
      ingresosNetos: params?.ingresosNetos ?? 9500,
      nombreComprador: params?.nombreComprador ?? "Comprador Test",
      actualizadoEn: new Date(),
    },
  });
}
