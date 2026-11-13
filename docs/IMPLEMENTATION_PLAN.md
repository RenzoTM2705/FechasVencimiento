# Plan de implementación

> Estado y hoja de ruta por fases. Cada fase se desarrolla en su propia rama y se integra a `main` al terminar, conservando la rama en `origin` como registro del avance.

## Estado general

| Fase | Rama | Estado | Entregable |
|---|---|---|---|
| 0 | `docs/fase-0-analisis` | ✅ Hecha | Análisis documental y propuesta técnica (`docs/00-fase-0-analisis.md`) |
| 1 | `feat/fase-1-scaffold` | ✅ Hecha | Scaffold Vite + TS + Tailwind, tipos, cliente Supabase, docs base, CI |
| 2 | `feat/fase-2-interfaz` | ✅ Hecha | Identidad visual, header/footer, indicadores, filtros, tabla y tarjetas con datos simulados |
| 3 | `feat/fase-3-registro` | ✅ Hecha | Alta individual y grupal, validaciones y autocompletado |
| 4 | `feat/fase-4-supabase` | ✅ Hecha y verificada | Migraciones, RLS, RPC, servicios reales y sesión |
| 5 | `feat/fase-5-vencimientos` | ⏳ Pendiente | Avisos, indicadores conectados y validación exhaustiva de umbrales |
| 6 | `feat/fase-6-filtros` | ⏳ Pendiente | Búsqueda, filtros combinables, orden y contador |
| 7 | `feat/fase-7-crud-export` | ⏳ Pendiente | Edición, eliminación, exportación CSV/XLSX |
| 8 | `docs/fase-8-qa-deploy` | ⏳ Pendiente | QA responsive/a11y, checklists, README final y Vercel |

## Fase 1 — Preparación del proyecto

**Objetivo:** dejar un proyecto que arranca, compila, pasa lint/tests y documenta sus decisiones.

Entregables:

- `package.json` con scripts (`dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:run`) y pnpm como gestor.
- Vite + React 19 + TypeScript estricto + Tailwind 4 + Vitest.
- `src/lib/env.ts`, `src/lib/supabase.ts`, `src/lib/errors.ts`, `src/lib/cn.ts`.
- Tipos de base de datos y de dominio (`src/types/`).
- `.env.example`, `.gitignore`, `vercel.json` (CSP y cabeceras), CI en `.github/workflows/ci.yml`.
- Documentación base: `README.md`, `PROJECT_BRIEF.md`, `CONTEXT.md`, `MEMORY.md`, `docs/PRD.md`.
- Repositorio Git inicializado con rama `main` y rama de fase.

**Criterio de salida:** `pnpm lint`, `pnpm typecheck`, `pnpm test:run` y `pnpm build` en verde.

**Resultado (2026-11-13):** completada. Lint, typecheck y build sin errores; 13 pruebas en verde (`src/lib/errors.test.ts`). Dos ajustes de entorno quedaron documentados en `CONTEXT.md`: `node-linker=hoisted` (enlaces simbólicos no resolubles en algunos Windows) y `pool: 'threads'` en Vitest (el pool de procesos falla con EPERM en entornos restringidos).

## Fase 2 — Identidad visual e interfaz

**Objetivo:** una interfaz completa y usable con datos simulados, sin tocar la base todavía.

- Investigar skills de UI/UX disponibles y fijar identidad: paleta, tipografía, jerarquía, espaciados, radios y sombras.
- `docs/UX.md` con tokens y reglas de uso.
- Header con espacio de logotipo, nombre y cierre de sesión; footer discreto con año.
- Indicadores, barra de búsqueda/filtros, selector de vista, tabla (5 columnas) y tarjetas agrupadas.
- Estados: carga, vacío, sin resultados, error.
- Responsive verificado en 360/414/768/1024/1440 px.

**Criterio de salida:** ambas vistas funcionan con datos simulados en móvil y escritorio; a11y básica revisada (teclado, foco, contraste).

**Resultado (2026-11-13):** completada. Tokens y reglas en `docs/UX.md`; componentes base, header/footer, indicadores, barra de filtros funcional (búsqueda, encargado, estado, orden y limpiar), tabla de 5 columnas y tarjetas agrupadas con «Ver todos». Verificado con capturas reales en 1440, 768 y 500 px. El cálculo de vencimientos (`src/lib/expiry.ts`) se adelantó a esta fase porque la interfaz lo necesita; la Fase 5 queda para los avisos, los indicadores con datos reales y la validación exhaustiva de umbrales. Se añadieron 49 pruebas (expiry, filtros, agrupación y errores).

## Fase 3 — Registro de productos

- Diálogo de alta individual con validación por campo.
- Diálogo de alta grupal con filas dinámicas, encargado único y validación por fila.
- Autocompletado de productos contra el catálogo (servicio simulado hasta la Fase 4).
- Mensajes de error en español y bloqueo de doble envío.

**Criterio de salida:** altas válidas e inválidas cubiertas por pruebas; sin datos que se pierdan al fallar.

**Resultado (2026-11-13):** completada. Diálogos de alta individual y grupal sobre `<dialog>` nativo, autocompletado con patrón ARIA combobox, validación por campo y validación atómica del alta grupal (`validateBulk`: si una fila falla no se envía ninguna). Los datos siguen en memoria mediante `batches-service` con store suscribible (`useSyncExternalStore`); en la Fase 4 solo se cambia el servicio. 69 pruebas en verde (20 nuevas: validación, sugerencias y formularios).

## Fase 4 — Base de datos y persistencia

- `supabase/migrations/0001_core.sql`, `0002_rls.sql`, `0003_rpc.sql`.
- RLS activada y probada con la `anon key` (acceso cero).
- RPC `register_batches` y servicios `batches-service`, `products-service`.
- Sesión real: pantalla de acceso, guardia de sesión y cierre.
- `docs/TRD.md` con esquema, políticas y flujo de migraciones.

**Criterio de salida:** datos persistentes tras recargar y desde otro dispositivo; sin acceso anónimo.

**Resultado (2026-11-13):** implementada y **verificada contra el proyecto real**. Migraciones aplicadas, registro público desactivado, `check:supabase` en 7/7 y prueba E2E 9/9 (login, alta por RPC, normalización, atomicidad y limpieza). Falta únicamente el usuario administrador definitivo. Detalle en `docs/TRD.md` §8.

## Fase 5 — Lógica de vencimientos

- `src/lib/expiry.ts` + pruebas de 22/21/11/10/1/0/−1.
- Etiquetas, colores, iconos y aviso «FECHA CUMPLIDA, RETIRAR INMEDIATAMENTE».
- Indicadores conectados a datos reales.

**Criterio de salida:** los siete casos producen el estado esperado y los indicadores cuadran con la tabla.

## Fase 6 — Búsqueda y filtros

- `src/lib/filters.ts` y `sorting.ts` puros y probados.
- Barra de filtros combinables, contador de resultados, limpiar filtros.
- Filtros aplicados antes de agrupar tarjetas; estado conservado al cambiar de vista.

**Criterio de salida:** matriz de filtros cumplida; sin registros fuera de rango en tarjetas.

## Fase 7 — Edición, eliminación y exportación

- Edición en diálogo reutilizando el formulario.
- Eliminación con confirmación y actualización de indicadores.
- `export-csv.ts` y `export-xlsx.ts`; menú «Todos / Filtrados».

**Criterio de salida:** archivos abren en Excel/LibreOffice con columnas, fechas y estados correctos.

## Fase 8 — QA, accesibilidad y despliegue

- Revisión responsive y de accesibilidad (WCAG 2.2 AA como objetivo).
- `QUALITY_CHECKLIST`, `SECURITY_CHECKLIST` y `BACKEND_CHECKLIST` marcados con evidencia.
- README final, `.env.example` revisado, build de producción.
- Configuración de Vercel y verificación posterior al despliegue.

**Criterio de salida:** build de producción servido desde Vercel, login funcionando y checklists cerrados.

## Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| RLS mal configurada y datos expuestos | Baja | Crítico | Políticas solo `authenticated`, prueba con `anon` en Fase 4, revisión en Fase 8 |
| Error de zona horaria en días restantes | Media | Alto | Cálculo con `Date.UTC` + pruebas de umbrales y cambio de día |
| Tabla ilegible en móvil | Media | Medio | Scroll interno, `min-width`, acciones fijas, prueba en 360 px |
| Crecimiento del dataset | Baja | Medio | Guarda de 5 000 registros; paginación si el volumen lo exige |
| Dependencia de Supabase (servicio externo) | Baja | Medio | Exportación local como respaldo operativo |
| Deriva entre documentación y código | Media | Bajo | Docs en la misma rama que el cambio |

## Rollback

- **Código:** cada fase está en su rama; revertir es `git revert` del merge o volver a la etiqueta anterior de `main`.
- **Base de datos:** las migraciones son aditivas (`create table if not exists`, `create policy`); un rollback de esquema requiere migración explícita y backup previo.
- **Vercel:** redeploy de un deployment anterior desde el dashboard.

## Convenciones

- Commits: Conventional Commits en inglés (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- Una rama por fase; merge a `main` al terminar; sin `push --force`.
- Cada fase termina con: resumen, archivos tocados, decisiones, pruebas ejecutadas y pendientes.
