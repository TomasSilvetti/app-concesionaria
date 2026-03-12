---
name: frontend-developer
description: >
  Desarrolla porciones de tipo FRONT a partir de su archivo .md.
  Usa esta skill SIEMPRE que el usuario mencione desarrollar porcion front, implementar componente frontend, arrancar porcion frontend,
  o cuando comparta una porcion de tipo FRONT y pida desarrollarla o implementarla.
  La skill verifica prerequisitos, analiza la estructura del proyecto, desarrolla el componente siguiendo los lineamientos existentes,
  y acompana al desarrollador en un ciclo de revision hasta que el componente quede confirmado. Marca la porcion como completada al finalizar.
---

# Frontend Developer

Toma una porción de tipo FRONT y la lleva desde cero hasta confirmada: verifica prerequisitos, analiza el proyecto, desarrolla el componente, guía la revisión visual y marca la porción como completada.

---

## Flujo de trabajo

### Paso 1 — Leer la porción

Lee el archivo `.md` de la porción FRONT proporcionada. Extrae:

- **Título y descripción** de lo que hay que implementar
- **Prerequisitos**: lista de porciones que deben estar completas antes de arrancar
- **Par Back**: número de la porción Back asociada (para tenerla en cuenta como referencia de contratos)
- **Criterios de aceptación**: qué debe cumplir el componente
- **Pruebas**: las guarda en mente pero NO las marca como completadas en ningún momento

---

### Paso 2 — Verificar prerequisitos

Antes de cualquier otra cosa, verificar que las porciones listadas en `Prerequisitos` estén completadas.

**Cómo verificar:** leer el encabezado del `.md` de cada porción prerequisito y buscar la línea:

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

Si todos los prerequisitos están completos, continuar al Paso 3.

---

### Paso 3 — Analizar la estructura del proyecto

Antes de escribir una sola línea de código, explorar el proyecto para entender cómo está organizado.

**Qué analizar:**

1. **Framework y versión**: detectar desde `package.json` (React, Vue, Angular, Svelte, etc.)
2. **Comando para levantar el servidor**: leer scripts en `package.json` (dev, start, serve, etc.)
3. **Estructura de carpetas**: explorar `src/` o el directorio principal para entender dónde viven los componentes, páginas, layouts, estilos, etc.
4. **Convenciones de naming**: observar cómo se llaman los archivos existentes (PascalCase, kebab-case, etc.)
5. **Sistema de estilos**: detectar si usan CSS modules, Tailwind, styled-components, SCSS, etc.
6. **Manejo de rutas**: detectar si usan React Router, Next.js, Vue Router, etc., y cómo están declaradas las rutas existentes

**Si el proyecto no tiene estructura todavía:**

> No encontré una estructura de proyecto existente. Para crear el componente de la forma correcta necesito saber:
>
> 1. ¿Qué framework vas a usar? (React, Vue, Next.js, etc.)
> 2. ¿Cómo preferís organizar los componentes? (por feature, por tipo, etc.)
>
> Con eso armo la estructura base y arranco.

Esperar respuesta antes de continuar.

---

### Paso 4 — Presentar resumen y pedir referencia visual

Con toda la información recolectada, presentar un resumen y pedir la referencia visual en una sola pausa:

> **📋 Listo para arrancar. Esto es lo que voy a hacer:**
>
> **Qué:** {descripción de la porción en lenguaje simple, 1-2 oraciones}
>
> **Dónde:** `src/components/forms/LoginForm.tsx` *(o la ruta que corresponda según la estructura del proyecto)*
>
> **Ruta en la app:** `/login` *(la URL donde se podrá ver una vez levantado el servidor)*
>
> **Framework/estilos:** React + Tailwind *(o lo que corresponda)*
>
> **🎨 ¿Cómo debe verse?** Antes de arrancar, compartí una referencia visual:
> - Una **imagen o screenshot** (mockup, Figma, boceto, referencia de otro producto)
> - Una **descripción** de cómo debe verse (disposición, colores, estilo general)
>
> Si no tenés referencia, decime "a tu criterio" y lo diseño siguiendo el sistema de estilos del proyecto.

**Comportamiento según la respuesta:**

- **Imagen**: analizarla y confirmar brevemente cómo se va a traducir al código. Ejemplo: *"Entendido, veo un formulario centrado con dos campos apilados, botón primario azul y link de recuperación debajo."*
- **Descripción textual**: parafrasear el entendimiento para confirmar antes de arrancar.
- **"A tu criterio"**: diseñar siguiendo las convenciones del proyecto, mencionando brevemente las decisiones de diseño tomadas.

Una vez recibida la referencia, marcar la porción como en progreso en el `.md`:

```markdown
**Estado:** 🔄 En progreso
```

Esto asegura que si la sesión se interrumpe, la porción no queda sin estado y es fácil retomar desde donde se dejó.

---

### Paso 5 — Desarrollar el componente

Una vez confirmado, implementar el componente siguiendo estrictamente las convenciones del proyecto.

**Reglas de desarrollo:**

- Seguir el mismo naming, estructura de carpetas y sistema de estilos que ya existe en el proyecto
- Implementar todos los criterios de aceptación de la porción
- Contemplar los estados relevantes: cargando, error, vacío, éxito
- No conectar con el backend todavía (eso es responsabilidad de la porción Back); usar datos mock o props si hace falta mostrar contenido dinámico
- Si la porción necesita una nueva ruta, declararla siguiendo el sistema de routing existente
- Mantener el componente lo más simple posible: solo lo que describe la porción, nada más

**Reutilización de componentes existentes:**

Antes de crear cualquier elemento UI (botón, input, modal, tabla, etc.), explorar el proyecto para ver si ya existe un componente que cumpla esa función. Si existe, usarlo. No duplicar. Si existe pero necesita una pequeña variación, extenderlo o usar sus props — nunca copiarlo y modificarlo en otro archivo.

> Si encontrás un componente existente que aplica, mencionarlo al desarrollador:
> *"Para el campo de email voy a reutilizar el componente `Input` que ya existe en `src/components/ui/Input.tsx`."*

**Ruta de la app — verificar que exista:**

Antes de indicar la URL de revisión, verificar que la página o layout donde va el componente ya existe en el proyecto. Si no existe:

> La ruta `/home` todavía no está creada en el proyecto. Para que puedas ver el componente necesito crearla también. ¿La creo como página vacía con el componente adentro, o preferís que la arme de otra forma?

Esperar confirmación antes de crear la página contenedora.

**Accesibilidad mínima obligatoria:**

Todo componente debe cumplir estas reglas básicas sin excepción:
- Imágenes con atributo `alt` descriptivo
- Inputs de formulario con `label` asociado (via `for`/`htmlFor` o wrapping)
- Botones con texto descriptivo o `aria-label` si son solo íconos
- Contraste de colores suficiente (no usar texto gris claro sobre fondo blanco)
- Elementos interactivos accesibles por teclado (no bloquear foco)

**Variables de entorno:**

Si el componente referencia una URL de API, una clave externa o cualquier valor configurable, nunca hardcodearlo. Usar variables de entorno siguiendo el sistema del proyecto (`.env`, `VITE_`, `NEXT_PUBLIC_`, etc.). Si no existe un archivo `.env`, crearlo y mencionárselo al desarrollador.

**Responsividad:**

Por defecto, todo componente debe ser responsive (adaptarse a mobile, tablet y desktop) a menos que la porción `.md` indique explícitamente lo contrario. Seguir los breakpoints ya definidos en el proyecto (Tailwind, CSS variables, etc.).

---

### Paso 6 — Indicar cómo revisar

Una vez creado el componente, dar las instrucciones de revisión:

> **✅ Componente implementado.**
>
> Para verlo, levantá el servidor con:
> ```
> {comando detectado del package.json, ej: npm run dev}
> ```
>
> Luego abrí: `{URL completa, ej: http://localhost:3000/login}`
>
> *Si ya tenés el servidor corriendo, recargá la página.*
>
> ¿Se ve como esperabas, o necesitás algún ajuste?

---

### Paso 7 — Ciclo de revisión y ajustes

Entrar en un loop de revisión hasta que el desarrollador confirme que el componente está perfecto.

**Por cada ronda de feedback:**

1. Escuchar los ajustes solicitados
2. Implementarlos
3. Volver a indicar la URL para revisión
4. Preguntar: *"¿Quedó bien, o ajustamos algo más?"*

**Repetir hasta confirmación.** No asumir que está listo hasta que el desarrollador lo diga explícitamente.

Si el desarrollador pide algo que contradice los criterios de aceptación de la porción, mencionarlo:

> Ese cambio entraría en conflicto con el criterio *"El botón debe estar deshabilitado si el campo está vacío"* de la porción. ¿Querés igualmente hacerlo y actualizar el criterio, o lo dejamos como estaba?

---

### Paso 8 — Marcar la porción como completada

Una vez que el desarrollador confirma que el componente está listo, actualizar el archivo `.md` de la porción agregando el campo `Estado` en el encabezado y la fecha de completado:

```markdown
**Estado:** ✅ Completada
**Completada el:** {fecha actual}
```

**Importante:** Los checkboxes de las secciones `## Pruebas` (unitarias y de integración) **NO se marcan**. Quedan pendientes para la etapa de testing posterior.

Confirmar al desarrollador:

> ✅ Porción marcada como completada en `docs/historias-de-usuario/HU-{N}/porcion-{NNN}.md`
>
> Las pruebas unitarias y de integración quedaron pendientes para la etapa de testing.
>
> Siguiente porción sugerida: **porcion-{NNN+1}** — {título} [{tipo}]

---

## Reglas generales

- **Nunca escribir código antes de la confirmación del Paso 4**
- **Nunca marcar pruebas como completadas** — eso es exclusivo de la etapa de testing
- **Nunca avanzar si hay prerequisitos pendientes** — el orden importa
- **Siempre seguir las convenciones del proyecto** — si hay dudas, preguntar antes de inventar
- **Un componente por porción** — no adelantar lógica que corresponde a la porción Back
- **Si algo es ambiguo**, preguntar antes de implementar; mejor una pregunta que rehacer todo
- **Reutilizar antes de crear** — buscar componentes existentes antes de crear uno nuevo
- **Verificar que la ruta exista** — si la página contenedora no existe, crearla con confirmación
- **Accesibilidad siempre** — labels, alt, aria-label y navegación por teclado son obligatorios
- **Variables de entorno** — ningún valor configurable hardcodeado, siempre via `.env`
- **Responsive por defecto** — todo componente se adapta a distintos tamaños salvo indicación contraria

---

## Estados del archivo .md de una porción

| Campo | Valor | Cuándo |
|-------|-------|--------|
| `**Estado:**` | *(ausente)* | Porción sin iniciar |
| `**Estado:**` | `🔄 En progreso` | Se marca automáticamente al confirmar el inicio del desarrollo (Paso 4) |
| `**Estado:**` | `✅ Completada` | Cuando el desarrollador confirma que el componente está listo |

---

## Relación con otras skills

- **Prerequisito**: `story-decomposer` debe haber generado el `.md` de la porción antes de usar esta skill
- **Siguiente paso**: una vez completada la porción FRONT, la porción BACK par puede ser desarrollada con la skill `backend-developer`
- **Testing**: las pruebas unitarias y de integración definidas en la porción quedan para la skill de testing posterior