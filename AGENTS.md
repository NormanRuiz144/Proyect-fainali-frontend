# AGENTS.md

## Dev commands

```bash
npm start          # dev server at http://localhost:4200
npm run build      # production build (output: dist/)
npm test           # Vitest unit tests (via Angular CLI)
```

No lint/typecheck commands exist by default. Prettier is configured.

## Project structure

Single Angular 21 application. Lazy-loaded route segments:

- `/inicio` — public landing (Layout component)
- `/nuevo-reporte` — citizen portal (new report)
- `/admin/*` — admin area (dashboard, reportes)
- `**` → redirects to `/inicio`

Entrypoint: `src/main.ts`. App config: `src/app/app.config.ts`.

## Key conventions

- Strict TypeScript (`strict: true`, `noImplicitOverride: true`, `strictTemplates: true`)
- Prettier: 100 char line width, single quotes, Angular HTML parser for `.html` files
- Tests use Vitest (`*.spec.ts` files). `tsconfig.spec.json` includes `vitest/globals` types.
- API base URL: `http://localhost:3333` (dev, `src/app/environment/environment.ts`)
- Production environment file not present; add `environment.production.ts` before building for prod
- Component styles budget: 4kB warning / 8kB error per component (angular.json)
