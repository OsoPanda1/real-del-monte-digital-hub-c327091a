/**
 * @data-models — Tipos y contratos compartidos (Etapa 1).
 * Resolución de ambigüedad: `Intent` canónico viene de `@/core/models`.
 * El alias legacy de `src/lib/types` se re-exporta como `LegacyIntent`.
 */
export * from "@/core/models";
export type { Intent as LegacyIntent } from "@/lib/types";
export * from "@/features/places/mapTypes";
