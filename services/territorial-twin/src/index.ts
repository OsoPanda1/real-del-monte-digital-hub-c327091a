/**
 * @twin — Façade del gemelo digital territorial (Etapa 2).
 * Orquestador de experiencia, scoring, eventos y reloj determinista.
 * Convive con `@geo-engine` (geo puro) y `@core-kernel` (kernel LTOS).
 */
export * as ScoringEngineV1 from "@/core/engine/ScoringEngine";
export * as ScoringEngineV2 from "@/core/engine/scoring.engine";
export * from "@/core/engine/deterministic-clock";
export * from "@/core/events/bus";
export * as ExperienceOrchestrator from "@/core/orchestrator/ExperienceOrchestrator";
export * as ExperienceOrchestratorV2 from "@/orchestrator/experience.orchestrator";
export * as SovereignDecisionEngine from "@/orchestrator/sovereignDecisionEngine";
export * from "@/orchestrator/decision.store";
export * as RealitoGen4 from "@/realito/gen4/ExperienceOrchestrator";
