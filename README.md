# Control de Vencimientos

Aplicación web para registrar y vigilar las fechas de vencimiento de los productos de una tienda. Permite saber qué está por vencer, qué vence hoy y qué ya venció, sin hojas de cálculo ni cuentas manuales de días.

- **Una tienda, un administrador.** Acceso con Supabase Auth (correo y contraseña, registro público desactivado).
- **Registros independientes.** Un mismo producto puede tener varios lotes con fechas, cantidades y encargados distintos; nada se suma ni se fusiona.
- **Dos vistas siempre disponibles.** Tabla y tarjetas agrupadas por producto, tanto en celular como en computadora.
- **Datos remotos.** Supabase/PostgreSQL como única fuente de verdad; los indicadores y días restantes se calculan al vuelo.

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 19 + TypeScript + Tailwind CSS 4 (Vite 8) |
| Datos | Supabase (PostgreSQL, RLS, Auth) |
| Exportación | CSV propio + `write-excel-file` (.xlsx) |
| Pruebas | Vitest + Testing Library |
| Hosting | Vercel |

## Requisitos

- Node.js **22.12 o superior** (probado con 22.19)
- pnpm **11** (`corepack enable` o instalar pnpm)
- Un proyecto de Supabase con las migraciones de `supabase/migrations/` aplicadas

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
# completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local
pnpm dev
```

La aplicación queda en `http://localhost:5173`.

> El proyecto usa `node-linker=hoisted` (`pnpm-workspace.yaml`) para evitar fallos de resolución en Windows con enlaces simbólicos. No requiere pasos extra: `pnpm install` lo respeta.

### Modo demostración

Sin `VITE_SUPABASE_URL` ni `VITE_SUPABASE_ANON_KEY`:

- **Desarrollo** (`pnpm dev`): el panel arranca con datos de ejemplo en memoria y un aviso visible. Nada se guarda.
- **Producción** (`pnpm build`): se muestra una pantalla de configuración; la app no arranca con datos falsos.

### Acceso directo (solo desarrollo)

Para entrar sin escribir credenciales mientras se desarrolla, en `.env.local`:

```bash
VITE_ACCESO_DIRECTO=true
VITE_ACCESO_DIRECTO_EMAIL=tu-correo
VITE_ACCESO_DIRECTO_PASSWORD="tu-contraseña"
```

`pnpm dev` inicia sesión automáticamente y abre el panel. El módulo se carga con
`import()` dinámico dentro de un bloque `import.meta.env.DEV`: el build de
producción no lo incluye y las credenciales no llegan al bundle (verificado).
En producción el acceso sigue siendo con correo y contraseña.

### Modo público (sin login)

Existe un modo **sin pantalla de acceso**, desactivado por defecto. Para
activarlo hay que hacer **las dos cosas**:

1. Aplicar `supabase/migrations/0005_modo_publico.sql` (crea políticas RLS para `anon`).
2. Definir `VITE_MODO_ACCESO=publico` en el entorno de build.

> ⚠️ **Qué implica:** sin sesión no hay identidad que autorizar. Cualquier
> persona con la URL y la clave pública podrá **leer, crear, editar y borrar**
> registros. No es un modo «protegido»: es la base de datos abierta a quien
> tenga el enlace. Actívalo solo si asumes ese riesgo.

Para volver al login, ejecuta los `drop policy` / `revoke` que están al final de
`0005_modo_publico.sql` y quita `VITE_MODO_ACCESO` (o ponlo en `login`). El
componente de acceso sigue en el código: no se elimina nada.

### Logotipo

- `public/logo.ico`: favicon.
- `public/logo.png`: logotipo original de la tienda (Mass), usado como `apple-touch-icon` y fuente del wordmark.
- `public/logo-mark.png`: versión recortada y con fondo transparente para la cabecera, el acceso y la pantalla de carga.
- `src/components/layout/logo.tsx`: componente que usa el wordmark; si cambia el logotipo, reemplaza los archivos PNG/ICO.

La paleta sale del propio logotipo: amarillo `#FFBC00` para la cabecera y azul `#173E89` para la marca y la interacción. Detalle en `docs/UX.md`.

### Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Typecheck del proyecto + build de producción en `dist/` |
| `pnpm preview` | Sirve el build de producción localmente |
| `pnpm lint` | ESLint (flat config) |
| `pnpm typecheck` | TypeScript sin emitir |
| `pnpm test` | Vitest en modo watch |
| `pnpm test:run` | Vitest una vez (usado por CI) |
| `pnpm run check:supabase` | Verifica conexión, RLS y RPC contra el proyecto configurado |
| `pnpm run check:contrast` | Audita el contraste WCAG de los tokens de color |

## Base de datos

El esquema vive versionado en `supabase/migrations/`. Para un proyecto nuevo:

1. Crea el proyecto en [supabase.com](https://supabase.com) (una región cercana; plan gratuito es suficiente).
2. En **SQL Editor**, ejecuta los archivos en orden: `0001_core.sql`, `0002_rls.sql`, `0003_rpc.sql`.
3. En **Authentication > Sign In / Providers**, desactiva **Allow new users to sign up**.
4. En **Authentication > Users**, crea el usuario administrador con correo y contraseña.
5. Copia **Project URL** y **anon public key** (Project Settings > API) a tu `.env.local`.

> La `anon key` es pública por diseño: la protección real son las políticas RLS incluidas en `0002_rls.sql`. **Nunca** uses la `service_role` key en el cliente.

En Vercel, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en *Project Settings > Environment Variables* para Production, Preview y Development.

## Estructura

```text
src/
├─ app/           # composición de la aplicación (providers, shell)
├─ components/    # UI reutilizable y layout
├─ features/      # dominios: auth, batches, products, filters, dashboard, export
├─ lib/           # dominio puro y utilidades: env, supabase, expiry, filters, export
├─ types/         # tipos de base de datos y de dominio
├─ styles/        # tokens y estilos globales
└─ test/          # setup de pruebas
docs/             # PRD, TRD, UX, FLOW, plan de implementación y análisis de Fase 0
supabase/migrations/
```

Regla de arquitectura: **la UI nunca calcula días restantes ni estados**. Todo pasa por `src/lib/expiry.ts`, de modo que tabla, tarjetas, indicadores, filtros y exportación coinciden siempre.

## Ramas y flujo de trabajo

- `main`: estado entregable.
- Una rama por fase (`feat/fase-1-scaffold`, `feat/fase-2-interfaz`, …) con merge a `main` al terminar. Las ramas se conservan en `origin` como historial del avance.
- Commits en [Conventional Commits](https://www.conventionalcommits.org/) en inglés; documentación en español.

## Documentación

| Documento | Contenido |
|---|---|
| [PROJECT_BRIEF.md](PROJECT_BRIEF.md) | Alcance, usuarios y requisitos de alto nivel |
| [CONTEXT.md](CONTEXT.md) | Stack, arquitectura, variables de entorno y decisiones |
| [MEMORY.md](MEMORY.md) | Decisiones cerradas, restricciones y estado |
| [docs/PRD.md](docs/PRD.md) | Requisitos funcionales, umbrales y criterios de aceptación |
| [docs/TRD.md](docs/TRD.md) | Modelo de datos, RLS, RPC y operación |
| [docs/UX.md](docs/UX.md) | Identidad visual, tokens, componentes y responsive |
| [docs/FLOW.md](docs/FLOW.md) | Flujos de usuario |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Fases, riesgos y estado del proyecto |
| [docs/00-fase-0-analisis.md](docs/00-fase-0-analisis.md) | Análisis documental y decisiones de arranque |

## Despliegue en Vercel

1. Importa `RenzoTM2705/FechasVencimiento` en Vercel.
2. Framework **Vite**; build `pnpm run build`; salida `dist` (ya declarado en `vercel.json`).
3. En *Settings → Environment Variables* define, para Production, Preview y Development:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Opcional: `VITE_MODO_ACCESO=publico` solo si se aplicó `0005_modo_publico.sql` (ver «Modo público»).
5. Deploy. Tras publicar, ejecuta `pnpm run check:supabase` en local para confirmar que el proyecto responde.

No se despliega nada sin autorización explícita del propietario.

## Seguridad

- RLS activada en todas las tablas; sin políticas para `anon` (acceso cero).
- Registro público de usuarios desactivado; solo existe la cuenta administradora.
- `.env.local` ignorado por Git; `.env.example` solo contiene nombres y placeholders.
- Cabeceras de seguridad y CSP en `vercel.json`.

## Licencia

Proyecto privado. Sin licencia pública de uso.
