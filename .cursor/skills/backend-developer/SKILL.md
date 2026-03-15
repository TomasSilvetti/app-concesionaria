---
name: backend-developer
description: >
  Desarrolla porciones de tipo BACK a partir de su archivo .md.
  Usa esta skill SIEMPRE que el usuario mencione desarrollar porcion back, implementar logica backend, crear endpoint, arrancar porcion backend,
  o cuando comparta una porcion de tipo BACK y pida desarrollarla o implementarla.
  La skill verifica prerequisitos, analiza la estructura del proyecto, explica lo que va a hacer en lenguaje simple con un flujo de datos y una metafora,
  desarrolla la logica backend, y acompana al desarrollador en un ciclo de revision hasta confirmar. Marca la porcion como completada al finalizar.
---

# Backend Developer

Toma una porción de tipo BACK y la lleva desde cero hasta confirmada: verifica prerequisitos, analiza el proyecto, explica la lógica con claridad, desarrolla el backend, guía la revisión y marca la porción como completada.

---

## Flujo de trabajo

### Paso 1 — Leer la porción

Lee el archivo `.md` de la porción BACK proporcionada. Extrae:

- **Título y descripción** de lo que hay que implementar
- **Prerequisitos**: lista de porciones que deben estar completas antes de arrancar
- **Par Front**: número de la porción Front asociada — leer también ese `.md` para entender qué estructura visual ya existe, qué datos necesita y qué contrato espera (endpoints, formato de respuesta, etc.)
- **Criterios de aceptación**: qué debe cumplir la lógica backend
- **Pruebas**: las guarda en mente pero NO las marca como completadas en ningún momento

---

### Paso 2 — Verificar prerequisitos

Antes de cualquier otra cosa, verificar que las porciones listadas en `Prerequisitos` estén completadas.

**Cómo verificar:** leer el encabezado del `.md` de cada porción prerequisito y buscar:

```
**Estado:** ✅ Completada
```

Si algún prerequisito **no está completado**:

> ⚠️ Esta porción tiene prerequisitos sin completar:
>
> - `porcion-001` — Setup de autenticación base → **pendiente**
>
> No es posible continuar hasta que esas porciones estén implementadas. ¿Querés arrancar por alguna de ellas primero?

**Detener el flujo.** No continuar hasta que el desarrollador confirme que los prerequisitos están resueltos.

También verificar que la **porción Front par** esté completada (`✅ Completada`). Si no lo está:

> ⚠️ La porción Front correspondiente (`porcion-{NNN}`) todavía no está completada. El backend debe desarrollarse sobre una estructura visual ya definida. Completá primero la porción Front antes de continuar.

Si todo está completo, continuar al Paso 3.

---

### Paso 3 — Analizar la estructura del proyecto

Explorar el proyecto para entender cómo está organizado el backend y seguir sus convenciones.

**Qué analizar:**

1. **Lenguaje y framework backend**: detectar desde archivos de configuración (`package.json`, `requirements.txt`, `go.mod`, `pom.xml`, etc.) — Node/Express, Django, FastAPI, Laravel, Spring, etc.
2. **Estructura de carpetas**: dónde viven los controladores, servicios, modelos, repositorios, rutas, middlewares, etc.
3. **Convenciones de naming**: cómo se llaman los archivos y funciones existentes
4. **ORM o acceso a base de datos**: Prisma, TypeORM, SQLAlchemy, Eloquent, etc. — y cómo están definidos los modelos existentes
5. **Sistema de autenticación**: si existe, cómo funciona (JWT, sessions, OAuth) y cómo se protegen las rutas
6. **Variables de entorno**: qué archivo usa el proyecto (`.env`, `.env.local`, etc.) y qué variables ya existen
7. **Manejo de errores**: cómo devuelve errores el resto de la aplicación (formato, códigos HTTP, mensajes)

**Si el proyecto no tiene estructura backend todavía:**

> No encontré una estructura backend existente. Para arrancar necesito saber:
>
> 1. ¿Qué lenguaje/framework backend van a usar?
> 2. ¿Tienen preferencia de estructura? (por capas, por feature, etc.)
> 3. ¿Qué base de datos van a usar?
>
> Con eso armo la estructura base y arranco.

Esperar respuesta antes de continuar.

---

### Paso 4 — Explicar lo que se va a hacer

Antes de escribir código, presentar dos bloques explicativos en lenguaje simple. No usar jerga técnica innecesaria.

**Bloque 1 — Qué se va a crear:**

Una descripción clara de qué lógica se va a implementar y cuál es su función. Ejemplo:

> **Qué voy a crear:**
> Voy a crear un endpoint que recibe el email y la contraseña del formulario de login, verifica que el usuario exista en la base de datos y que la contraseña sea correcta, y devuelve un token de acceso si todo está bien, o un mensaje de error si algo falla.

**Bloque 2 — Flujo de datos:**

Un recorrido paso a paso de cómo viajan los datos, nombrando los archivos concretos que se van a crear o modificar:

> **Cómo fluyen los datos:**
>
> 1. El formulario en `LoginForm.tsx` hace un `POST` a `/api/auth/login`
> 2. La ruta en `routes/auth.routes.ts` recibe la petición y la pasa al controlador
> 3. `controllers/auth.controller.ts` valida que los campos no estén vacíos
> 4. Llama al servicio `services/auth.service.ts` que busca al usuario en la base de datos usando el modelo `models/User.ts`
> 5. Si el usuario existe, compara la contraseña con el hash guardado
> 6. Si todo está bien, genera un JWT y lo devuelve al frontend
> 7. Si algo falla, devuelve un error 401 con mensaje descriptivo

---

### Paso 5 — Pedir confirmación

Luego de los tres bloques, hacer una pausa:

> ¿Esto es lo que esperabas? ¿Querés ajustar algo del diseño antes de que empiece a codear?

Esperar confirmación explícita antes de escribir código.

En cuanto el desarrollador confirme, marcar inmediatamente la porción como en progreso en el `.md`:

```markdown
**Estado:** 🔄 En progreso
```

---

### Paso 6 — Desarrollar la lógica backend

Implementar siguiendo estrictamente las convenciones del proyecto.

**Reglas de desarrollo:**

- Seguir la misma estructura de capas que ya existe (controlador → servicio → repositorio/modelo, o la que use el proyecto)
- Respetar el formato de respuesta que ya usa el resto de la API (estructura del JSON, códigos HTTP, mensajes de error)
- Implementar todos los criterios de aceptación de la porción
- Validar siempre los datos de entrada: tipos, campos requeridos, formatos, rangos
- Manejar todos los errores posibles: recursos no encontrados, permisos insuficientes, errores de base de datos, timeouts
- Si la porción requiere autenticación, aplicar el middleware existente — no inventar uno nuevo
- Ningún valor configurable hardcodeado: URLs, claves, timeouts, nombres de tablas variables → siempre via variables de entorno
- Contemplar los edge cases definidos en las pruebas de la porción al implementar las validaciones

**Reutilización de lógica existente:**

Antes de crear cualquier función, servicio o helper, explorar si ya existe algo equivalente. Si existe, usarlo o extenderlo. Comunicarlo explícitamente:

> *"Para el hasheo de la contraseña voy a reutilizar el helper `hashPassword` que ya existe en `utils/crypto.ts`."*

---

### Paso 7 — Migraciones de base de datos

Si la porción requiere crear o modificar tablas, columnas o índices en la base de datos, **primero verificar el estado actual del esquema** y luego explicar lo que se va a hacer antes de aplicar cualquier cambio.

**Verificación previa del esquema:**

1. Leer los modelos/migraciones existentes del proyecto (Prisma → `schema.prisma`, TypeORM → `entities/`, Django → `models.py`, etc.)
2. Para cada tabla/campo que necesita la porción, determinar:
   - ✅ **Ya existe con los campos correctos** → no se necesita migración, continuar al paso siguiente
   - ⚠️ **Existe pero le faltan campos** → migración de ALTER TABLE
   - ❌ **No existe** → migración de CREATE TABLE

Si **no se necesita migración** (todo ya existe), mencionarlo brevemente y continuar:

> *"✅ La tabla `usuarios` ya existe con todos los campos necesarios. No se requiere migración."*

Si **sí se necesita migración**, presentar al desarrollador el análisis y pedir confirmación antes de aplicar nada:

> **🗄️ Esta porción requiere cambios en la base de datos.**
>
> **Estado actual:** {describir qué existe hoy — tabla inexistente, o tabla existente con campos faltantes}
>
> **Qué se necesita:** {descripción en lenguaje simple del cambio estructural necesario}
>
> **Por qué:** {explicar en una oración qué fallaría sin este cambio}
>
> **Cómo se haría:** se creará el archivo de migración `migrations/{timestamp}_nombre_migracion` que {describe exactamente qué hace: crea la tabla X con los campos Y y tipos Z, agrega la columna W a la tabla V, etc.}
>
> ¿Confirmás que aplique la migración?

Esperar confirmación explícita antes de crear el archivo de migración y ejecutarlo.

Una vez confirmado, crear la migración siguiendo el sistema del proyecto.

**Para Prisma:**

Los comandos de Prisma como `npx prisma migrate dev` son interactivos y no funcionan en entornos no interactivos (como Cursor). Por lo tanto:

1. Modificar el archivo `schema.prisma` con los cambios necesarios
2. Presentar al desarrollador el comando que debe ejecutar manualmente:

> **📋 Ejecutá este comando en tu terminal:**
> ```
> npx prisma migrate dev --name {nombre_descriptivo_de_migracion}
> ```
>
> Este comando va a:
> - Detectar los cambios en el schema
> - Generar el archivo SQL de migración automáticamente
> - Aplicar la migración a la base de datos
> - Regenerar el cliente de Prisma con los tipos actualizados
>
> Una vez que lo ejecutes, confirmame si se aplicó correctamente o si hubo algún error.

3. Esperar confirmación del desarrollador de que ejecutó el comando y que la migración se aplicó exitosamente antes de continuar.

**Para otros ORMs** (TypeORM, Sequelize, Django, etc.): seguir el flujo normal de crear y ejecutar migraciones programáticamente.

---

### Paso 8 — Seeders y datos de prueba

Una vez implementada la lógica y aplicadas las migraciones, detectar si el desarrollador necesita datos previos en la base de datos para poder probar el flujo completo Front + Back.

**Cuándo aplica:** cuando el endpoint depende de que existan registros en la BD para funcionar (un usuario para hacer login, productos para listar, un registro para editar, etc.).

Si aplica, presentar los datos propuestos antes de insertarlos:

> **🌱 Para probar el flujo completo necesitás datos en la base de datos.**
>
> Propongo insertar los siguientes datos de prueba:
>
> **{Entidad, ej: Usuario de prueba}:**
> ```
> {campo}: {valor de ejemplo realista}
> {campo}: {valor de ejemplo realista}
> ```
>
> ¿Querés que los inserte en la base de datos?

Esperar confirmación antes de insertar cualquier dato.

Una vez confirmado, insertar los datos usando el sistema del proyecto (seeder, script, ORM directo) y pedirle al desarrollador que verifique visualmente que el registro quedó en la BD:

> ✅ Datos insertados. Para confirmar que quedaron correctamente, verificá el registro directamente en la base de datos:
>
> **Tabla:** `{nombre_tabla}`
> **Cómo verlo:** abrí tu cliente de BD ({TablePlus, DBeaver, pgAdmin, MySQL Workbench, Prisma Studio, etc.} según el proyecto) y buscá el registro con:
> ```
> {campo identificador, ej: email}: {valor}
> ```
>
> Una vez que confirmes que el registro está ahí, podés probar el flujo con estos datos:
> - **{campo}:** `{valor}`
> - **{campo}:** `{valor}`
>
> ¿Ves el registro en la BD?

Esperar confirmación del desarrollador de que el dato es visible antes de continuar.

---

### Paso 9 — Seguridad

Antes de dar por terminado el desarrollo, revisar activamente los siguientes puntos de seguridad en el código implementado:

- **Inyección**: ¿las queries usan parámetros preparados o el ORM? Nunca concatenar input del usuario en queries
- **Datos sensibles en logs**: ¿hay passwords, tokens o datos personales siendo logueados? Eliminarlos
- **Rate limiting**: en endpoints críticos (login, registro, recuperación de contraseña), verificar si el proyecto tiene rate limiting y aplicarlo. Si no existe, mencionárselo al desarrollador como deuda técnica
- **Exposición de datos**: ¿la respuesta del endpoint devuelve campos sensibles que no deberían salir al frontend (passwords hasheadas, tokens internos, IDs de sistema)? Filtrarlos
- **Autorización**: ¿el endpoint verifica que el usuario autenticado tiene permiso para acceder al recurso específico, no solo que está autenticado?

Si se detecta algún problema, corregirlo directamente y mencionárselo al desarrollador:

> 🔒 Corregí estos puntos de seguridad:
> - La query de búsqueda de usuario ahora usa parámetros preparados (antes concatenaba el input directamente)
> - Removí el log que imprimía la contraseña recibida

Si hay algo que no puede resolverse en el scope de esta porción (como implementar rate limiting desde cero), mencionarlo como deuda técnica:

> ⚠️ Deuda técnica detectada: este endpoint no tiene rate limiting. Se recomienda implementarlo antes de pasar a producción.

---

### Paso 10 — Logging

Verificar que la lógica implementada registre los eventos importantes siguiendo el sistema de logs del proyecto.

**Qué debe loguearse:**
- Errores inesperados (con stack trace, sin datos sensibles)
- Eventos de negocio relevantes (usuario creado, pago procesado, etc.) — nivel `info`
- Advertencias de seguridad (intento de acceso no autorizado, rate limit alcanzado) — nivel `warn`

**Qué NO debe loguearse:**
- Passwords, tokens, datos de tarjetas, información personal sensible
- Datos de request/response completos en producción

Si el proyecto no tiene un sistema de logging, mencionárselo al desarrollador:

> ⚠️ El proyecto no tiene un sistema de logging configurado. Estoy usando `console.error` por ahora, pero se recomienda implementar una librería de logs (Winston, Pino, etc.) antes de pasar a producción.

---

### Paso 11 — Conectar con el frontend


Una vez implementada la lógica, verificar que el contrato con la porción Front par sea correcto:

- La URL del endpoint coincide con la que usa el componente Front
- El formato del JSON de respuesta (campos, tipos) coincide con lo que espera el Front
- Los códigos de error que devuelve el Back son los que el Front maneja

Si hay alguna discrepancia, resolverla y mencionársela al desarrollador:

> *"El frontend esperaba recibir `{ user: { id, name } }` pero el endpoint actualmente devuelve `{ data: { id, name } }`. Unifiqué el formato para que coincidan."*

---

### Paso 12 — Ciclo de revisión y ajustes

Presentar un resumen de lo implementado y entrar en loop de revisión:

> **✅ Lógica implementada.**
>
> Creé/modifiqué estos archivos:
> - `routes/auth.routes.ts` — nueva ruta POST /api/auth/login
> - `controllers/auth.controller.ts` — validación de entrada y manejo de errores
> - `services/auth.service.ts` — lógica de verificación y generación de token
>
> Podés probar el endpoint con:
> ```
> POST http://localhost:{puerto}/api/auth/login
> Body: { "email": "test@test.com", "password": "123456" }
> ```
>
> ¿Funciona como esperabas, o necesitás algún ajuste?

**Por cada ronda de feedback:**

1. Escuchar los ajustes solicitados
2. Implementarlos
3. Actualizar el resumen de archivos si corresponde
4. Preguntar: *"¿Quedó bien, o ajustamos algo más?"*

**Repetir hasta confirmación explícita.**

Si el desarrollador pide algo que contradice los criterios de aceptación de la porción, mencionarlo antes de proceder:

> Ese cambio entraría en conflicto con el criterio *"Debe devolver 401 si la contraseña es incorrecta"*. ¿Querés igualmente hacerlo y actualizar el criterio, o lo dejamos como estaba?

---

### Paso 13 — Marcar la porción como completada

Una vez confirmado, actualizar el `.md` de la porción:

```markdown
**Estado:** ✅ Completada
**Completada el:** {fecha actual}
```

**Los checkboxes de `## Pruebas`** (unitarias y de integración) **NO se marcan**. Quedan pendientes para la etapa de testing.

Confirmar al desarrollador:

> ✅ Porción marcada como completada en `docs/historias-de-usuario/HU-{N}/porcion-{NNN}.md`
>
> Las pruebas unitarias y de integración quedaron pendientes para la etapa de testing.
>
> Siguiente porción sugerida: **porcion-{NNN+1}** — {título} [{tipo}]

---

## Reglas generales

- **Nunca escribir código antes de la confirmación del Paso 5**
- **Nunca marcar pruebas como completadas** — eso es exclusivo de la etapa de testing
- **Nunca avanzar si hay prerequisitos pendientes** — incluyendo la porción Front par
- **Siempre seguir las convenciones del proyecto** — si hay dudas, preguntar antes de inventar
- **Reutilizar antes de crear** — buscar lógica existente antes de escribir algo nuevo
- **Validar siempre los datos de entrada** — nunca asumir que lo que llega del frontend es correcto
- **Ningún valor hardcodeado** — todo configurable via variables de entorno
- **El contrato con el Front es sagrado** — URLs, formatos de respuesta y códigos de error deben coincidir exactamente
- **Nunca aplicar migraciones sin confirmación explícita** — siempre explicar primero qué cambia y por qué
- **Nunca insertar datos de prueba sin confirmación explícita** — mostrar qué se va a insertar y esperar aprobación
- **Seguridad no es opcional** — revisar inyección, exposición de datos, autorización y logs en cada porción
- **Nunca loguear datos sensibles** — passwords, tokens e información personal nunca deben aparecer en logs
- **Si algo es ambiguo**, preguntar antes de implementar

---

## Estados del archivo .md de una porción

| Campo | Valor | Cuándo |
|-------|-------|--------|
| `**Estado:**` | *(ausente)* | Porción sin iniciar |
| `**Estado:**` | `🔄 En progreso` | Se marca automáticamente al confirmar el inicio del desarrollo (Paso 5) |
| `**Estado:**` | `✅ Completada` | Cuando el desarrollador confirma que la lógica está lista |

---

## Relación con otras skills

- **Prerequisito directo**: la porción FRONT par debe estar `✅ Completada` antes de arrancar
- **Prerequisito indirecto**: cualquier porción listada en `Prerequisitos` del `.md` debe estar `✅ Completada`
- **Origen**: `story-decomposer` debe haber generado el `.md` de la porción
- **Testing**: las pruebas unitarias y de integración definidas en la porción quedan para la skill de testing posterior