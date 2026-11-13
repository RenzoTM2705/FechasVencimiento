# UX — Control de Vencimientos

> Identidad visual, tokens y reglas de interfaz. Es la fuente única del diseño: los componentes no usan hex sueltos, solo tokens.

## 1. Dirección de diseño

**«Registro operativo»**: una herramienta de trabajo, no una landing. La estética parte del minimalismo suizo — rejilla, tipografía clara, hairlines, cero decoración — porque el usuario es personal de tienda que necesita leer estados, no admirar la interfaz.

Decisiones:

- **Neutralidad al servicio del semáforo.** El fondo es gris frío muy claro y la tinta casi negra. El color saturado se reserva **exclusivamente** para los estados de vencimiento. Así, un rojo en pantalla significa siempre lo mismo y nunca compite con la marca.
- **Marca contenida.** La cabecera usa tinta oscura (`--color-brand`); el acento azul (`--color-accent`) se usa solo en foco, enlaces y algún detalle. Nada de degradados.
- **Firma visual.** Cada fila y cada registro lleva un **riel de estado** (barra de 3 px a la izquierda) del color del semáforo. Es el elemento reconocible de la aplicación y funciona sin leer.
- **Densidad controlada.** Tabla cómoda (no compacta) con cifras tabulares para que cantidades y fechas se alineen en columna.

Referencia de la skill `ui-ux-pro-max`: producto «Inventory & Stock Management» → *Flat Design + Minimalism & Swiss Style*, dashboard *Real-Time Monitoring + Data-Dense*, paleta «functional neutral + status traffic-light». Se descarta el pairing tipográfico Rubik + Nunito Sans que propuso para retail/e-commerce: en una tabla densa y en móvil, una sola grotesca con numerales tabulares (Inter) lee mejor y evita cargar dos familias. Se descarta también el verde como color de marca, porque el verde ya significa «vigente».

## 2. Paleta

### Base

| Token | Hex | Uso |
|---|---|---|
| `--color-canvas` | `#F4F6F8` | Fondo de la aplicación |
| `--color-surface` | `#FFFFFF` | Tarjetas, tabla, barra de filtros |
| `--color-surface-sunken` | `#EEF1F5` | Cabecera de tabla, campos, zonas inactivas |
| `--color-ink` | `#0B1220` | Texto principal, cabecera |
| `--color-ink-soft` | `#334155` | Texto secundario |
| `--color-ink-muted` | `#5F6E85` | Metadatos, ayudas (4.78:1 sobre el lienzo) |
| `--color-line` | `#E3E8EF` | Hairlines, bordes de tarjeta |
| `--color-line-strong` | `#CBD5E1` | Bordes de campos y separadores fuertes |
| `--color-brand` | `#0F172A` | Cabecera, botón primario |
| `--color-accent` | `#0B6FA4` | Foco, enlaces, detalle de marca |
| `--color-accent-soft` | `#E7F2F9` | Fondo de foco/selección |

### Estados de vencimiento (semáforo)

| Estado | Texto | Fondo | Borde | Token de texto |
|---|---|---|---|---|
| Vigente (>21 d) | `#166534` | `#E8F5EC` | `#BFE3CA` | `--color-ok` |
| Próximo (11–21 d) | `#92400E` | `#FDF4E3` | `#F0D5A4` | `--color-warn` |
| Crítico (1–10 d) | `#B42318` | `#FDECEA` | `#F3C4BF` | `--color-danger` |
| Vence hoy (0 d) | `#FFFFFF` | `#B42318` | `#B42318` | `--color-danger` (sólido) |
| Vencido (<0 d) | `#7A271A` | `#FBE9E7` | `#E7B3AA` | `--color-expired` |

Contrastes verificados sobre el fondo indicado: todos ≥ 4.5:1 para texto normal. «Vence hoy» usa relleno sólido + texto blanco (6.1:1) y «Vencido» añade trama diagonal, de modo que los dos rojos no dependen solo del tono.

### Regla de color

- Verde, ámbar y rojo **solo** para estados de vencimiento. Nunca para botones, iconos decorativos ni cifras.
- El resto de la interfaz es neutro: tinta, gris y azul de acento.

## 3. Tipografía

- **Familia:** Inter Variable (`@fontsource-variable/inter`). Una sola familia con pesos 400–700.
- **Escala:**

| Rol | Tamaño / peso | Uso |
|---|---|---|
| Display | 28–32 px / 600, tracking −0.02em | Nombre de la app, cifras de indicadores |
| Título | 18–20 px / 600 | Títulos de sección, nombre de producto en tarjeta |
| Cuerpo | 15 px / 400, interlínea 1.5 | Texto general, celdas |
| Cuerpo compacto | 14 px / 400 | Tabla, filtros, metadatos |
| Micro-etiqueta | 11 px / 600, mayúsculas, tracking 0.08em | Encabezados de columna, rótulos de indicador |

- **Cifras tabulares** en cantidades, fechas, días restantes e indicadores (`font-variant-numeric: tabular-nums`).
- En móvil nunca se baja de 13 px; el texto de cuerpo se mantiene en 15 px.
- Los días restantes usan peso 600 y cifras tabulares: son el dato que el usuario escanea.

## 4. Espaciado, radios y sombras

- Escala base 4 px. Contenedor máximo `1200px`, padding lateral 16 px (móvil) / 24 px (tablet) / 32 px (escritorio).
- Radios: `8px` campos y botones, `10px` badges, `14px` tarjetas y paneles.
- Sombras: una sola (`--shadow-card`), casi imperceptible. La jerarquía se construye con hairlines y espacio, no con profundidad.
- Altura de controles: 40 px en escritorio, **44 px en móvil** (área táctil mínima).

## 5. Componentes

| Componente | Reglas |
|---|---|
| **Header** | Sticky, fondo tinta, 56 px de alto. Espacio de logo 36 px (reemplazable), nombre de la app, fecha del día a la derecha. Sin navegación: no hay rutas. |
| **Footer** | Hairline superior, texto 13 px: nombre, descripción de una línea y año actual. |
| **Indicador** | Panel blanco con riel superior de 3 px, micro-etiqueta, cifra grande tabular y leyenda corta. 2 columnas en móvil, 4 en escritorio. |
| **Botón** | Primario (tinta), secundario (borde), fantasma (texto), peligro. Foco visible con anillo azul de 2 px. |
| **Campo** | Etiqueta visible arriba, ayuda opcional, error debajo con icono y `aria-invalid`. Borde `--color-line-strong`; foco azul. |
| **Badge de estado** | Píldora con icono + texto. Nunca solo color. |
| **Tabla** | Cabecera gris con micro-etiquetas en mayúsculas; filas con hairline; riel de estado en la primera celda; hover con tinte neutro; scroll horizontal interno en móvil. |
| **Tarjeta de producto** | Cabecera con nombre + contador de registros; lista de registros con riel de estado; «+N vencimientos adicionales» y «Ver todos» cuando hay más de 3. |
| **Vacío / sin resultados** | Icono, frase clara y acción (`Registrar productos` o `Limpiar filtros`). |

### 5.1 Búsqueda y filtros

- **Fila principal:** buscador de producto, encargado, orden y botón **«Filtros»** con contador de filtros activos.
- **Estados:** cinco chips conmutables (`Vigente`, `Próximo a vencer`, `Crítico`, `Vence hoy`, `Vencido`). Se combinan entre sí (OR) y con el resto de filtros (AND). Activo = fondo tinta, nunca color de estado, para no confundir filtro con semáforo.
- **Panel avanzado** (oculto hasta pulsar «Filtros»): producto, fecha exacta, próximos 7/10/15/21/30 días, y rango desde/hasta. Elegir fecha exacta limpia el rango y viceversa.
- **Pie:** «N de M registros», «Limpiar filtros» (solo si hay filtros activos) y el selector tabla/tarjetas.
- Los filtros se aplican **antes** de agrupar las tarjetas, así que ninguna tarjeta muestra registros fuera del rango.

### 5.3 Acciones, edición y exportación

- **Acciones por registro:** dos botones discretos al final de la fila (lápiz y papelera) y junto al estado en las tarjetas. Etiqueta accesible con producto y fecha (`Editar Leche Gloria del 2026-11-13`).
- **Edición:** reutiliza el diálogo de alta en modo edición; el encargado, producto, cantidad y fecha se precargan, y el aviso recuerda que los demás registros del producto no se tocan.
- **Eliminación:** diálogo modal con la pregunta de confirmación, resumen del registro (producto, encargado, cantidad, vencimiento y días) y botón de peligro. Nunca elimina sin confirmación.
- **Exportación:** diálogo con dos decisiones — formato (CSV o Excel) y alcance (todos o solo los filtrados, con el número de registros). El archivo incluye estado y días calculados en ese momento; una fila por registro.

### 5.4 Avisos de retiro

Cuando la fecha ya se cumplió (`días ≤ 0`) el registro muestra, además de su etiqueta de estado, un aviso con el texto exacto **«FECHA CUMPLIDA, RETIRAR INMEDIATAMENTE»**:

| Caso | Apariencia |
|---|---|
| Vence hoy (0 d) | Chip rojo sólido con texto blanco e icono de reloj de alarma |
| Vencido (< 0 d) | Chip rojo oscuro con trama diagonal e icono de X |

- El aviso aparece en **ambas vistas**: como chip bajo la etiqueta en la tabla y dentro de cada registro en las tarjetas.
- Nunca se representa solo con color: el chip lleva texto y el estado tiene su propia etiqueta.
- Sobre la lista, un **aviso resumen** (`role="alert"`) indica cuántos registros tienen la fecha cumplida y ofrece **«Ver solo estos»**, que aplica el filtro de estado a *Vence hoy* + *Vencido*.
- El resumen cuenta registros, no cantidades, y no cambia con los filtros: refleja la situación real de la tienda.

## 6. Interacción

- Transiciones de 150–200 ms en color y sombra; nada de desplazamientos llamativos.
- Hover solo como refuerzo: toda acción existe también con foco de teclado.
- Estados de carga: esqueletos con la misma altura que el contenido final (sin salto de layout).
- Feedback: `role="status"` para confirmaciones, `role="alert"` para errores.
- `prefers-reduced-motion`: se anulan animaciones y transiciones.

## 7. Responsive

| Rango | Layout |
|---|---|
| < 640 px | 1 columna; indicadores 2×2; filtros apilados; tabla con scroll interno (`min-width: 680px`); tarjetas verticales |
| 640–1023 px | Indicadores 4 columnas desde 768 px; filtros en 2 filas; tarjetas en 2 columnas |
| ≥ 1024 px | Contenedor 1200 px; filtros en una fila; tarjetas en 3 columnas; tabla completa |

- La página **nunca** hace scroll horizontal; solo el contenedor de la tabla.
- Ambas vistas están disponibles en todos los tamaños; el valor inicial depende del ancho (tabla ≥ 768 px) y la elección manual se guarda en `localStorage`.

## 8. Accesibilidad

- Contraste ≥ 4.5:1 en texto; ≥ 3:1 en bordes de controles y en el riel de estado.
- Foco visible en todo elemento interactivo (anillo de 2 px, offset 2 px).
- Iconos decorativos con `aria-hidden="true"`; iconos con acción, con `aria-label`.
- Tabla con `<caption>` para lectores de pantalla y `scope="col"` en los encabezados.
- Estado y días restantes siempre con texto; el color es refuerzo.
- Orden de foco natural; sin trampas de teclado.

## 9. Pendiente de decisión del cliente

- Logotipo definitivo (hoy `public/logo.svg` es un marcador neutro).
- Nombre comercial, si difiere de «Control de Vencimientos».
