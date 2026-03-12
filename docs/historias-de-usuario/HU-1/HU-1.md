# HU-1: Implementar estructura base de la aplicación con navbar y sidebar

**Como** usuario autenticado del sistema,
**quiero** acceder a una página principal con navegación mediante navbar y sidebar,
**para** poder navegar entre los diferentes módulos de la aplicación de forma intuitiva y eficiente.

## Descripción

Esta historia establece la estructura base de la aplicación Nordem, implementando los componentes fundamentales de navegación que servirán como foundation para todos los módulos futuros. Se desarrollará un navbar superior que contendrá el logo de la aplicación, una barra de búsqueda, un botón hamburguesa para controlar el sidebar, y un área de usuario con dropdown. El sidebar lateral mostrará el menú de navegación principal con acceso a todos los módulos del sistema (Dashboard, Operaciones, Stock, Gastos, Clientes, Configuración). La página principal mostrará un mensaje de bienvenida simple como punto de partida. El diseño será completamente responsive, adaptándose a dispositivos móviles donde el sidebar funcionará como overlay. Esta implementación no incluye la lógica de autenticación real (que se desarrollará en una HU posterior), pero sí prepara la estructura para integrarla.

## Criterios de aceptación

- [ ] El navbar está visible en la parte superior de todas las páginas con logo, barra de búsqueda, botón hamburguesa y área de usuario
- [ ] El botón hamburguesa en el navbar permite abrir y cerrar el sidebar
- [ ] El sidebar muestra las opciones de navegación: Dashboard, Operaciones, Stock, Gastos, Clientes y Configuración
- [ ] El sidebar es completamente colapsable (se oculta por completo cuando está cerrado)
- [ ] El estado del sidebar (abierto/cerrado) se mantiene mientras el usuario navega por la aplicación
- [ ] La página principal muestra un mensaje de bienvenida simple
- [ ] En dispositivos móviles, el sidebar se comporta como overlay que se superpone al contenido
- [ ] En mobile, al seleccionar una opción del sidebar, este se cierra automáticamente
- [ ] El diseño es responsive y se adapta correctamente a diferentes tamaños de pantalla
- [ ] Los componentes siguen los lineamientos de diseño de shadcn/ui y Tailwind CSS

## Flujos

### Flujo principal (escenario de éxito)

1. El usuario autenticado accede a la aplicación
2. El sistema muestra la página principal con el navbar en la parte superior y el contenido de bienvenida
3. El usuario hace clic en el botón hamburguesa (esquina izquierda del navbar)
4. El sidebar se despliega mostrando las opciones de navegación: Dashboard, Operaciones, Stock, Gastos, Clientes, Configuración
5. El usuario puede navegar entre secciones haciendo clic en las opciones del sidebar
6. El usuario puede colapsar el sidebar haciendo clic nuevamente en el botón hamburguesa
7. El estado del sidebar (expandido/colapsado) se mantiene mientras navega por la aplicación

### Flujo alternativo 1 — Vista mobile/responsive

1. El usuario accede desde un dispositivo móvil
2. El sidebar está oculto por defecto
3. Al hacer clic en el botón hamburguesa, el sidebar se superpone sobre el contenido como overlay con fondo oscuro semitransparente
4. Al seleccionar una opción del menú, el sidebar se cierra automáticamente
5. El usuario también puede cerrar el sidebar haciendo clic en el fondo oscuro o en el botón hamburguesa

### Flujo alternativo 2 — Usuario no autenticado (preparación para módulo auth)

1. El usuario no autenticado accede a la aplicación
2. El sistema muestra el navbar con el botón de "Iniciar sesión" en lugar del dropdown de usuario
3. El sidebar no está disponible hasta que el usuario se autentique
4. Al hacer clic en "Iniciar sesión", se redirige a la página de login (a implementar en HU posterior)

## Ejemplos de uso

**Ejemplo 1 - Usuario navega por primera vez:**
Un vendedor inicia sesión y ve la página principal con un mensaje de bienvenida "Bienvenido a Nordem". En el navbar superior izquierdo ve el botón hamburguesa y el logo (icono de auto), en el centro una barra de búsqueda, y en la derecha su nombre "Juan Pérez" con un dropdown. Hace clic en el botón hamburguesa, se despliega el sidebar con las opciones Dashboard, Operaciones, Stock, Gastos, Clientes y Configuración. Selecciona "Operaciones" y el sidebar permanece abierto mientras navega.

**Ejemplo 2 - Usuario colapsa sidebar:**
Un administrador está trabajando en la aplicación con el sidebar expandido. Necesita más espacio en pantalla para ver una tabla de datos, hace clic en el botón hamburguesa y el sidebar se oculta completamente, dando más espacio al contenido principal. El navbar permanece visible en todo momento.

**Ejemplo 3 - Acceso desde mobile:**
Un gestor accede desde su teléfono móvil. Ve el navbar adaptado al tamaño de pantalla con el logo, botón hamburguesa y su avatar de usuario. Al tocar el botón hamburguesa, el sidebar se superpone sobre el contenido con un fondo oscuro semitransparente. Selecciona "Dashboard" y el sidebar se cierra automáticamente, mostrando el contenido del dashboard.
