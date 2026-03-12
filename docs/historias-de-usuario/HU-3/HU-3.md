# HU-3: Sistema de Autenticación y Gestión de Usuarios

**Como** administrador del sistema o usuario de un cliente,
**quiero** poder autenticarme de forma segura y gestionar usuarios,
**para** acceder a las funcionalidades del sistema según mi rol y mantener el control de accesos.

## Descripción

Esta historia implementa el módulo de autenticación como base fundamental del sistema Nordem. Permite que usuarios y administradores inicien sesión de forma segura, mantengan sesiones persistentes, y que los administradores puedan crear y gestionar usuarios de diferentes clientes.

El sistema distingue entre dos tipos de usuarios:
- **Administrador**: Usuario global de la empresa dueña del sistema, con acceso a todos los clientes y capacidad de crear/gestionar usuarios
- **Usuario**: Pertenece a un cliente específico y solo puede acceder a los datos de su cliente

La historia incluye la pantalla de login, gestión de sesiones, creación de usuarios por parte del administrador, y una pantalla de perfil básica. El sistema de permisos granulares queda preparado para implementación futura, pero en esta versión todos los usuarios tienen acceso completo a las funcionalidades.

## Criterios de aceptación

- [ ] El sistema permite login con nombre de usuario y contraseña
- [ ] Las contraseñas se almacenan hasheadas con bcrypt (nunca en texto plano)
- [ ] El sistema valida que el usuario esté activo antes de permitir el acceso
- [ ] Las sesiones se mantienen activas (recordar sesión) con duración configurable
- [ ] El sistema muestra mensaje "Nombre de usuario o contraseña incorrectos" cuando las credenciales son inválidas
- [ ] Los usuarios marcados como `activo=false` no pueden iniciar sesión
- [ ] El administrador puede crear nuevos usuarios seleccionando el cliente al que pertenecerán
- [ ] El administrador puede activar/desactivar usuarios existentes
- [ ] Al desactivar un usuario, sus sesiones activas se invalidan inmediatamente
- [ ] El sistema valida que los nombres de usuario sean únicos
- [ ] Existe una pantalla de perfil donde el usuario puede ver su información básica
- [ ] El sistema redirige automáticamente al login cuando la sesión expira
- [ ] El usuario puede cerrar sesión manualmente desde cualquier pantalla
- [ ] Los administradores ven un dashboard global con acceso a todos los clientes
- [ ] Los usuarios normales solo ven datos de su cliente específico

## Flujos

### Flujo principal — Login exitoso

1. El usuario accede a la pantalla de login
2. El usuario ingresa su nombre de usuario y contraseña
3. El usuario hace clic en "Iniciar sesión"
4. El sistema valida las credenciales contra la base de datos
5. El sistema verifica que el usuario esté activo (`activo=true`)
6. El sistema crea una sesión persistente
7. Si el usuario es administrador: el sistema redirige al dashboard global
8. Si el usuario es normal: el sistema redirige al dashboard de su cliente
9. El usuario puede navegar por el sistema con su sesión activa

### Flujo alternativo 1 — Credenciales incorrectas

1. El usuario ingresa nombre de usuario o contraseña incorrectos
2. El usuario hace clic en "Iniciar sesión"
3. El sistema valida las credenciales y detecta que no coinciden
4. El sistema muestra el mensaje "Nombre de usuario o contraseña incorrectos"
5. El usuario permanece en la pantalla de login y puede reintentar

### Flujo alternativo 2 — Usuario inactivo

1. El usuario ingresa credenciales válidas pero su cuenta está marcada como `activo=false`
2. El usuario hace clic en "Iniciar sesión"
3. El sistema valida las credenciales (son correctas) pero detecta que `activo=false`
4. El sistema rechaza el acceso y muestra el mensaje "Tu cuenta está inactiva. Contactá al administrador"
5. El usuario no puede acceder al sistema

### Flujo alternativo 3 — Sesión expirada

1. El usuario está trabajando en el sistema con una sesión activa
2. La sesión expira por inactividad (duración configurable, ej: 7 días)
3. El usuario intenta realizar una acción (navegar, guardar datos, etc.)
4. El sistema detecta que la sesión es inválida
5. El sistema redirige automáticamente a la pantalla de login
6. El sistema muestra el mensaje "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente"

### Flujo secundario 1 — Administrador crea usuario

1. El administrador inicia sesión y accede a la pantalla de gestión de usuarios
2. El administrador hace clic en "Crear nuevo usuario"
3. El administrador completa el formulario:
   - Nombre de usuario (único en el sistema)
   - Nombre completo
   - Contraseña
   - Rol: "admin" o "usuario"
   - Cliente: selecciona de un dropdown (solo si el rol es "usuario")
4. El administrador hace clic en "Guardar"
5. El sistema valida que el nombre de usuario no esté duplicado
6. El sistema valida que si el rol es "usuario", se haya seleccionado un cliente
7. El sistema crea el usuario con `activo=true` por defecto
8. El sistema muestra mensaje de confirmación "Usuario creado exitosamente"
9. El nuevo usuario aparece en la lista de usuarios
10. El nuevo usuario puede iniciar sesión inmediatamente con sus credenciales

### Flujo secundario 2 — Administrador desactiva usuario

1. El administrador accede a la pantalla de gestión de usuarios
2. El administrador busca y selecciona un usuario de la lista
3. El administrador hace clic en "Desactivar usuario" o desmarca el checkbox "Activo"
4. El sistema solicita confirmación: "¿Estás seguro de desactivar este usuario?"
5. El administrador confirma
6. El sistema actualiza el campo `activo=false` en la base de datos
7. El sistema invalida todas las sesiones activas de ese usuario
8. El sistema muestra mensaje "Usuario desactivado exitosamente"
9. Si el usuario desactivado intenta acceder, se aplica el flujo alternativo 2

### Flujo secundario 3 — Usuario ve su perfil

1. El usuario hace clic en su avatar o nombre en la barra de navegación
2. El usuario selecciona "Mi perfil"
3. El sistema muestra la pantalla de perfil con información de solo lectura:
   - Nombre de usuario
   - Nombre completo
   - Rol (admin/usuario)
   - Cliente asociado (si aplica)
   - Estado de la cuenta (activo/inactivo)
4. El usuario puede ver sus datos pero no editarlos

### Flujo secundario 4 — Logout

1. El usuario hace clic en su avatar o nombre en la barra de navegación
2. El usuario selecciona "Cerrar sesión"
3. El sistema destruye la sesión activa del usuario
4. El sistema redirige a la pantalla de login
5. El sistema muestra mensaje "Sesión cerrada exitosamente"

## Notas técnicas

⚠️ **Base de datos**: Esta historia requiere modificar el modelo `User` en el schema de Prisma:

1. **Cambiar campo de autenticación**: Reemplazar `email` único por `username` único (nombre de usuario para login)
2. **Mantener campo email**: Agregar campo `email` opcional para comunicaciones futuras
3. **Agregar campo permisos**: Agregar campo `permisos` tipo JSON para sistema de permisos futuro (por ahora puede ser null o un objeto vacío)
4. **Rol de administrador**: El campo `rol` debe soportar valores "admin" y "usuario"
5. **Cliente opcional**: El campo `clienteId` debe ser opcional (nullable) ya que los administradores no pertenecen a ningún cliente

**Estructura sugerida del modelo User actualizado**:
```prisma
model User {
  id            String   @id @default(cuid())
  username      String   @unique          // Para login
  email         String?                   // Opcional, para futuro
  nombre        String                    // Nombre completo
  password      String                    // Hasheado con bcrypt
  rol           String   @default("usuario") // "admin" o "usuario"
  clienteId     String?                   // Nullable para admins
  activo        Boolean  @default(true)
  permisos      Json?                     // Para sistema de permisos futuro
  creadoEn      DateTime @default(now())
  actualizadoEn DateTime @updatedAt
  cliente       Client?  @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@index([clienteId])
  @@index([username])
}
```

⚠️ **Autenticación**: Utilizar NextAuth.js 5.0.0-beta.30 con:
- Provider de credenciales (username + password)
- Callback de autorización para verificar estado `activo`
- Session strategy JWT con duración configurable
- Middleware para proteger rutas según rol

⚠️ **Seguridad**:
- Las contraseñas deben hashearse con bcrypt antes de almacenarse
- Las sesiones deben tener un tiempo de expiración configurable (sugerido: 7 días)
- Implementar middleware para validar sesiones en todas las rutas protegidas
- Al desactivar un usuario, invalidar sus sesiones activas

⚠️ **Multi-tenancy**:
- Los administradores (`rol="admin"`) tienen `clienteId=null` y acceso global
- Los usuarios normales (`rol="usuario"`) deben tener `clienteId` obligatorio
- Todas las queries de usuarios normales deben filtrar automáticamente por su `clienteId`
- Los administradores pueden ver y gestionar datos de todos los clientes

⚠️ **Sistema de permisos futuro**:
- El campo `permisos` (JSON) queda preparado para almacenar permisos granulares
- Estructura sugerida para el futuro: `{ "operaciones": { "crear": true, "editar": true, "eliminar": false }, "reportes": { "ver": true } }`
- En esta versión MVP, todos los usuarios tienen acceso completo independientemente de este campo
