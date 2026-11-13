# PRD — Control de Vencimientos

> Documento funcional de referencia. Define qué se construye y cómo se acepta. La arquitectura técnica está en [TRD.md](TRD.md); la identidad visual, en [UX.md](UX.md).

## 1. Objetivo y métricas

**Objetivo:** que cualquier trabajador de la tienda sepa, en menos de 10 segundos desde que abre la aplicación, qué productos debe retirar hoy y qué debe vigilar esta semana.

**Métricas de éxito (v1):**

- El 100 % de los vencimientos registrados tiene encargado, producto, cantidad y fecha válidos.
- Ningún producto aparece como «vencido» sin haberse podido detectar con al menos 10 días de anticipación.
- Registrar un lote individual toma menos de 30 segundos en celular.

## 2. Personas y escenarios

| Persona | Necesidad | Escenario principal |
|---|---|---|
| Trabajador de tienda | Registrar lo que acaba de recibir o revisar | Abre la app en el celular, registra 3 productos con su nombre y una fecha, y cierra |
| Encargado de turno | Decidir qué retirar | Abre la app, mira los indicadores y filtra «Próximos 7 días» |
| Administrador | Compartir información | Exporta los registros filtrados a Excel para revisión con el dueño |

## 3. Alcance

**Incluido:** alta individual, alta grupal, catálogo con autocompletado, indicadores, vista tabla, vista tarjetas, búsqueda, filtros, orden, edición, eliminación, exportación CSV/XLSX, sesión de administrador, persistencia remota.

**Excluido (v1):** inventario y stock, compras, ventas, códigos de barras, notificaciones push/email, multi-tienda con selector, roles y permisos, historial de cambios, analítica, offline/PWA, importación de archivos, umbral configurable de cantidades bajas.

## 4. Modelo conceptual

- **Registro de vencimiento (lote):** encargado + producto + cantidad + fecha. Es la unidad mínima e **independiente**.
- **Producto (catálogo):** nombre visible + nombre normalizado. Se comparte entre registros; **no** es el identificador del vencimiento.
- **Encargado:** texto libre por registro; en el alta grupal se elige una sola vez.

Regla clave: un producto puede tener muchos registros con fechas, cantidades y encargados distintos. Nunca se suman cantidades, se fusionan filas ni se sobrescriben fechas.

## 5. Requisitos funcionales

### RF-01 — Alta individual

- Campos: encargado, producto (con autocompletado), cantidad (entero ≥ 1), fecha de vencimiento (fecha válida).
- El formulario se abre en un diálogo; al guardar, los campos quedan bloqueados mientras se envía.
- Al guardar con éxito: se cierra el diálogo, se refrescan los datos y se muestra confirmación accesible.
- Errores por campo con `aria-invalid` y `aria-describedby`; el error de servidor se muestra en un aviso general.

### RF-02 — Alta grupal

- Un encargado único para toda la operación.
- Filas dinámicas (mínimo 1): producto, cantidad, fecha. Agregar y quitar filas.
- Cada fila se valida individualmente y se identifica visualmente («Producto 1», «Producto 2»…).
- Guardado **atómico**: si una fila falla, no se guarda ninguna; se informa qué fila corregir.
- Al terminar, cada fila se convierte en un registro independiente con el mismo encargado.

### RF-03 — Catálogo y autocompletado

- Al escribir en «Producto» se sugieren coincidencias del catálogo (contiene, sin distinguir mayúsculas ni acentos).
- Se puede elegir una sugerencia o escribir un nombre nuevo.
- Nombres que solo difieren en mayúsculas, tildes o espacios (al inicio/final/múltiples) se consideran el mismo producto.
- El nombre visible que se muestra es el primero registrado; no se reescribe automáticamente.

### RF-04 — Independencia de registros

- Tres registros del mismo producto con fechas distintas se muestran como tres filas/tres entradas.
- Cantidades: nunca se suman automáticamente, ni en pantalla ni en exportación.

### RF-05 — Días restantes

- `días restantes = fecha de vencimiento − fecha local actual`, calculado por fecha de calendario.
- No se almacena en la base; se recalcula al consultar.
- Formatos: `12 días`, `1 día`, `Vence hoy`, `Venció hace 3 días`.

### RF-06 — Estados, colores y avisos

| Días restantes | Estado | Etiqueta | Color |
|---:|---|---|---|
| > 21 | `vigente` | Vigente | Verde |
| 11 – 21 | `proximo` | Próximo a vencer | Amarillo |
| 1 – 10 | `critico` | Crítico | Rojo |
| 0 | `vence_hoy` | Vence hoy | Rojo intenso |
| < 0 | `vencido` | Vencido (hace N días) | Rojo intenso + trama |

- Con 0 días o menos se muestra el aviso **«FECHA CUMPLIDA, RETIRAR INMEDIATAMENTE»**.
- «Vence hoy» y «Vencido» se distinguen por texto e icono, no solo por color.

### RF-07 — Indicadores

- Tarjetas en la parte superior: **Total de registros**, **Por vencer** (`0 ≤ días ≤ 21`), **Vencen hoy** (`= 0`), **Vencidos** (`< 0`).
- Cuentan **registros**, nunca cantidades.
- Son **globales**: no cambian con los filtros. Debajo de los filtros se muestra «N resultados» para el conjunto filtrado.
- Se recalculan tras crear, editar o eliminar.

### RF-08 — Vista de tabla

- Cinco columnas exactas: Encargado, Producto, Cantidad, Vencimiento, Días restantes.
- Una fila por registro; sin agrupación.
- Columna de acciones discreta al final (menú ⋯ con Editar/Eliminar), no es una columna de datos.
- En móvil: la tabla conserva las cinco columnas y hace scroll horizontal **dentro** de su contenedor; la página no se desplaza en horizontal. Acciones fijas a la derecha.

### RF-09 — Vista de tarjetas

- Una tarjeta por producto; dentro, sus registros ordenados por fecha ascendente.
- Encabezado: nombre del producto y número de registros.
- Cada registro: fecha, cantidad, encargado, días restantes y estado.
- Se muestran 3 registros; si hay más: «+ N vencimientos adicionales» + «Ver todos» / «Ver menos».
- Orden de tarjetas: por vencimiento más próximo.
- Agrupación **solo visual**: no fusiona datos ni suma cantidades.

### RF-10 — Selector de vista

- Disponible en todos los tamaños de pantalla.
- Inicial: tarjetas en `< 768 px`, tabla en `≥ 768 px`; la elección manual se recuerda en `localStorage`.
- Cambiar de vista conserva filtros, búsqueda y datos.

### RF-11 — Búsqueda y filtros

- **Búsqueda** por nombre de producto (sin distinguir mayúsculas ni acentos).
- **Filtros combinables** (AND entre categorías): producto, encargado, fecha exacta, rango de fechas, vencimiento próximo (7/10/15/21/30 días), estado (selección múltiple), orden.
- «Próximos N días» = `0 ≤ días ≤ N`; **no** incluye vencidos.
- Orden: cantidad asc/desc, vencimiento asc/desc, producto A-Z. Por defecto: vencimiento ascendente.
- Botón «Limpiar filtros»; contador de resultados; los filtros se aplican **antes** de agrupar tarjetas.

### RF-12 — Edición

- Se editan los cuatro campos; validación idéntica al alta.
- Al guardar se actualiza `updated_at`, se recalculan días/estado e indicadores, y ambas vistas reflejan el cambio.

### RF-13 — Eliminación

- Confirmación explícita: «¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.»
- Solo elimina el registro elegido; los demás registros del producto permanecen.

### RF-14 — Exportación

- Formatos: **CSV** y **Excel (.xlsx)**.
- Columnas: Encargado, Producto, Cantidad, Vencimiento (`DD/MM/AAAA`), Estado, Días restantes.
- Opción «Todos los registros» o «Solo los filtrados».
- Días y estado se calculan al generar el archivo.
- Una fila por registro; sin agrupar ni sumar.
- Nombre: `vencimientos-AAAA-MM-DD.csv` / `.xlsx`.
- CSV: UTF-8 con BOM, separador `;` (compatible con Excel en español).

### RF-15 — Acceso

- Sin sesión no se muestra ningún dato: solo la pantalla de acceso.
- Correo + contraseña contra Supabase Auth; registro público desactivado.
- Cierre de sesión visible en el header.

### RF-16 — Persistencia

- Supabase es la única fuente de verdad. Tras recargar, cerrar el navegador o abrir en otro dispositivo, los datos coinciden.

## 6. Reglas de negocio

1. La cantidad es un entero positivo; no se admiten decimales ni cero.
2. La fecha de vencimiento puede ser pasada o futura (se registran también productos ya vencidos).
3. Un mismo producto con la misma fecha y encargado puede registrarse varias veces: son lotes distintos.
4. Los indicadores cuentan registros, no productos ni cantidades.
5. El nombre del producto no se modifica al normalizarlo.
6. No se permite eliminar productos del catálogo desde la UI (solo registros).

## 7. Estados de interfaz

| Estado | Comportamiento |
|---|---|
| Cargando | Esqueletos en indicadores y resultados; sin saltos de layout |
| Vacío | Mensaje «Aún no hay productos registrados» + CTA de registro |
| Sin resultados | «No encontramos registros con esos filtros» + «Limpiar filtros» |
| Error de red | Aviso «No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.» + «Reintentar» |
| Guardando | Botón deshabilitado con indicador de progreso; sin doble envío |
| Éxito | Aviso accesible (`role="status"`) que se anuncia y desaparece |

## 8. Criterios de aceptación

- [ ] Registrar individual: aparece de inmediato con días y estado correctos.
- [ ] Registrar grupal con 3 filas: se crean 3 registros con el mismo encargado.
- [ ] Fallo en la fila 2 del alta grupal: no se guarda ninguna fila.
- [ ] Mismo producto 3 veces con fechas distintas: 3 registros independientes, cantidades sin sumar.
- [ ] Autocompletado: escribir «lec» sugiere «Leche Gloria»; «leche gloria» no duplica el producto.
- [ ] Días 22, 21, 11, 10, 1, 0 y −1 producen exactamente los estados de RF-06.
- [ ] Aviso «FECHA CUMPLIDA…» visible con 0 y con −1 días; etiquetas distintas para cada caso.
- [ ] Tabla con 5 columnas en 360 px, con scroll interno y sin desbordar la página.
- [ ] Tarjetas con 5 registros: 3 visibles, «+2 vencimientos adicionales», «Ver todos» funciona y permite contraer.
- [ ] Filtro «Próximos 7 días»: las tarjetas no muestran registros fuera del rango.
- [ ] Cambiar de vista con filtros activos: los filtros se conservan.
- [ ] Editar una fecha: cambian estado, indicadores y ambas vistas.
- [ ] Eliminar un registro: el mensaje de confirmación aparece; los demás registros del producto siguen ahí.
- [ ] Exportar CSV y XLSX (todos y filtrados): mismas filas, con estado y días correctos.
- [ ] Recargar y abrir en otro dispositivo: mismos datos.
- [ ] Sin sesión, no se puede leer ni escribir (RLS).

## 9. Preguntas abiertas

- Nombre comercial definitivo y logotipo.
- Umbral de «cantidad baja» (fuera de alcance hasta definirlo).
- ¿Se desea notificación por correo cuando algo vence? (futuro)
