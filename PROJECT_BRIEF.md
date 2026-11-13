# PROJECT_BRIEF.md — Control de Vencimientos

> Brief del proyecto. Los datos desconocidos se marcan `Por definir`; lo que no aplica se marca `N/A` con motivo. No inventar datos de marca, contacto ni legales.

## Resumen

- **Nombre:** Control de Vencimientos (nombre de trabajo; sin marca comercial definida).
- **Tipo:** aplicación web interna (dashboard operativo) para una tienda.
- **Objetivo de negocio:** reducir pérdidas por productos vencidos y evitar el retiro tardío de mercadería.
- **Audiencia:** personal de tienda sin conocimientos técnicos, en celular y computadora.
- **Problema que resuelve:** hoy el control se hace de memoria o en papel/Excel, y se descubren vencimientos cuando el producto ya no se puede vender.

## Alcance inicial

- **Páginas/rutas:** una sola pantalla (login + panel). Sin rutas adicionales en v1.
- **Funcionalidades imprescindibles:**
  - Alta individual y alta grupal de vencimientos (encargado, producto, cantidad, fecha).
  - Catálogo de productos con autocompletado y nombres normalizados.
  - Indicadores globales de vencimientos.
  - Vista de tabla (5 columnas) y vista de tarjetas agrupadas por producto.
  - Búsqueda, filtros combinables y ordenamiento.
  - Edición y eliminación individual con confirmación.
  - Exportación CSV y Excel (todos o filtrados).
  - Persistencia en Supabase con acceso autenticado.
- **Fuera de alcance (v1):** inventario y stock, compras/proveedores, ventas, código de barras, notificaciones automáticas, multi-tienda con selector, roles y permisos, historial de auditoría, analítica, PWA/offline, importación de archivos, umbral configurable de "cantidad baja".
- **CTA principal:** «Registrar productos».
- **CTA secundario:** «Exportar».

## Contenido y marca

- **Nombre comercial y descripción:** Control de Vencimientos — «Registra y vigila las fechas de vencimiento de tu tienda».
- **Tono:** directo, claro y tranquilizador; nada técnico.
- **Logo/identidad disponible:** **Por definir**. El header reserva un espacio con `public/logo.svg` como marcador reemplazable.
- **Colores/tipografía existentes:** **Por definir**. La identidad se define en `docs/UX.md` (Fase 2).
- **Imágenes y derechos de uso:** N/A (la app no usa imágenes de contenido).
- **Dirección, teléfono, correo y redes reales:** N/A (herramienta interna; no hay datos de contacto que publicar).

## Requisitos funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Alta individual de un vencimiento | Must | Guarda encargado, producto, cantidad y fecha; aparece de inmediato en la vista activa |
| RF-02 | Alta grupal con encargado único y filas dinámicas | Must | N filas, todas con el mismo encargado; si una falla no se guarda ninguna |
| RF-03 | Catálogo separado con autocompletado | Must | Sugerencias de productos existentes; se puede escribir uno nuevo; "Leche Gloria" y "leche gloria" son el mismo producto |
| RF-04 | Registros independientes | Must | Mismo producto con 3 fechas distintas muestra 3 registros; cantidades nunca se suman |
| RF-05 | Días restantes calculados | Must | Cálculo por fecha de calendario local; no se persiste en la base |
| RF-06 | Estados y colores por umbral | Must | >21 vigente; 11–21 próximo; 1–10 crítico; 0 vence hoy; <0 vencido |
| RF-07 | Aviso «FECHA CUMPLIDA, RETIRAR INMEDIATAMENTE» | Must | Visible con 0 días o menos; distinguish vence hoy vs vencido por texto e icono |
| RF-08 | Indicadores globales | Must | Total, por vencer, vencen hoy y vencidos; cuentan registros, no cantidades; se actualizan tras cada operación |
| RF-09 | Vista de tabla en todos los dispositivos | Must | Exactamente 5 columnas; scroll horizontal interno en móvil |
| RF-10 | Vista de tarjetas agrupadas | Must | Agrupa por producto, ordena por fecha, 3 + «Ver todos»; filtros aplicados antes de agrupar |
| RF-11 | Búsqueda y filtros combinables | Must | Producto, encargado, fecha exacta, rango, próximos 7/10/15/21/30 días, estado, orden |
| RF-12 | Edición individual | Must | Modifica los 4 campos, recalcula estado e indicadores y actualiza ambas vistas |
| RF-13 | Eliminación con confirmación | Must | Solo borra el registro elegido; otros registros del producto intactos |
| RF-14 | Exportación CSV y Excel | Must | Incluye encargado, producto, cantidad, vencimiento, estado y días restantes; todos o filtrados |
| RF-15 | Sesión de administrador | Must | Sin sesión no se ven datos; registro público desactivado |
| RF-16 | Persistencia remota | Must | Datos disponibles tras recargar, cerrar el navegador y desde otro dispositivo |

## Requisitos no funcionales

- **Responsive:** 360 px a 1440 px; tabla y tarjetas disponibles en todos los tamaños.
- **Accesibilidad:** objetivo WCAG 2.2 AA; estado nunca solo por color; foco visible; etiquetas en todos los campos.
- **SEO/indexación:** N/A. Aplicación privada con `noindex`; sin sitemap, OG ni datos estructurados.
- **Rendimiento:** una consulta de registros y una de catálogo; filtrado en cliente; presupuesto de bundle inicial < 250 kB gzip.
- **Seguridad/privacidad:** RLS, sin `service_role` en cliente, sin datos personales más allá del nombre del encargado (dato laboral mínimo).
- **Navegadores objetivo:** Chrome/Edge/Firefox/Safari en versiones actuales, Android e iOS.

## Integraciones

- **Formulario / email:** N/A.
- **CRM / API:** N/A (sin API propia; Supabase es el backend).
- **Analítica:** N/A (no aprobada; si se incorpora requiere consentimiento y política de cookies).
- **CMS:** N/A.
- **Base de datos:** Supabase (PostgreSQL 15+).
- **Otros:** Vercel (hosting).

## Entregables y aceptación

- [x] Fase 0: análisis documental y propuesta técnica aprobada.
- [ ] Páginas y funcionalidades acordadas completadas.
- [ ] Pruebas y checklist completados.
- [ ] Build y deploy aprobados por el responsable.

## Preguntas abiertas

- [ ] Nombre comercial definitivo y logotipo (responsable: cliente).
- [ ] Proyecto Supabase creado y credenciales disponibles (responsable: cliente).
- [ ] Repositorio GitHub creado (`RenzoTM2705/FechasVencimiento`, privado) (responsable: cliente).
- [ ] Fecha objetivo de publicación en Vercel (responsable: cliente).
