import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const CLIENTE_ID = "cliente-prueba-001";

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // === USUARIOS ===
  const adminPassword = await bcrypt.hash("admin123", 10);
  const usuarioPassword = await bcrypt.hash("usuario123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: "user-admin-001",
      username: "admin",
      password: adminPassword,
      nombre: "Administrador del Sistema",
      rol: "admin",
      clienteId: null,
      activo: true,
      actualizadoEn: new Date(),
    },
  });

  // === CLIENTE ===
  await prisma.client.upsert({
    where: { id: CLIENTE_ID },
    update: {},
    create: {
      id: CLIENTE_ID,
      nombre: "Concesionaria Demo",
      activo: true,
      modulos: { operaciones: true, stock: true, gastos: true, reportes: true },
      actualizadoEn: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { username: "usuario1" },
    update: {},
    create: {
      id: "user-usuario-001",
      username: "usuario1",
      password: usuarioPassword,
      nombre: "Usuario de Prueba",
      rol: "usuario",
      clienteId: CLIENTE_ID,
      activo: true,
      actualizadoEn: new Date(),
    },
  });

  console.log("✅ Usuarios y cliente creados");

  // === MARCAS → capturamos IDs reales de la DB ===
  const marcaNombres = ["Toyota", "Ford", "Chevrolet", "Volkswagen", "Honda", "Renault", "Peugeot"];
  const marcaId: Record<string, string> = {};

  for (const nombre of marcaNombres) {
    const m = await prisma.vehicleBrand.upsert({
      where: { clienteId_nombre: { clienteId: CLIENTE_ID, nombre } },
      update: {},
      create: { id: `marca-${nombre.toLowerCase()}-001`, clienteId: CLIENTE_ID, nombre, actualizadoEn: new Date() },
    });
    marcaId[nombre] = m.id;
  }

  console.log("✅ Marcas creadas");

  // === CATEGORÍAS DE VEHÍCULOS → capturamos IDs reales ===
  const catVNombres = ["Sedan", "Hatchback", "SUV", "Pickup", "Coupe"];
  const catVId: Record<string, string> = {};

  for (const nombre of catVNombres) {
    const c = await prisma.vehicleCategory.upsert({
      where: { clienteId_nombre: { clienteId: CLIENTE_ID, nombre } },
      update: {},
      create: { id: `catv-${nombre.toLowerCase()}-001`, clienteId: CLIENTE_ID, nombre },
    });
    catVId[nombre] = c.id;
  }

  console.log("✅ Categorías de vehículos creadas");

  // === TIPOS DE OPERACIÓN → capturamos IDs reales ===
  const tipoVentaStock = await prisma.operationType.upsert({
    where: { clienteId_nombre: { clienteId: CLIENTE_ID, nombre: "Venta desde stock" } },
    update: {},
    create: { id: "tipo-venta-stock-001", clienteId: CLIENTE_ID, nombre: "Venta desde stock" },
  });
  const tipoVenta0km = await prisma.operationType.upsert({
    where: { clienteId_nombre: { clienteId: CLIENTE_ID, nombre: "Venta 0km" } },
    update: {},
    create: { id: "tipo-venta-0km-001", clienteId: CLIENTE_ID, nombre: "Venta 0km" },
  });

  console.log("✅ Tipos de operación creados");

  // === ORÍGENES DE GASTOS → capturamos IDs reales ===
  const origenNombres = ["Caja chica", "Transferencia bancaria", "Tarjeta de crédito"];
  const origenId: Record<string, string> = {};

  for (const nombre of origenNombres) {
    const slug = nombre.toLowerCase().replace(/ /g, "-").replace(/é/g, "e");
    const o = await prisma.origin.upsert({
      where: { clienteId_nombre: { clienteId: CLIENTE_ID, nombre } },
      update: {},
      create: { id: `origen-${slug}-001`, clienteId: CLIENTE_ID, nombre },
    });
    origenId[nombre] = o.id;
  }

  console.log("✅ Orígenes de gastos creados");

  // === CATEGORÍAS DE GASTOS → capturamos IDs reales ===
  const catGNombres = ["Mantenimiento", "Publicidad", "Administrativo", "Servicios", "Otros"];
  const catGId: Record<string, string> = {};

  for (const nombre of catGNombres) {
    const slug = nombre.toLowerCase().substring(0, 4);
    const c = await prisma.category.upsert({
      where: { clienteId_nombre: { clienteId: CLIENTE_ID, nombre } },
      update: {},
      create: { id: `catg-${slug}-001`, clienteId: CLIENTE_ID, nombre },
    });
    catGId[nombre] = c.id;
  }

  console.log("✅ Categorías de gastos creadas");

  // === VEHÍCULOS ===
  // vehiculo-003, 006, 008 → estado "vendido" (operaciones cerradas)
  // vehiculo-001, 004 → estado "disponible" (operaciones abiertas)
  const vehiculos = [
    { id: "vehiculo-001", marcaNombre: "Toyota",     catNombre: "Sedan",    modelo: "Corolla", anio: 2021, patente: "AB123CD", version: "XEI CVT",      color: "Blanco",     km: 45000, revista: 18500, oferta: 17200,  estado: "disponible" },
    { id: "vehiculo-002", marcaNombre: "Ford",       catNombre: "Pickup",   modelo: "Ranger",  anio: 2020, patente: "EF456GH", version: "XLS 4x4",      color: "Gris",       km: 62000, revista: 25000, oferta: 23500,  estado: "disponible" },
    { id: "vehiculo-003", marcaNombre: "Chevrolet",  catNombre: "Sedan",    modelo: "Cruze",   anio: 2019, patente: "IJ789KL", version: "LTZ",           color: "Negro",      km: 78000, revista: 15000, oferta: null,   estado: "vendido"    },
    { id: "vehiculo-004", marcaNombre: "Volkswagen", catNombre: "Hatchback",modelo: "Golf",    anio: 2022, patente: "MN012OP", version: "Highline",      color: "Azul",       km: 28000, revista: 22000, oferta: 21000,  estado: "disponible" },
    { id: "vehiculo-005", marcaNombre: "Honda",      catNombre: "SUV",      modelo: "HR-V",    anio: 2021, patente: "QR345ST", version: "EXL",           color: "Rojo",       km: 33000, revista: 20000, oferta: 19500,  estado: "disponible" },
    { id: "vehiculo-006", marcaNombre: "Renault",    catNombre: "Hatchback",modelo: "Sandero", anio: 2020, patente: "UV678WX", version: "Stepway",       color: "Naranja",    km: 55000, revista: 12000, oferta: null,   estado: "vendido"    },
    { id: "vehiculo-007", marcaNombre: "Peugeot",    catNombre: "Hatchback",modelo: "208",     anio: 2022, patente: "YZ901AB", version: "Allure Pack",   color: "Plata",      km: 18000, revista: 16000, oferta: 15500,  estado: "disponible" },
    { id: "vehiculo-008", marcaNombre: "Toyota",     catNombre: "Pickup",   modelo: "Hilux",   anio: 2021, patente: "CD234EF", version: "SRX 4x4",      color: "Blanco",     km: 40000, revista: 32000, oferta: null,   estado: "vendido"    },
    { id: "vehiculo-009", marcaNombre: "Ford",       catNombre: "Sedan",    modelo: "Focus",   anio: 2019, patente: "GH567IJ", version: "SE",            color: "Gris oscuro",km: 90000, revista: 14500, oferta: 13800,  estado: "disponible" },
    { id: "vehiculo-010", marcaNombre: "Volkswagen", catNombre: "Hatchback",modelo: "Polo",    anio: 2023, patente: "KL890MN", version: "Trendline",     color: "Blanco",     km:  5000, revista: 19000, oferta: 18500,  estado: "disponible", notas: "Ingresó como toma en OP-2026-002" },
    { id: "vehiculo-011", marcaNombre: "Honda",      catNombre: "Sedan",    modelo: "Civic",   anio: 2020, patente: "OP123QR", version: "Sport",         color: "Azul marino",km: 52000, revista: 21000, oferta: 20000,  estado: "disponible" },
    { id: "vehiculo-012", marcaNombre: "Renault",    catNombre: "SUV",      modelo: "Duster",  anio: 2021, patente: "ST456UV", version: "Intens 4x4",   color: "Verde",      km: 37000, revista: 17500, oferta: 16800,  estado: "disponible" },
  ];

  for (const v of vehiculos) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: { estado: v.estado, precioRevista: v.revista, precioOferta: v.oferta },
      create: {
        id: v.id,
        clienteId: CLIENTE_ID,
        marcaId: marcaId[v.marcaNombre],
        modelo: v.modelo,
        anio: v.anio,
        categoriaId: catVId[v.catNombre],
        patente: v.patente,
        version: v.version,
        color: v.color,
        kilometros: v.km,
        precioRevista: v.revista,
        precioOferta: v.oferta,
        estado: v.estado,
        notasGenerales: v.notas ?? null,
        actualizadoEn: new Date(),
      },
    });
  }

  console.log("✅ Vehículos creados (12)");

  // === OPERACIONES ===
  // ingresosBrutos = precioVentaTotal - (precioToma ?? 0)
  // ingresosNetos  = ingresosBrutos - comision - gastosAsociados

  // OP-2025-001 — Chevrolet Cruze | cerrada | sin toma
  const op1 = await prisma.operation.upsert({
    where: { clienteId_idOperacion: { clienteId: CLIENTE_ID, idOperacion: "OP-2025-001" } },
    update: {},
    create: {
      id: "op-001",
      idOperacion: "OP-2025-001",
      clienteId: CLIENTE_ID,
      fechaInicio: new Date("2025-12-01"),
      fechaVenta: new Date("2025-12-16"),
      vehiculoVendidoId: "vehiculo-003",
      precioVentaTotal: 15500,
      ingresosBrutos: 15500,
      comision: 465,
      gastosAsociados: 200,
      ingresosNetos: 14835,
      precioToma: null,
      nombreComprador: "Roberto Sánchez",
      estado: "cerrada",
      marcaId: marcaId["Chevrolet"],
      categoriaId: catVId["Sedan"],
      tipoOperacionId: tipoVentaStock.id,
      diasVenta: 15,
      actualizadoEn: new Date("2025-12-16"),
    },
  });

  // OP-2026-001 — Renault Sandero | cerrada | sin toma
  const op2 = await prisma.operation.upsert({
    where: { clienteId_idOperacion: { clienteId: CLIENTE_ID, idOperacion: "OP-2026-001" } },
    update: {},
    create: {
      id: "op-002",
      idOperacion: "OP-2026-001",
      clienteId: CLIENTE_ID,
      fechaInicio: new Date("2026-01-05"),
      fechaVenta: new Date("2026-01-20"),
      vehiculoVendidoId: "vehiculo-006",
      precioVentaTotal: 12500,
      ingresosBrutos: 12500,
      comision: 375,
      gastosAsociados: 150,
      ingresosNetos: 11975,
      precioToma: null,
      nombreComprador: "Laura Fernández",
      estado: "cerrada",
      marcaId: marcaId["Renault"],
      categoriaId: catVId["Hatchback"],
      tipoOperacionId: tipoVentaStock.id,
      diasVenta: 15,
      actualizadoEn: new Date("2026-01-20"),
    },
  });

  // OP-2026-002 — Toyota Hilux | cerrada | con toma VW Polo ($5.000)
  const op3 = await prisma.operation.upsert({
    where: { clienteId_idOperacion: { clienteId: CLIENTE_ID, idOperacion: "OP-2026-002" } },
    update: {},
    create: {
      id: "op-003",
      idOperacion: "OP-2026-002",
      clienteId: CLIENTE_ID,
      fechaInicio: new Date("2026-02-01"),
      fechaVenta: new Date("2026-02-28"),
      vehiculoVendidoId: "vehiculo-008",
      precioVentaTotal: 33000,
      ingresosBrutos: 28000,
      comision: 840,
      gastosAsociados: 500,
      ingresosNetos: 26660,
      precioToma: 5000,
      nombreComprador: "Carlos Rodríguez",
      estado: "cerrada",
      marcaId: marcaId["Toyota"],
      categoriaId: catVId["Pickup"],
      tipoOperacionId: tipoVentaStock.id,
      diasVenta: 27,
      actualizadoEn: new Date("2026-02-28"),
    },
  });

  // OP-2026-003 — Toyota Corolla | abierta | sin toma
  const op4 = await prisma.operation.upsert({
    where: { clienteId_idOperacion: { clienteId: CLIENTE_ID, idOperacion: "OP-2026-003" } },
    update: {},
    create: {
      id: "op-004",
      idOperacion: "OP-2026-003",
      clienteId: CLIENTE_ID,
      fechaInicio: new Date("2026-03-01"),
      fechaVenta: null,
      vehiculoVendidoId: "vehiculo-001",
      precioVentaTotal: 18500,
      ingresosBrutos: 18500,
      comision: 555,
      gastosAsociados: 200,
      ingresosNetos: 17745,
      precioToma: null,
      nombreComprador: "Juan Pérez",
      estado: "abierta",
      marcaId: marcaId["Toyota"],
      categoriaId: catVId["Sedan"],
      tipoOperacionId: tipoVentaStock.id,
      diasVenta: null,
      actualizadoEn: new Date("2026-03-01"),
    },
  });

  // OP-2026-004 — VW Golf | abierta | 0km
  const op5 = await prisma.operation.upsert({
    where: { clienteId_idOperacion: { clienteId: CLIENTE_ID, idOperacion: "OP-2026-004" } },
    update: {},
    create: {
      id: "op-005",
      idOperacion: "OP-2026-004",
      clienteId: CLIENTE_ID,
      fechaInicio: new Date("2026-03-10"),
      fechaVenta: null,
      vehiculoVendidoId: "vehiculo-004",
      precioVentaTotal: 22000,
      ingresosBrutos: 22000,
      comision: 660,
      gastosAsociados: 0,
      ingresosNetos: 21340,
      precioToma: null,
      nombreComprador: "María González",
      estado: "abierta",
      marcaId: marcaId["Volkswagen"],
      categoriaId: catVId["Hatchback"],
      tipoOperacionId: tipoVenta0km.id,
      diasVenta: null,
      actualizadoEn: new Date("2026-03-10"),
    },
  });

  console.log("✅ Operaciones creadas (5)");

  // === INTERCAMBIOS (toma) ===
  // Op-003 (Hilux) ← VW Polo valuado en $5.000
  await prisma.operationExchange.upsert({
    where: { operacionId_stockId: { operacionId: op3.id, stockId: "vehiculo-010" } },
    update: {},
    create: {
      id: "exchange-001",
      operacionId: op3.id,
      stockId: "vehiculo-010",
      precioNegociado: 5000,
      actualizadoEn: new Date("2026-02-28"),
    },
  });

  console.log("✅ Intercambios creados");

  // === GASTOS ===
  // Totales por operación:
  //   op1: 120 + 80 = 200  ✓ (gastosAsociados = 200)
  //   op2:  90 + 60 = 150  ✓ (gastosAsociados = 150)
  //   op3: 350 + 150 = 500 ✓ (gastosAsociados = 500)
  //   op4: 200             ✓ (gastosAsociados = 200)
  //   op5: 0               ✓ (gastosAsociados = 0)
  const gastos = [
    // Op1 (Cruze, cerrada)
    { id: "gasto-001", opId: op1.id, desc: "Preparación y detailing del vehículo",    cat: "Mantenimiento", monto: 120, origen: "Caja chica",           fecha: "2025-12-10" },
    { id: "gasto-002", opId: op1.id, desc: "Publicación en portales web",              cat: "Publicidad",    monto:  80, origen: "Tarjeta de crédito",   fecha: "2025-12-05" },
    // Op2 (Sandero, cerrada)
    { id: "gasto-003", opId: op2.id, desc: "Detailing completo",                       cat: "Mantenimiento", monto:  90, origen: "Caja chica",           fecha: "2026-01-08" },
    { id: "gasto-004", opId: op2.id, desc: "Publicación premium MercadoAutos",         cat: "Publicidad",    monto:  60, origen: "Tarjeta de crédito",   fecha: "2026-01-07" },
    // Op3 (Hilux, cerrada)
    { id: "gasto-005", opId: op3.id, desc: "Service completo + cambio de aceite",      cat: "Mantenimiento", monto: 350, origen: "Transferencia bancaria",fecha: "2026-02-05" },
    { id: "gasto-006", opId: op3.id, desc: "Fotografía profesional",                   cat: "Publicidad",    monto: 150, origen: "Caja chica",           fecha: "2026-02-03" },
    // Op4 (Corolla, abierta)
    { id: "gasto-007", opId: op4.id, desc: "Revisión mecánica previa a la venta",      cat: "Mantenimiento", monto: 200, origen: "Transferencia bancaria",fecha: "2026-03-03" },
    // Generales (sin operación)
    { id: "gasto-008", opId: null,   desc: "Alquiler del local - Febrero",             cat: "Administrativo",monto:1200, origen: "Transferencia bancaria",fecha: "2026-02-01" },
    { id: "gasto-009", opId: null,   desc: "Internet y telefonía - Febrero",           cat: "Servicios",     monto:  85, origen: "Tarjeta de crédito",   fecha: "2026-02-05" },
    { id: "gasto-010", opId: null,   desc: "Publicidad en redes sociales - Febrero",   cat: "Publicidad",    monto: 250, origen: "Tarjeta de crédito",   fecha: "2026-02-10" },
    { id: "gasto-011", opId: null,   desc: "Alquiler del local - Marzo",               cat: "Administrativo",monto:1200, origen: "Transferencia bancaria",fecha: "2026-03-01" },
    { id: "gasto-012", opId: null,   desc: "Internet y telefonía - Marzo",             cat: "Servicios",     monto:  85, origen: "Tarjeta de crédito",   fecha: "2026-03-05" },
    { id: "gasto-013", opId: null,   desc: "Publicidad en redes sociales - Marzo",     cat: "Publicidad",    monto: 300, origen: "Tarjeta de crédito",   fecha: "2026-03-01" },
    { id: "gasto-014", opId: null,   desc: "Material de limpieza y mantenimiento",     cat: "Otros",         monto:  45, origen: "Caja chica",           fecha: "2026-03-08" },
    { id: "gasto-015", opId: null,   desc: "Servicio de limpieza del showroom",        cat: "Servicios",     monto: 200, origen: "Transferencia bancaria",fecha: "2026-03-12" },
  ];

  for (const g of gastos) {
    await prisma.expense.upsert({
      where: { id: g.id },
      update: {},
      create: {
        id: g.id,
        clienteId: CLIENTE_ID,
        operacionId: g.opId,
        descripcion: g.desc,
        categoriaId: catGId[g.cat],
        monto: g.monto,
        origenId: origenId[g.origen],
        fecha: new Date(g.fecha),
        actualizadoEn: new Date(),
      },
    });
  }

  console.log("✅ Gastos creados (15)");

  // === PENDIENTES ===
  const pendientes = [
    { id: "pend-001", nombreCliente: "Juan Pérez",     detalle: "Enviar documentación VTV - Toyota Corolla (OP-2026-003)",  completado: false },
    { id: "pend-002", nombreCliente: "María González", detalle: "Coordinar fecha de entrega - VW Golf (OP-2026-004)",        completado: false },
    { id: "pend-003", nombreCliente: "Carlos Rodríguez",detalle: "Verificar transferencia de dominio - Toyota Hilux",        completado: true  },
    { id: "pend-004", nombreCliente: "Ana Martínez",   detalle: "Llamar para consulta Honda HR-V",                          completado: false },
  ];

  for (const p of pendientes) {
    await prisma.pendiente.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, clienteId: CLIENTE_ID, nombreCliente: p.nombreCliente, detalle: p.detalle, completado: p.completado, actualizadoEn: new Date() },
    });
  }

  console.log("✅ Pendientes creados (4)");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📋 Credenciales de prueba:");
  console.log("   Admin:   username=admin,    password=admin123");
  console.log("   Usuario: username=usuario1, password=usuario123");
  console.log("\n📊 Datos cargados:");
  console.log("   - 7 marcas  |  5 categorías de vehículos");
  console.log("   - 12 vehículos (3 vendidos, 9 disponibles)");
  console.log("   - 5 operaciones: OP-2025-001, OP-2026-001..004");
  console.log("     · 3 cerradas (Cruze, Sandero, Hilux)");
  console.log("     · 2 abiertas (Corolla, Golf)");
  console.log("     · 1 con toma de vehículo (Hilux ← VW Polo $5.000)");
  console.log("   - 15 gastos (7 en operaciones, 8 generales)");
  console.log("   - 4 pendientes");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
