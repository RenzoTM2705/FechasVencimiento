# QUALITY_CHECKLIST.md

> Checklist base. Marca N/A con motivo. No declares algo verificado si no lo probaste.

## Funcionalidad
- [ ] Todas las rutas esperadas cargan.
- [ ] Enlaces internos/externos funcionan y no llevan a placeholders.
- [ ] Botones tienen acción clara; no hay controles decorativos engañosos.
- [ ] Formularios validan, muestran errores por campo y error global.
- [ ] Formularios muestran loading, evitan doble envío y confirman éxito.
- [ ] Estados loading, vacío, error y éxito cubiertos donde corresponda.
- [ ] Página 404 personalizada y navegación de retorno.
- [ ] Página de gracias si el flujo de conversión la requiere.
- [ ] No queda contenido de prueba, lorem ipsum ni datos ficticios visibles.

## Diseño y responsive
- [ ] Diseño coherente con brief, jerarquía visual y CTA principal claro.
- [ ] Breakpoints probados en móvil, tablet y escritorio.
- [ ] No hay overflow horizontal ni contenido cortado.
- [ ] Imágenes optimizadas, proporciones correctas y lazy loading donde convenga.
- [ ] Favicon personalizado y recursos de marca correctos.

## Accesibilidad
- [ ] Navegación completa con teclado y foco visible.
- [ ] HTML semántico, landmarks y orden de encabezados lógico.
- [ ] Inputs con labels; errores accesibles.
- [ ] Contraste suficiente (objetivo WCAG 2.2 AA).
- [ ] Imágenes informativas con alt útil; decorativas con alt vacío.
- [ ] No depender solo del color; respetar reduced motion.
- [ ] Iconos interactivos tienen nombre accesible.

## SEO y compartir
- [ ] Título único y meta description por página indexable.
- [ ] Canonical correcto y URLs limpias.
- [ ] Open Graph (y Twitter/X card si aplica) con imagen válida.
- [ ] `sitemap.xml` y `robots.txt` correctos para el entorno de producción.
- [ ] No bloquear indexación accidentalmente; quitar `noindex` en producción si se desea indexar.
- [ ] Datos estructurados solo si corresponden y son veraces.
- [ ] Redirecciones 301 y una versión canónica del dominio configuradas.
- [ ] Jerarquía de enlaces internos coherente.

## Seguridad y privacidad
- [ ] No hay secretos en repositorio, bundle, logs ni historial reciente.
- [ ] Inputs validados en servidor; consultas parametrizadas.
- [ ] Autorización server-side y acceso a registros restringido.
- [ ] RLS activada y probada si la base de datos lo soporta y se usa desde cliente.
- [ ] Headers de seguridad y HTTPS revisados en hosting.
- [ ] Cookies/sesiones seguras; política de cookies si corresponde.
- [ ] Protección anti-spam/rate limiting en endpoints expuestos.
- [ ] Dependencias revisadas; no se ignoran vulnerabilidades relevantes.

## Backend y base de datos (si aplica)
- [ ] Ver `BACKEND_CHECKLIST.md` completado, o marcar N/A con motivo en la entrega.

## Operación y lanzamiento
- [ ] Analítica y eventos de conversión aprobados y probados; consentimiento configurado cuando aplique.
- [ ] Teléfono, correo, WhatsApp y redes enlazan a destinos reales y funcionan en móvil.
- [ ] Pruebas en navegadores objetivo.
- [ ] Consola sin errores relevantes; requests sin fallos inesperados.
- [ ] Caché configurada para assets apropiados.
- [ ] Backups, monitoreo y alertas definidos si hay backend/datos críticos.
- [ ] CI básica (lint, tests, build en cada push) configurada si el repo lo soporta.
- [ ] Certificado TLS y renovación automática confirmados por plataforma.
- [ ] Search Console/Bing Webmaster y ficha de Google configuradas solo si aplican y el propietario tiene acceso.

---

## Estado de verificación — 2026-11-13

Evidencia ejecutada: `pnpm run lint` (0), `pnpm run typecheck` (0), `pnpm run test:run` (95/95), `pnpm run build` (OK), `pnpm run check:contrast` (13/13), `pnpm run check:supabase` (7/7), `pnpm audit --prod` (sin vulnerabilidades), capturas reales en 390, 500, 768 y 1440 px.

### Funcionalidad
- [x] Una sola pantalla (acceso + panel). **404 personalizada: N/A** (sin rutas).
- [x] Formularios validan por campo, muestran error global, loading y bloqueo de doble envío (pruebas de componentes).
- [x] Estados cubiertos: cargando, vacío, sin resultados, error de red con «Reintentar», éxito.
- [x] Sin contenido de prueba: los datos de demostración se eliminaron de la base al cerrar cada fase.
- [x] Todas las acciones declaradas tienen comportamiento (registrar, editar, eliminar, filtrar, exportar, cerrar sesión).

### Diseño y responsive
- [x] Jerarquía clara, CTA principal visible («Registrar producto»), diseño coherente con `docs/UX.md`.
- [x] Breakpoints verificados con capturas: 390, 500, 768, 1440 px.
- [x] Sin scroll horizontal de página; la tabla lo hace dentro de su contenedor y con acciones fijas.
- [x] Favicon y logotipo: marcador reemplazable (`public/logo.svg`, `logo.tsx`).

### Accesibilidad
- [x] Navegación por teclado, foco visible, `<dialog>` nativo con foco atrapado.
- [x] HTML semántico, `caption` en tabla, `scope="col"`, jerarquía de encabezados.
- [x] Inputs con label; errores con `aria-invalid` y `aria-describedby`; avisos con `role="alert"`/`status`.
- [x] Contraste auditado: 13/13 combinaciones ≥ 4.5:1 (texto) y ≥ 3:1 (riel de estado).
- [x] Estado nunca solo por color: etiqueta, icono y texto.
- [x] `prefers-reduced-motion` respetado; iconos interactivos con `aria-label`.

### SEO y compartir
- [x] `title` y `description` únicos.
- [x] `noindex, nofollow` explícito: **canonical, Open Graph, sitemap, robots indexable y datos estructurados N/A** (aplicación privada).

### Seguridad y privacidad
- [x] Ver `SECURITY_CHECKLIST.md` (RLS probada, sin claves privilegiadas, CSP, dependencias auditadas).

### Operación y lanzamiento
- [x] CI en GitHub Actions: lint, typecheck, tests y build en cada push.
- [x] Caché de assets en `vercel.json` (immutable para `/assets`).
- [ ] Analítica y consentimiento: **N/A** (no se usa analítica).
- [ ] Pruebas en navegadores objetivo: **parcial** (Chrome headless; falta Safari/iOS real).
- [ ] Backups y restauración probada: **pendiente** (los gestiona Supabase; no se probó restaurar).
- [ ] Deployment en Vercel: **pendiente de autorización y variables de entorno**.
- [ ] Search Console/Bing/Google Business: **N/A**.
