# RDM Digital LTOS — Estado de Madurez por Módulo

Modelo: **M0** Conceptual · **M1** Scaffolded · **M2** Functional · **M3** Stable · **M4** Verified · **M5** Frozen

Actualizado: Etapa 1 del refactor federado (façades en `packages/`).

## Capas

| Capa | Módulo | Ubicación actual | Façade | Estado | Notas |
|---|---|---|---|---|---|
| Foundations | geo-engine | `src/core/geo/*` | `@geo-engine` | **M4** | LRU+TTL, haversine, spatial index, bbox. Estable. |
| Foundations | core-kernel | `src/lib/{kernel,tamv-kernel,heptafederation,operational-readiness}.ts` + `src/core/system/*` + `src/core/audit/logger.ts` | `@core-kernel` | **M3** | Falta unificar tipos de modos. |
| Foundations | data-models | `src/core/models.ts` + `src/lib/types.ts` + `src/features/places/mapTypes.ts` | `@data-models` | **M3** | Algunos tipos duplicados pendientes de fusión. |
| Foundations | ui-kit | `src/components/ui/*` + Logo, NavLink, SectionHeader | `@ui-kit` | **M2** | shadcn aún se importa directo desde `@/components/ui`. |
| Intelligence | ai-core (Isabella/Realito) | `src/ai/*` + `src/core/ai/*` + `src/features/ai/*` + `src/app/api/isabella/*` | _(Etapa 2)_ | **M2** | Decision engine + guardian funcionando, falta consolidar intent-router. |
| Territorial | territorial-twin | `src/core/{engine,events,orchestrator}/*` + `src/orchestrator/*` + `src/realito/gen4/*` | _(Etapa 2)_ | **M3** | Orchestrator + scoring engine estables. |
| Economy | economy / points | `supabase/functions/award-points` + `src/lib/business-catalog.ts` | _(Etapa 2)_ | **M2** | Stripe live pendiente (Bloque C). |
| Economy | auth + roles + gamificación | `src/contexts/RDMAuthContext.tsx` + `supabase/functions/award-points` | — | **M3** | Cerrado en bloque previo. |
| Governance | analytics | `src/infra/metrics/*` + `src/core/metrics/*` | _(Etapa 2)_ | **M2** | Dashboard placeholder funcional. |
| Culture | culture engine | `src/data/atlas/*` + `src/lib/{codex,tourism-knowledge}.ts` | _(Etapa 2)_ | **M3** | Corpus y dichos listos. |
| Experience | apps/web | `src/components/*` + `src/pages/*` | _(Etapa 3)_ | **M3** | 80+ rutas montadas, navegación estable. |
| Experience | apps/admin | `src/pages/admin/*` | _(Etapa 3)_ | **M2** | Sólo dashboard básico. |
| Infra | supabase | `supabase/*` | _(Etapa 4)_ | **M3** | Migraciones aplicadas, edge functions desplegadas. |
| Infra | metrics | `src/infra/metrics/*` | _(Etapa 4)_ | **M2** | Prometheus + monitoring registrados. |

## Deuda técnica conocida

- `@ts-nocheck` activo en: `src/components/ExplorerView.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Auth.tsx`, `src/orchestrator/experience.orchestrator.ts`, varios `src/data/imported/*`.
- `src/integrations/supabase/{client,types}.ts` son autogenerados — nunca editar.
- Bloques pendientes (post-refactor): **A** cableado mapa+comercios · **B** páginas faltantes /federation, /nodocero, /realito-ai, /mitos, /transporte · **C** Stripe live + membresías.

## Próximas etapas

- **Etapa 2** — Extraer `services/{ai-core, territorial-twin, economy, analytics, culture}` con su propio `index.ts` público.
- **Etapa 3** — Reorganizar `apps/web/src/domains/{rdm, atlas, community, economy, governance}` y separar `apps/admin`.
- **Etapa 4** — Mover `supabase/` a `infra/supabase/`, consolidar `infra/metrics/`, eliminar re-exports puente.
