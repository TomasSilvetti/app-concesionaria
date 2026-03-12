# porcion-001 — Migración de modelo User [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Modificar el modelo User en el schema de Prisma para soportar autenticación con username, roles de administrador y usuario, y asociación opcional con clientes. Incluye cambiar el campo de autenticación de email a username, agregar campo de permisos JSON, y hacer el clienteId opcional para administradores.

## Ejemplo de uso

Después de ejecutar la migración, el modelo User permite crear usuarios administradores sin cliente asociado y usuarios normales vinculados a un cliente específico. Los usuarios se autentican con username en lugar de email.

## Criterios de aceptación

- [ ] El modelo User tiene campo `username` único en lugar de `email` único
- [ ] El modelo User tiene campo `email` opcional para comunicaciones futuras
- [ ] El campo `rol` soporta valores "admin" y "usuario" con default "usuario"
- [ ] El campo `clienteId` es nullable para permitir administradores sin cliente
- [ ] El modelo incluye campo `permisos` tipo Json nullable para sistema futuro
- [ ] La migración se ejecuta sin errores y preserva datos existentes si los hay
- [ ] Los índices están correctamente definidos en username y clienteId

## Pruebas

### Pruebas unitarias

- [ ] El schema de Prisma compila sin errores después de los cambios
- [ ] El campo username tiene constraint de unicidad
- [ ] El campo clienteId acepta valores null
- [ ] El campo permisos acepta valores JSON o null
- [ ] El campo rol tiene valor default "usuario"

### Pruebas de integración

- [ ] La migración se ejecuta exitosamente con `npx prisma migrate dev`
- [ ] Se puede crear un usuario administrador con clienteId null
- [ ] Se puede crear un usuario normal con clienteId válido
- [ ] La relación con la tabla Client funciona correctamente con onDelete Cascade
- [ ] Los índices mejoran el rendimiento de queries por username y clienteId
