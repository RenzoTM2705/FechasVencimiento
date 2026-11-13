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
