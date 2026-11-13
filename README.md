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
| `docs/UX.md` | Identidad visual, tokens, componentes y responsive (se crea en la Fase 2) |
| [docs/FLOW.md](docs/FLOW.md) | Flujos de usuario |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Fases, riesgos y estado del proyecto |
| [docs/00-fase-0-analisis.md](docs/00-fase-0-analisis.md) | Análisis documental y decisiones de arranque |

## Seguridad

- RLS activada en todas las tablas; sin políticas para `anon` (acceso cero).
- Registro público de usuarios desactivado; solo existe la cuenta administradora.
- `.env.local` ignorado por Git; `.env.example` solo contiene nombres y placeholders.
- Cabeceras de seguridad y CSP en `vercel.json`.

## Licencia

Proyecto privado. Sin licencia pública de uso.
