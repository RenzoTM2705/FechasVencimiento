# SECURITY_CHECKLIST.md

## Secretos y configuración
- [ ] `.env*` local está ignorado; `.env.example` contiene solo nombres y placeholders.
- [ ] No hay API keys privadas, tokens, contraseñas ni service-role keys en frontend.
- [ ] Si un secreto fue committeado, se revocó/rotó; borrarlo del último commit no basta.
- [ ] Variables públicas se consideran visibles para cualquier usuario.

## Datos y acceso
- [ ] Validación y autorización se ejecutan en servidor.
- [ ] Queries parametrizadas; no concatenar input en SQL.
- [ ] RLS habilitada y políticas probadas para tablas accesibles desde cliente.
- [ ] Mínimo privilegio: usuarios solo acceden a los registros permitidos.
- [ ] El servidor permite únicamente campos editables explícitamente (evitar mass assignment).
- [ ] Se devuelven solo los datos necesarios.
- [ ] Datos sensibles cifrados en tránsito y, cuando corresponda, en reposo.
- [ ] Contraseñas con algoritmo de hash apropiado (Argon2id/bcrypt gestionado por librería confiable); nunca cifrado reversible ni texto plano.
- [ ] Sesiones/cookies con Secure, HttpOnly y SameSite apropiados.

## Entradas, archivos y abuso
- [ ] Validar tipo, tamaño y contenido de archivos; no confiar en extensión/MIME del cliente.
- [ ] Sanitizar contenido solo cuando se renderice como HTML; preferir evitar HTML arbitrario.
- [ ] Rate limiting en endpoints sensibles y costosos.
- [ ] Protección anti-bot/spam proporcional al riesgo y accesible.
- [ ] Errores no filtran stack traces, secretos ni datos internos.
- [ ] Logs no contienen credenciales, tokens ni datos personales innecesarios.

## Transporte y dependencias
- [ ] HTTPS forzado; headers de seguridad configurados y probados.
- [ ] CSP definida y ajustada a recursos realmente usados; evitar `unsafe-eval` si es posible.
- [ ] Dependencias y lockfile auditados; revisar alertas antes de actualizar.
- [ ] CORS restringido a orígenes necesarios.
- [ ] Backups protegidos y restauración evaluada si se almacenan datos críticos.

## Reglas
- No prometas seguridad absoluta ni cumplimiento legal automático.
- No implementes controles que requieren backend solo en frontend.
- Escala a revisión humana los datos sensibles, pagos, autenticación, permisos y requisitos regulatorios.

---

## Estado de verificación — 2026-11-13

- [x] `.env` y `.env.local` ignorados por Git; `.env.example` solo con nombres y placeholders.
- [x] Sin claves privadas en el cliente: únicamente la publishable key; `src/lib/env.ts` aborta si detecta una clave con forma de `service_role`.
- [x] RLS activa en `stores`, `products` y `product_batches`; `anon` sin políticas. Probado con `pnpm run check:supabase` (7/7) y con peticiones directas a PostgREST.
- [x] Registro público desactivado (`disable_signup: true`) verificado vía API de Auth.
- [x] Validación de datos en cliente y de nuevo en las RPC del servidor (constraints + `raise exception`).
- [x] Errores sin detalles internos: `toFriendlyMessage` traduce códigos y nunca muestra mensajes de Postgres.
- [x] Sesión gestionada por Supabase Auth; sin cookies propias ni tokens en `localStorage` más allá de la sesión del SDK.
- [x] HTTPS y cabeceras en `vercel.json`: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- [x] Dependencias: `pnpm audit --prod` sin vulnerabilidades conocidas.
- [ ] **Modo público (`0005_modo_publico.sql`): no aplicado.** Si se activa, el acceso anónimo de lectura/escritura es un riesgo aceptado explícitamente por el propietario.
- [ ] Backups protegidos y restauración probada: **pendiente** (gestionados por Supabase; no se probó restaurar).
- [ ] Rotación de los tokens de acceso compartidos durante el desarrollo: **pendiente del propietario**.
- [ ] Datos personales: solo el nombre del encargado (dato laboral mínimo). Sin analítica, cookies no esenciales ni terceros.
