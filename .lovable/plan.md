# Plan de Refactor Incremental — RDM Digital LTOS

Objetivo: migrar de la estructura plana actual (`src/*`) a la arquitectura federada por capas (apps / services / packages / infra) **sin parar el desarrollo ni romper rutas existentes**. Se hace por etapas con cierre M3/M4 al final de cada una.

## Principios de migración

- **Aliases primero, mover después**: introducir paths en `tsconfig` (`@ui-kit/*`, `@geo-engine/*`, `@core-kernel/*`, `@ai-core/*`, `@twin/*`, `@economy/*`) apuntando a la ubicación actual, luego mover archivos sin tocar imports de consumidores.
- **Re-exports puente**: cada archivo movido deja un `index.ts` de compatibilidad en la ruta vieja durante 1 etapa, luego se elimina.
- **Freeze por capa**: al cerrar etapa, se marca la capa como M4 (Verified) en `docs/STATUS.md` y no se tocan features nuevas ahí hasta cerrar las demás.
- **Build verde obligatorio** entre etapas: si el build falla, se revierte la última mudanza antes de continuar.

## Etapa 1 — Fundaciones puras (packages/)

Mover solo código **sin dependencias de React ni rutas**.

```text
packages/
├── geo-engine/        ← src/core/geo/*
├── core-kernel/       ← src/lib/{kernel,tamv-kernel,heptafederation,operational-readiness}.ts
│                        + src/core/system/* + src/core/audit/logger.ts
├── data-models/       ← src/core/models.ts + src/lib/types.ts + src/features/places/mapTypes.ts
└── ui-kit/            ← src/components/ui/* (shadcn) + Logo, NavLink, SectionHeader
```

Acciones:
1. Crear `packages/*/src/` y mover archivos.
2. Añadir aliases en `tsconfig.app.json` y `vite.config.ts`.
3. Dejar re-exports en `src/core/geo/index.ts`, `src/lib/kernel.ts`, etc. → `export * from '@geo-engine'`.
4. Verificar: `bun run build` + smoke test en `/`, `/mapa-vivo`, `/lugares`.

Cierre M4: paquetes compilan aislados, sin imports a `src/`.

## Etapa 2 — Services de dominio (services/)

```text
services/
├── ai-core/           ← src/ai/* + src/core/ai/* + src/features/ai/*
│                        + src/app/api/isabella/*
├── territorial-twin/  ← src/core/{engine,events,orchestrator}/*
│                        + src/orchestrator/* + src/realito/gen4/*
│                        + src/kernel/engine/ChronusEngine.ts
├── economy/           ← supabase/functions/award-points
│                        + src/lib/business-catalog.ts
│                        + futura ledger/incentives
├── analytics/         ← src/infra/metrics/* + src/core/metrics/*
│                        + src/app/api/metrics/route.ts
└── culture/           ← src/data/atlas/{dichos,corpus,tamv-thesis}.ts
                         + src/lib/{codex,tourism-knowledge}.ts
```

Acciones:
1. Crear `services/*/src/` y mover lógica de dominio.
2. Endpoints API se mantienen en `src/app/api/*` pero importan desde `@ai-core`, `@analytics`, etc.
3. Hooks (`useIsabella*`, `useRealitoChat`) quedan en `apps/web` y solo consumen API/services.
4. Verificar: navegación de `/isabella-ai`, `/dashboard`, `/comercios` sin errores de consola.

Cierre M4: cada service compila con sus propios tipos y exporta una API pública estable (`services/<x>/src/index.ts`).

## Etapa 3 — Apps (apps/web, apps/admin)

```text
apps/
├── web/
│   ├── src/
│   │   ├── domains/rdm/{components,pages,hooks}/
│   │   ├── domains/atlas/{components,pages}/
│   │   ├── domains/community/
│   │   ├── shared/{layout,hooks,contexts}/
│   │   └── main.tsx + App.tsx
│   ├── index.html, vite.config.ts, tailwind.config.ts
└── admin/
    └── src/pages/{Dashboard,Telemetry,Operations}.tsx  ← src/pages/admin/*
```

Acciones:
1. Reorganizar `src/components` y `src/pages` en `domains/{rdm,atlas,community,economy,governance}`.
2. Extraer `apps/admin` con su propio entry (mismo Vite, segundo build target o sub-route protegida).
3. Actualizar `App.tsx` routing por dominio (lazy import desde cada `domains/*/pages/index.ts`).
4. Verificar: todas las 80+ rutas siguen respondiendo (script de smoke con `playwright`).

Cierre M4: `apps/web` no importa nada fuera de `apps/web/src`, `packages/*` o `services/*/src/index.ts`.

## Etapa 4 — Infra y docs

```text
infra/
├── supabase/          ← supabase/* completo
├── metrics/           ← configs prometheus / monitoring
├── deployment/        ← Dockerfiles, vercel.json, .lovable/
└── lovable/           ← config Lovable específica

docs/
├── STATUS.md          ← matriz de madurez M0–M4 por módulo
├── blueprint.md
├── core.md, orchestrator.md, infra-metrics.md  (existentes)
└── ARCHITECTURE.md    ← este plan + diagrama de capas
```

Acciones:
1. Mover `supabase/` a `infra/supabase/` y actualizar `supabase/config.toml` paths.
2. Crear `docs/STATUS.md` con tabla de cada módulo (capa, estado M, owner, último freeze).
3. Eliminar re-exports puente de Etapa 1-2 (limpieza final).
4. Verificar: deploy preview en Lovable + edge functions ejecutan OK.

Cierre M4 global: monorepo federado completo, listo para extraer servicios a workspaces (`bun workspaces`) si se decide.

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Imports rotos masivos | Aliases + re-exports puente, una capa por etapa |
| Edge functions fallan tras mover `supabase/` | Etapa 4 solo, con test en staging primero |
| `@ts-nocheck` files (Dashboard, Auth, imported/) | No tocar en este refactor, marcar como deuda en STATUS.md |
| Lovable Cloud client autogenerado | `src/integrations/supabase/client.ts` y `types.ts` permanecen donde están |

## Entregables por etapa

- Etapa 1: PR "packages: extract pure libs" + build verde
- Etapa 2: PR "services: extract domain logic" + smoke tests
- Etapa 3: PR "apps: domain-driven structure" + playwright pass
- Etapa 4: PR "infra: consolidate + docs/STATUS" + deploy verde

## Fuera de alcance de este plan

- Stripe live / membresías (`Bloque C` pendiente)
- Cableado mapa + comercios (`Bloque A` pendiente)
- Páginas faltantes /federation, /nodocero, etc. (`Bloque B` pendiente)
- Nuevas features de IA o gamificación

Estos bloques se retoman **después** o **en paralelo solo dentro de la capa ya migrada**.

## Decisión que necesito de ti

1. ¿Apruebas el plan completo (4 etapas) o prefieres ejecutar **solo Etapa 1** primero y revaluar?
2. ¿Quieres que las etapas se hagan en turnos separados (recomendado) o todo seguido?