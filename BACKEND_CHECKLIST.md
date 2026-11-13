# BACKEND_CHECKLIST.md

> Aplicar cuando el proyecto tenga servidor, API o base de datos. Marca N/A con motivo; no declares algo verificado si no lo probaste. No sustituye una revisión de arquitectura ni de seguridad (ver `SECURITY_CHECKLIST.md`).

## Diseño de API

- [ ] Rutas coherentes y predecibles; versionado (`/v1/` o cabecera) si la API es pública o tiene consumidores externos.
- [ ] Contrato documentado (OpenAPI, GraphQL schema o README) con request/response y códigos de error.
- [ ] Validación server-side de tipos, formato, rango y campos permitidos en cada entrada.
- [ ] Autorización por recurso (no basta autenticación); permisos verificados en servidor.
- [ ] Respuestas de error consistentes (código + mensaje) sin filtrar stack traces ni internals.
- [ ] Listados con paginación y límite máximo de tamaño de página.
- [ ] Idempotencia o deduplicación en operaciones sensibles (pagos, altas con reintentos, webhooks).
- [ ] Solo se devuelven los campos necesarios (evitar over-fetching de datos sensibles).

## Base de datos y migraciones

- [ ] Migraciones versionadas, pequeñas y reversibles (down) cuando sea viable.
- [ ] Migraciones destructivas (DROP, renames con pérdida de datos) solo con backup confirmado y aprobación explícita.
- [ ] Constraints de integridad definidos: PK, FK, UNIQUE, NOT NULL, CHECK.
- [ ] Índices para las consultas frecuentes; evitar N+1 queries en endpoints de listado.
- [ ] RLS habilitada y políticas probadas si el cliente accede directamente a tablas.
- [ ] Migraciones probadas en copia/staging con datos representativos antes que en producción.
- [ ] Seeds o datos de prueba separados de los datos reales; nunca en producción.
- [ ] Backups con restauración **probada** al menos una vez; frecuencia según criticidad de los datos.

## Fiabilidad y operación

- [ ] Endpoint de health check (`/health` o equivalente).
- [ ] Logging estructurado sin secretos, tokens ni datos personales innecesarios.
- [ ] Timeout en llamadas a servicios externos; reintentos con backoff donde tenga sentido.
- [ ] Comportamiento definido cuando una dependencia externa cae (degradación elegante o error explícito).
- [ ] Rate limiting en endpoints sensibles y costosos.
- [ ] Métricas y alertas básicas (tasa de error, latencia) si hay producción.
- [ ] Variables de entorno documentadas en `.env.example` y configuración validada al arrancar (fail fast).

## Testing

- [ ] Tests de endpoints: caso feliz, validación inválida, sin autenticación, sin permisos, casos límite.
- [ ] Tests de migración (aplicar y revertir) cuando sea viable.
- [ ] Mocks de servicios externos; los tests no dependen de producción ni de credenciales reales.
- [ ] Comprobación de rendimiento razonable en endpoints críticos (sin consultas patológicas).

## Datos personales

- [ ] Minimización: se recolectan solo los datos necesarios.
- [ ] Retención y borrado definidos; los datos inactivos se purgan o anonimizan.
- [ ] Cifrado en tránsito (TLS) y, cuando corresponda, en reposo.
- [ ] Escala a revisión humana cualquier tratamiento de datos sensibles, pagos o requisitos regulatorios.

---

## Estado de verificación — 2026-11-13

**No hay API propia:** el backend es Supabase (PostgREST + RPC). Por eso los ítems de contrato de API, versionado, `/health` propio, rate limiting, paginación de endpoints e idempotencia se marcan **N/A** con motivo.

### Diseño de API
- [x] Contrato documentado en `docs/TRD.md` §5: firma de `register_batches` y `update_batch`, argumentos, retorno y códigos de error.
- [x] Validación server-side de tipos, rango y campos permitidos (constraints + validaciones en las RPC).
- [x] Autorización por recurso delegada en RLS (no basta autenticación: se probó que `anon` no accede).
- [x] Errores consistentes: códigos estables traducidos en el cliente, sin detalles internos.
- [x] Solo se devuelven los campos necesarios (select explícito).
- [ ] Paginación: **N/A en v1** (una tienda, < 5 000 filas; revisar si crece).
- [ ] Versionado de API pública: **N/A** (sin consumidores externos).

### Base de datos y migraciones
- [x] Migraciones versionadas y no destructivas: `0001_core`, `0002_rls`, `0003_rpc`, `0004_crud` (+ `0005_modo_publico` opcional, no aplicada).
- [x] Constraints: PK, FK `on delete restrict`, `NOT NULL`, `CHECK quantity > 0`, longitudes, `UNIQUE normalized_name`.
- [x] Índices para las consultas frecuentes: `(store_id, expiration_date)`, `(product_id)`, `(store_id, responsible_name)`.
- [x] RLS habilitada y probada con `check:supabase` y peticiones directas.
- [x] Migraciones aplicadas y verificadas en el proyecto real; `prosecdef = false` en las dos RPC.
- [ ] Seeds separados de datos reales: **N/A** (solo la tienda inicial; los datos de prueba se crean y eliminan en scripts temporales).
- [ ] Backups con restauración probada: **pendiente**.

### Fiabilidad y operación
- [x] Health check: **N/A propio**; Supabase expone `/auth/v1/health` (verificado 200).
- [x] Logs: Supabase (Auth/Postgres/API) y Vercel; la app no registra datos personales.
- [x] Timeout en llamadas externas: el cliente usa fetch del navegador con error controlado; no hay reintentos automáticos.
- [x] Degradación: error explícito con «Reintentar» y mensaje comprensible si falla la red.
- [ ] Rate limiting: **delegado en Supabase/Vercel** (no configurado explícitamente).
- [ ] Métricas y alertas: **pendiente** (solo logs).
- [x] Variables de entorno documentadas en `.env.example` y validadas al arrancar (`src/lib/env.ts`).

### Testing
- [x] 95 pruebas de dominio y componentes; E2E 9/9 y CRUD 10/10 contra el proyecto real.
- [ ] Tests de migración (aplicar y revertir): **N/A** (migraciones idempotentes y no destructivas; reversión documentada en TRD).
- [x] Servicios externos no forman parte de los tests unitarios; los E2E usan un proyecto de prueba y limpian sus datos.
- [x] Comprobación de rendimiento razonable: consulta única ordenada por índice, sin N+1.

### Datos personales
- [x] Minimización: solo el nombre del encargado.
- [ ] Retención y borrado definidos: **pendiente** (sin política formal en v1).
- [x] Cifrado en tránsito (TLS) por Supabase y Vercel.
- [x] Sin datos sensibles, pagos ni requisitos regulatorios conocidos.
