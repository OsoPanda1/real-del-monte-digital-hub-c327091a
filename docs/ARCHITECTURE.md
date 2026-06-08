# RDM Digital LTOS — Arquitectura Federada por Capas

## Visión

Monorepo federado en 4 capas, migración incremental sin romper rutas existentes.

```text
rdm-digital-ltos/
├── apps/         # Experience surfaces (web, admin)
├── services/     # Capacidades de dominio (IA, twin, economía, analytics, culture)
├── packages/     # Librerías reutilizables (geo, kernel, ui, data-models)
├── infra/        # Supabase, metrics, deployment
└── docs/         # Blueprint, STATUS, este archivo
```

## Aliases TS/Vite (Etapa 1 — activos)

| Alias | Apunta a | Propósito |
|---|---|---|
| `@geo-engine` | `packages/geo-engine/src` | Geo puro: haversine, bbox, LRU, spatial index |
| `@core-kernel` | `packages/core-kernel/src` | Kernel LTOS, modos, auditoría, heptafederación |
| `@data-models` | `packages/data-models/src` | Tipos y contratos compartidos |
| `@ui-kit` | `packages/ui-kit/src` | UI primitives reutilizables |
| `@` | `src` | Apps actuales (compat) |

## Aliases planificados (Etapas 2-4)

| Alias | Capa | Etapa |
|---|---|---|
| `@ai-core` | services/ai-core | 2 |
| `@twin` | services/territorial-twin | 2 |
| `@economy` | services/economy | 2 |
| `@analytics` | services/analytics | 2 |
| `@culture` | services/culture | 2 |

## Reglas de dependencia

```text
apps/*     →  services/*  →  packages/*
apps/*     →  packages/*
services/* →  packages/*
packages/* →  packages/*   (sólo entre fundaciones, sin ciclos)
```

- `packages/*` **no** importa de `services/*` ni `apps/*`.
- `services/*` **no** importa de `apps/*`.
- `apps/*` exponen UI y routing; toda la lógica vive abajo.

## Criterios de cierre (M3 → M4)

Cada módulo cierra cuando:

1. Build verde con su alias activo.
2. Sin imports rotos a rutas legacy.
3. Tipos públicos exportados desde su `index.ts`.
4. Documentado en `docs/STATUS.md`.

Ver `.lovable/plan.md` para el plan completo de las 4 etapas.
