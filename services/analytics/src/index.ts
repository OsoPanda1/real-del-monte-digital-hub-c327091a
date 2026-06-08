/**
 * @analytics — Façade de métricas y observabilidad (Etapa 2).
 * Dos registries coexisten: `@/core/metrics/prometheus` (frontend)
 * y `@/infra/metrics/prometheus` (infra/SSR). Se exponen con namespace
 * propio para evitar colisión de símbolos.
 */
export * as CoreMetrics from "@/core/metrics/prometheus";
export * as InfraMetrics from "@/infra/metrics/prometheus";
export * as Monitoring from "@/infra/metrics/monitoring";
