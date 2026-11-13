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
