# porcion-002 — Componente Navbar — estructura visual [FRONT]

**Historia de usuario:** HU-1: Implementar estructura base de la aplicación con navbar y sidebar
**Par:** porcion-003
**Tipo:** FRONT
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 12/03/2026

## Descripción

Crear el componente visual del navbar superior con logo, barra de búsqueda, botón hamburguesa y área de usuario con dropdown. El navbar es fijo en la parte superior y se adapta a diferentes tamaños de pantalla.

## Ejemplo de uso

El usuario ve en la parte superior de la aplicación una barra horizontal con el logo de Nordem (icono de auto) a la izquierda, una barra de búsqueda en el centro, y a la derecha su nombre "Juan Pérez" con un avatar. En mobile, la barra de búsqueda se oculta o se muestra más compacta, priorizando el botón hamburguesa y el área de usuario.

## Criterios de aceptación

- [ ] El navbar muestra el botón hamburguesa en el extremo izquierdo
- [ ] El logo de la aplicación (icono de auto) se muestra junto al botón hamburguesa
- [ ] La barra de búsqueda se muestra en el centro del navbar en desktop
- [ ] El área de usuario se muestra en el extremo derecho con avatar y nombre
- [ ] El dropdown del área de usuario muestra opciones: "Mi perfil", "Configuración" y "Cerrar sesión"
- [ ] En mobile, la barra de búsqueda se oculta o se muestra de forma compacta
- [ ] El navbar tiene altura fija y se mantiene en la parte superior (sticky)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza correctamente con todos los elementos visibles (botón hamburguesa, logo, búsqueda, usuario)
- [ ] El botón hamburguesa tiene el ícono correcto y es clickeable
- [ ] El dropdown del usuario se abre al hacer clic en el área de usuario
- [ ] El dropdown se cierra al hacer clic fuera de él
- [ ] En viewport < 768px, la barra de búsqueda no se muestra o se muestra compacta
- [ ] El avatar del usuario muestra las iniciales si no hay imagen de perfil

### Pruebas de integración

- [ ] El navbar se integra correctamente dentro del `AppLayout` ocupando el área superior
- [ ] Al hacer clic en el botón hamburguesa, se invoca la función `toggle()` del contexto del sidebar
- [ ] El navbar mantiene su posición fija al hacer scroll en el contenido principal
