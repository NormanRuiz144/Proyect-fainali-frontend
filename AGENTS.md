# AGENTS.md

Three independent apps. No monorepo tool, no CI.
Enforced package manager: `npm` (via `packageManager` field in each `package.json`).

## Projects

| Project | Path | Stack | Dev command |
|---|---|---|---|
| Angular frontend | `.` (root) | Angular 21 standalone, Vitest, TS 5.9 | `npm start` → `ng serve` (:4200) |
| Duplicate frontend | `./Proyect-fainali-frontend/` | Same stack, **separate `node_modules`** | `npm start` (:4200) |
| AdonisJS backend | `./Proyect-fainali/` | AdonisJS 7, Lucid ORM, PostgreSQL 5431, Japa, TS 5.9 | `npm run dev` → `node ace serve --hmr` (:3333) |
| .NET API | `./Backend_Cinema/Cinema.Api/Cinema.Api/` | .NET 10 Web API, Clean Architecture, OpenAPI, PostgreSQL | `dotnet run` (:5246) |

---

## Angular frontend (root)

- **Builder**: `@angular/build:application` (not `@angular-devkit/build-angular`)
- **Entrypoint**: `src/main.ts` → `src/app/app.ts`
- **Routing**: Standalone lazy-loaded components in `src/app/app.routes.ts`
- **Test**: `npm test` → `ng test` (Vitest via `@angular/build:unit-test`). Single file: any `*.spec.ts`. Config: `tsconfig.spec.json` (includes `vitest/globals`).
- **API URL**: `src/app/environment/environment.ts` — `http://localhost:3333` (no `/api`)
- **Notable deps**: `leaflet`, `apexcharts`, `ng-apexcharts`
- **Format**: Prettier `printWidth: 100`, `singleQuote: true`, angular parser for HTML (`.prettierrc`)
- **EditorConfig**: 2-space indent, `quote_type = single` for `.ts`

## Duplicate frontend (Proyect-fainali-frontend)

- Same Angular 21 stack, **own `node_modules`** and `angular.json`
- **Purpose**: auth modal (login/register). Root frontend has the report form.
- **API URL**: `http://localhost:3333/api` (includes `/api` — differs from root!)
- Does NOT include `leaflet`/`apexcharts`.

---

## AdonisJS backend (Proyect-fainali)

- **Commands** (run from `./Proyect-fainali/`):
  - `npm run dev` — HMR via `node ace serve --hmr`
  - `npm run build` — `node ace build`
  - `npm test` — Japa (`node ace test`)
  - `npm run typecheck` — `tsc --noEmit`
  - `npm run lint` — ESLint
  - `npm run format` — Prettier (uses `@adonisjs/prettier-config`)
- **Architecture**: AdonisJS 7 convention — `app/controllers/`, `app/models/`, `app/middleware/`, `config/`, `start/routes.ts`, `database/migrations/`
- **Auth**: default guard `api` (access tokens). `middleware.auth()` guards all `/usuarios/*` routes.
- **Database**: PostgreSQL via Lucid ORM. **Default port 5431** (not 5432). Config in `config/database.ts`. Env via `.env` (copy `.env.example`). Also has `better-sqlite3` dep — supports SQLite too.
- **Path aliases**: `#controllers/*`, `#models/*`, `#config/*`, `#start/*`, etc. (defined in `package.json` `imports`)
- **Routes**: `start/routes.ts` — CRUD for reportes, usuarios, departamentos, municipios, problematicas, instituciones, sectores, roles, detalleReportes. Auth at `/auth/*` (registro, login, logout).
- **Type-safe routes**: Uses `@tuyau/core` — `hooks.init` in `adonisrc.ts` generates `.adonisjs/client/registry/` for typed route references.
- **Cloudinary**: Configured inline in `app/controllers/reportes_controller.ts` (no config file; reads env vars directly).
- **CORS**: All origins allowed in dev (`app.inDev ? true : []`); credentials enabled.
- **HMR**: `hot-hook` with boundaries: `./app/controllers/**/*.ts`, `./app/middleware/*.ts`
- **Tests**: Japa with `@japa/assert`, `@japa/api-client`, `@japa/plugin-adonisjs`. Suites: `unit` (2s timeout, files in `tests/unit/`) and `functional` (30s timeout, files in `tests/functional/`, starts HTTP server). **`forceExit: false`** — tests may hang if async work is left open. Bootstrap at `tests/bootstrap.ts`; entrypoint at `bin/test.ts`.

---

## .NET API (Backend_Cinema/Cinema.Api)

- **Solution**: `Cinema.Api.slnx` at `Backend_Cinema/Cinema.Api/`. 4 projects: `Cinema.Api` (Web), `Cinema.Aplicasion`, `Cinema.Domain`, `Cinema.Infraestructura` (Clean Architecture).
- **Run**: `dotnet run` from `Cinema.Api/`. Default port: **5246** (see `Properties/launchSettings.json`).
- **Config**: Reads `.env` via `DotNetNet.Env.Load()` at startup. **`Cinema.Api/.env` is tracked in git** (contains real credentials).
- **Env vars**: `HOST`, `PORT`, `DATABASE`, `USER`, `PASSWORD`. All five are validated at startup — missing any throws.
- **OpenAPI**: Available at `/openapi/v1.json` in development.
