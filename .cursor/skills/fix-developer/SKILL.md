---
name: fix-developer
description: >
  Resuelve bugs, ajustes visuales, refactors y mejoras de comportamiento en el proyecto.
  Usa esta skill SIEMPRE que el usuario mencione fix, bug, error, no funciona, arreglar, corregir, ajustar, modificar comportamiento,
  o cuando describa algo que no está funcionando como se espera o quiere cambiar algo puntual del código existente.
  La skill entiende el problema, analiza el impacto, propone la solución mínima necesaria, espera confirmación y recién implementa.
---

# Fix Developer

Toma un bug o modificación reportada por el desarrollador y lo resuelve de forma quirúrgica: entiende el problema, analiza el código y el impacto, propone la solución mínima, espera confirmación e implementa manteniendo los lineamientos del proyecto.

---

## Flujo de trabajo

### Paso 1 — Entender el problema

Leer con atención lo que describió el desarrollador. Puede ser:
- Un **bug**: algo que falla, un error en consola, un comportamiento inesperado
- Un **ajuste visual**: algo que no se ve como debería
- Un **refactor**: reorganizar o limpiar código sin cambiar comportamiento
- Una **mejora de comportamiento**: algo que funciona pero debería funcionar diferente

Repetirle al desarrollador lo que se entendió, en lenguaje simple y sin tecnicismos innecesarios:

> **🔍 Entendí lo siguiente:**
>
> **Tipo:** Bug | Ajuste visual | Refactor | Mejora de comportamiento
>
> **Problema:** {describir en 1-3 oraciones qué está pasando o qué se quiere cambiar, con las propias palabras del desarrollador parafraseadas}
>
> **Dónde ocurre:** {componente, página, endpoint, o área del sistema afectada}
>
> **Comportamiento actual:** {qué hace hoy}
>
> **Comportamiento esperado:** {qué debería hacer}
>
> ¿Es correcto esto, o hay algo que no entendí bien?

Esperar confirmación antes de continuar. Si el desarrollador corrige algo, actualizar el entendimiento y confirmar nuevamente.

---

### Paso 2 — Analizar el código

Una vez confirmado el entendimiento, explorar el código relevante para entender la causa raíz del problema.

**Qué analizar:**

1. **Archivos directamente involucrados**: el componente, función, endpoint o módulo donde ocurre el problema
2. **Causa raíz**: por qué está pasando, no solo dónde. Ejemplo: no "el botón no funciona" sino "el handler onClick no está recibiendo el evento correctamente porque..."
3. **Contexto relevante**: imports, dependencias, estado, props, llamadas a servicios que afectan el comportamiento
4. **Convenciones del proyecto**: naming, estructura de carpetas, sistema de estilos, patrones usados en el resto del código — el fix debe seguirlos sin excepción

---

### Paso 3 — Análisis de impacto

Antes de proponer la solución, identificar qué otros archivos, componentes o flujos podrían verse afectados por el cambio.

**Preguntas a responder:**

- ¿Este código es usado en otros lugares del proyecto?
- ¿El cambio puede alterar el comportamiento de algo que hoy funciona correctamente?
- ¿Hay efectos secundarios posibles (performance, accesibilidad, otros flujos)?

Clasificar el impacto:

| Nivel | Criterio |
|-------|----------|
| 🟢 **Bajo** | El cambio está aislado, afecta solo el archivo indicado |
| 🟡 **Medio** | Afecta 2-5 archivos o un componente usado en varios lugares |
| 🔴 **Alto** | Afecta lógica central, múltiples módulos o comportamiento global |

---

### Paso 4 — Proponer la solución

Con el análisis completo, presentar la propuesta antes de tocar una sola línea de código:

> **💡 Propuesta de solución:**
>
> **Causa raíz:** {explicar en lenguaje simple por qué está pasando el problema}
>
> **Solución:** {describir qué se va a cambiar y cómo, sin código todavía — en lenguaje simple}
>
> **Archivos a modificar:**
> - `{archivo 1}` — {qué se cambia ahí}
> - `{archivo 2}` — {qué se cambia ahí}
>
> **Impacto:** 🟢 Bajo | 🟡 Medio | 🔴 Alto — {breve explicación de por qué ese nivel}
>
> **Alcance:** solo se modifica lo necesario para resolver este problema. {Si el impacto es medio o alto, mencionar explícitamente qué NO se va a tocar para no romper nada.}
>
> ¿Implementamos?

Esperar confirmación explícita antes de escribir código.

**Regla de oro:** proponer siempre la solución **mínima** que resuelva el problema. No aprovechar el fix para refactorizar otras cosas, mejorar código cercano que no fue pedido, ni cambiar convenciones. Si se detecta algo mejorable pero fuera del scope, mencionarlo como observación separada al final, nunca tocarlo sin que lo pidan.

---

### Paso 5 — Implementar el fix

Una vez confirmado, implementar el cambio siguiendo estrictamente las convenciones del proyecto.

**Reglas de implementación:**

- Tocar **solo** los archivos identificados en la propuesta — nada más
- Mantener el mismo estilo de código del archivo modificado (indentación, naming, patrones)
- Si el fix requiere agregar código, que sea consistente con cómo está escrito el resto del archivo
- Si el impacto es 🟡 medio o 🔴 alto, verificar activamente que los otros archivos afectados sigan funcionando correctamente después del cambio
- No cambiar funcionalidad que no fue pedida, aunque "se vea fácil de mejorar"

---

### Paso 6 — Verificación post-fix

Una vez implementado, darle al desarrollador las instrucciones exactas para verificar que el problema quedó resuelto:

> **✅ Fix implementado. Para verificar que quedó resuelto:**
>
> 1. {paso concreto para reproducir el escenario que fallaba — exactamente lo que había que hacer para ver el bug}
> 2. {qué debería verse/pasar ahora que está corregido}
>
> {Si aplica: "Además verificá que {flujo relacionado que podría haberse afectado} sigue funcionando correctamente."}
>
> ¿Quedó resuelto, o hay algo más que ajustar?

Si el desarrollador reporta que no quedó resuelto o apareció algo nuevo, volver al Paso 2 con la nueva información.

---

### Paso 7 — Observaciones opcionales

Si durante el análisis se detectaron cosas mejorables fuera del scope del fix, mencionarlas **después** de confirmar que el fix funcionó, como observaciones separadas y sin implementarlas:

> **📝 Observaciones (fuera del scope de este fix):**
> - {algo que se podría mejorar pero no fue pedido}
> - {deuda técnica detectada}
>
> ¿Querés que encaremos alguna de estas en un fix aparte?

---

## Reglas generales

- **Nunca implementar antes de la confirmación del Paso 4**
- **Solución mínima siempre** — no refactorizar ni mejorar cosas no pedidas
- **Confirmar entendimiento antes de analizar** — un fix sobre el problema equivocado es peor que no hacer nada
- **Siempre reportar el impacto** — el desarrollador tiene que saber qué más podría verse afectado
- **Verificación explícita** — siempre decir exactamente cómo reproducir el escenario para confirmar que está resuelto
- **Observaciones al final** — si se ve algo mejorable, mencionarlo después del fix, nunca tocarlo sin permiso
- **Seguir las convenciones del proyecto** — el código del fix debe ser indistinguible del resto del código existente