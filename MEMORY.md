# MEMORY.md

> Solo información estable que evite repetir contexto. No es un diario ni un changelog; el avance por fases vive en `docs/IMPLEMENTATION_PLAN.md`.

## Decisiones cerradas

- **Stack:** React 19 + TypeScript 6 + Vite 8 + Tailwind 4 + Supabase + Vercel — aprobado por el cliente (2026-11-13).
- **Sin API propia:** Supabase (PostgREST + RPC) es el backend (2026-11-13).
- **Auth:** Supabase Auth con correo y contraseña; registro público desactivado; un único administrador creado a mano (2026-11-13).
- **Días restantes no persistidos:** se calculan en cliente con `Date.UTC` sobre fechas de calendario (2026-11-13).
- **Registros independientes:** nunca se agrupan, suman ni fusionan datos; la agrupación de tarjetas es solo visual (2026-11-13).
- **Alta grupal transaccional** vía RPC `register_batches`, también usada por el alta individual (2026-11-13).
- **Indicadores globales** (independientes de filtros) + contador de resultados (2026-11-13).
- **Exportación:** CSV UTF-8 con BOM y separador `;`; XLSX con `write-excel-file` (2026-11-13).

## Restricciones vigentes

- El código del proyecto vive en `E:\Proyectos\FechasVencimiento` (repo Git con ramas por fase).
- La `service_role` key no puede aparecer en el cliente, en `.env.example` ni en documentación.
- Sin dependencias fuera de la lista aprobada (`docs/00-fase-0-analisis.md`, sección 6); cualquier alta requiere confirmación.
- Sin deploy a Vercel ni compra de servicios sin autorización explícita.
- La plantilla maestra de `E:\Proyectos\Boveda-Obsidian\Proyectos` no se modifica.

## Errores resueltos relevantes

- `SetNamedSecurityInfoW failed (Win32 5)` al escribir en el workspace — causa: faltaba `WRITE_OWNER` en la carpeta de trabajo — solución: reparación de permisos con el script de diagnóstico (2026-11-13).
- `npx` falla con `EPERM` dentro del sandbox — causa: la caché de npm apunta fuera del workspace — solución: `npm_config_cache` dentro del workspace (2026-11-13).

## Preferencias de colaboración

- Preferir cambios pequeños y explicaciones claras.
- Antes de decisiones irreversibles o fuera del alcance, pedir confirmación.
- No asumir datos reales, secretos, contenido legal ni servicios contratados.
- Documentación en español; identificadores y commits en inglés.
- Comentarios en el código: solo cuando explican el porqué, en español.

## Estado actual

- **Fase:** mantenimiento — proyecto entregado (Fases 0 a 8 cerradas).
- **Hecho:** aplicación completa con Supabase real, marca de la tienda aplicada, QA y checklists con evidencia, documentación al día.
- **Verificación Supabase (2026-11-13):** `check:supabase` 7/7; E2E de alta 9/9; CRUD 10/10; datos de prueba eliminados. Base final: 0 lotes, 0 productos, 1 tienda, 1 usuario administrador.
- **Acceso:** login en desarrollo y producción (correo + contraseña). `VITE_ACCESO_DIRECTO` está apagado y `.env.local` no existe; el código queda por si se quiere usar en local. `VITE_MODO_ACCESO=publico` **no está aplicado** y no se recomienda.
- **Marca:** paleta derivada del logotipo del cliente (Mass): cabecera amarilla `#FFBC00`, azul `#173E89` para marca e interacción. Wordmark recortado y transparente en `logo-mark.png`; favicon `logo.ico`.
- **Pendiente del propietario:** revocar tokens compartidos, probar restauración de backup y validar en Safari/iOS.
- **Bloqueos:** ninguno.
