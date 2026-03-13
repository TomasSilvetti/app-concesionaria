# porcion-005 — Scroll infinito en listado de operaciones [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-006
**Tipo:** FRONT
**Prerequisitos:** porcion-003

## Descripción

Implementar scroll infinito en la tabla de operaciones para cargar más resultados automáticamente cuando el usuario se desplaza hacia abajo. Utiliza un observer o evento de scroll para detectar cuando se llega al final de la lista y disparar la carga de más datos.

## Ejemplo de uso

El usuario ve las primeras 20 operaciones en la tabla. Cuando se desplaza hacia abajo y llega cerca del final de la lista, el sistema detecta el scroll, muestra un indicador de carga y automáticamente carga las siguientes 20 operaciones, agregándolas al final de la tabla sin recargar la página.

## Criterios de aceptación

- [ ] La tabla carga inicialmente un número limitado de operaciones (ej: 20)
- [ ] Cuando el usuario se desplaza cerca del final de la lista, se dispara la carga de más operaciones
- [ ] Se muestra un indicador de carga (spinner) mientras se cargan más operaciones
- [ ] Las nuevas operaciones se agregan al final de la lista existente sin recargar toda la página
- [ ] Si no hay más operaciones para cargar, no se dispara más el evento de scroll
- [ ] El scroll infinito respeta los filtros y ordenamiento aplicados
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente detecta correctamente cuando el usuario llega al final de la lista
- [ ] El componente muestra el indicador de carga cuando está cargando más datos
- [ ] El componente no dispara múltiples cargas simultáneas (debounce/throttle)
- [ ] El componente deja de cargar cuando no hay más datos disponibles

### Pruebas de integración

- [ ] Al hacer scroll hasta el final, se dispara una nueva petición al backend con el cursor correcto
- [ ] Las nuevas operaciones se agregan correctamente al estado existente
- [ ] Si se aplica un filtro, el scroll infinito se reinicia desde el principio con los nuevos criterios
- [ ] Si se cambia el ordenamiento, el scroll infinito se reinicia desde el principio
