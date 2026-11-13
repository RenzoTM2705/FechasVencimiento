# SKILLS.md

> Procedimientos repetibles. Ejecuta solo los pasos aplicables y registra cualquier paso omitido con su motivo.

## 1. Implementar una página o sección
1. Revisar brief, rutas, diseño existente y componentes reutilizables.
2. Confirmar contenido, CTA principal, estados y comportamiento responsive.
3. Implementar estructura semántica y estilos usando tokens existentes.
4. Añadir estados de carga, vacío, error y éxito cuando aplique.
5. Añadir metadatos de página y enlaces internos pertinentes.
6. Verificar teclado, foco, contraste, alt text y tamaños móviles.
7. Ejecutar lint, typecheck, tests y build disponibles; revisar diff.

## 2. Implementar un formulario
1. Definir campos mínimos, propósito, destinatario y mensaje de éxito.
2. Validar en cliente para UX y en servidor para seguridad.
3. Etiquetar cada campo; asociar errores con `aria-describedby` y `aria-invalid`.
4. Mostrar loading y bloquear envíos duplicados.
5. Manejar errores de red, validación y servidor sin perder datos.
6. Añadir protección anti-spam proporcional (honeypot/rate limit/CAPTCHA si procede).
7. Tras éxito, mostrar confirmación o página de gracias y medir conversión solo si analítica está aprobada.
8. Probar campos vacíos, inválidos, envío exitoso, fallo y teclado.

## 3. Revisar una feature / pull request
1. Comparar cambios con requisitos y alcance.
2. Revisar errores, casos límite, accesibilidad y responsive.
3. Verificar que no hay secretos, datos sensibles ni dependencias no aprobadas.
4. Comprobar enlaces, navegación, estados y manejo de errores.
5. Ejecutar checks disponibles y reportar resultados reales.
6. Confirmar documentación y `.env.example` actualizados si corresponde.
7. Entregar hallazgos por severidad: bloqueante, alto, medio, bajo.

## 4. Preparar lanzamiento
1. Confirmar contenido real, datos de contacto y permisos de imágenes.
2. Ejecutar lint, typecheck, tests y build de producción.
3. Verificar 404, rutas, formularios, enlaces, responsive y navegadores objetivo.
4. Revisar HTTPS, dominio canónico, redirecciones, headers y variables de entorno.
5. Revisar SEO técnico, sitemap, robots, canonical, Open Graph y datos estructurados aplicables.
6. Confirmar privacidad/cookies/aviso legal según jurisdicción y servicios usados; pedir revisión humana/legal cuando corresponda.
7. Configurar analítica solo con consentimiento cuando sea requerido y comprobar conversiones.
8. Confirmar monitoreo, backups y plan de rollback según criticidad.
9. No desplegar ni publicar sin autorización explícita.

## 5. Implementar un endpoint o API
1. Definir primero el contrato: método, ruta, request/response, códigos de estado, autenticación y autorización requeridas.
2. Validar entrada en servidor con esquema; autorización explícita por recurso.
3. Devolver errores consistentes sin filtrar internals; logging estructurado sin secretos ni PII innecesaria.
4. Límite de tamaño de payload y rate limiting en endpoints sensibles o costosos.
5. Escribir tests: caso feliz, validación inválida, sin auth, sin permisos y casos límite; mockear servicios externos.
6. Si hay código en navegador, verificar que ninguna clave privilegiada se expone al cliente.
7. Actualizar `CONTEXT.md`, `.env.example` y la documentación de API si cambias contrato o variables.

## 6. Cambiar el esquema / migración
1. Revisar el esquema actual y los datos existentes; confirmar backup antes de cualquier cambio destructivo (requiere aprobación).
2. Escribir una migración pequeña, versionada y reversible; constraints e índices explícitos.
3. Probar en copia/staging con datos representativos; aplicar y revertir si es viable.
4. Actualizar RLS/políticas, tipos generados y seeds según corresponda.
5. Verificar la app antes y después del despliegue de la migración; documentar en `CONTEXT.md`.

## 7. Documentar una decisión
1. Explicar contexto y problema.
2. Registrar opciones consideradas y decisión tomada.
3. Añadir consecuencias y limitaciones.
4. Actualizar `CONTEXT.md` si es arquitectura; `MEMORY.md` si es una restricción/decisión estable.
