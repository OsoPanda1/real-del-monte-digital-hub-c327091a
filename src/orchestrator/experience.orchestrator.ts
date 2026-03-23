// @ts-nocheck
import { MovementFilter } from "@/core/behavior/movement.filter";
import { detectMovementPattern } from "@/core/behavior/pattern.detector";
import { endManualSpan, setSpanAttribute, startManualSpan } from "@/instrumentation.node";
import { createTraceId } from "@/core/context/trace";
import { type IClock, Clock } from "@/core/engine/deterministic-clock";
import { ScoringEngine } from "@/core/engine/scoring.engine";
import { withinBBox } from "@/core/geo/bbox";
import { fastDistance } from "@/core/geo/haversine.fast";
import { LRUCache } from "@/core/geo/lru-cache";
import { LinearSpatialIndex } from "@/core/geo/spatial-index";
import { bus, type EventBus } from "@/core/infra/event-bus";
import type { Coordenadas, IsabellaDecision, RetentionIntent, TuristaEstado } from "@/core/models";
import {
  decisionScore,
  isabellaGeoLruCapacity,
  isabellaGeoLruSize,
  isabellaMovementFilterAlpha,
  isabellaTerritorialDecisionLatencyMs,
} from "@/infra/metrics/prometheus";

interface OrchestratorOptions {
  cacheCapacity?: number;
  cacheTtlMs?: number;
  movementAlpha?: number;
  clock?: IClock;
  engine?: ScoringEngine;
  eventBus?: EventBus;
  throttleMs?: number;
  proximityBBoxMeters?: number;
  threshold?: number;
}

export class ExperienceOrchestrator {
  private cache: LRUCache<string, number>;
  private movement: MovementFilter;
  private clock: IClock;
  private engine: ScoringEngine;
  private eventBus: EventBus;
  private throttleMs: number;
  private proximityBBoxMeters: number;
  private threshold: number;
  private lastDecisionAt = new Map<string, number>();
  private exitIndex = new LinearSpatialIndex();

  constructor(
    private exits: Coordenadas[],
    options: OrchestratorOptions = {},
  ) {
    this.clock = options.clock ?? new Clock();
    this.engine = options.engine ?? new ScoringEngine();
    this.eventBus = options.eventBus ?? bus;
    this.cache = new LRUCache(
      options.cacheCapacity ?? 5000,
      options.cacheTtlMs ?? 30_000,
      () => this.clock.now(),
    );
    this.movement = new MovementFilter(options.movementAlpha ?? 0.3);
    this.throttleMs = options.throttleMs ?? 45_000;
    this.proximityBBoxMeters = options.proximityBBoxMeters ?? 300;
    this.threshold = options.threshold ?? 40;

    this.exits.forEach((exit, idx) => {
      this.exitIndex.upsert({ id: `exit-${idx}`, coords: exit });
    });

    isabellaGeoLruCapacity.set(options.cacheCapacity ?? 5000);
    isabellaMovementFilterAlpha.set(this.movement.getAlpha());
  }

  allowExecution(touristId: string, windowMs = this.throttleMs): boolean {
    const now = this.clock.now();
    const previous = this.lastDecisionAt.get(touristId);
    if (!previous) return true;
    return now - previous >= windowMs;
  }

  evaluar(t: TuristaEstado): IsabellaDecision | null {
    const started = this.clock.now();
    if (!this.allowExecution(t.id, this.throttleMs)) {
      return null;
    }

    const traceId = createTraceId();
    const span = startManualSpan("territorial.decision");
    setSpanAttribute(span, "territory", t.territory ?? "RDM");

    const nearest = this.getNearestExit(t.coords);
    if (!nearest || !withinBBox(t.coords, nearest, this.proximityBBoxMeters)) {
      endManualSpan(span);
      return null;
    }

    const key = `${t.coords.lat.toFixed(5)},${t.coords.lng.toFixed(5)}->${nearest.lat.toFixed(5)},${nearest.lng.toFixed(5)}`;
    let dist = this.cache.get(key);
    if (dist === undefined) {
      dist = fastDistance(t.coords, nearest);
      this.cache.set(key, dist);
    }
    isabellaGeoLruSize.set(this.cache.size());

    const rawSpeed = t.prevCoords ? fastDistance(t.prevCoords, t.coords) / 5 : 0;
    const speed = this.movement.update(rawSpeed);

    const inactivity = (started - t.activityTimestamps.lastInteractionAt.getTime()) / 60_000;

    const score = this.engine.evaluar({
      distanceToExit: dist,
      stayTimeHours: t.stayTimeHours,
      inactivityMinutes: inactivity,
      speedMps: speed,
    });

    if (score.total < this.threshold) {
      endManualSpan(span);
      return null;
    }

    const pattern = detectMovementPattern({ speedMps: speed, distanceToExit: dist });
    const retentionIntent = this.resolveIntent(score.total, pattern);

    const decision: IsabellaDecision = {
      traceId,
      territory: t.territory ?? "RDM",
      level: score.total >= 70 ? "CRITICO" : "ALERTA",
      retentionIntent,
      pattern,
      distanceToExit: dist,
      speedMps: speed,
      coords: t.coords,
      payload: {
        titulo: retentionIntent === "SAFE_EXIT" ? "Salida segura sugerida" : "Experiencia desbloqueada",
        mensaje:
          retentionIntent === "UPSELL"
            ? "Última experiencia local disponible antes de salir"
            : retentionIntent === "DISCOVERY"
              ? "Ruta exploratoria activada cerca de ti"
              : "Te guiamos por una salida segura y cultural",
        ruta_ar_activada: true,
      },
      score,
    };

    setSpanAttribute(span, "score", score.total);
    setSpanAttribute(span, "pattern", pattern);
    setSpanAttribute(span, "distanceToExit", dist);
    setSpanAttribute(span, "speedMps", speed);
    setSpanAttribute(span, "traceId", traceId);

    this.lastDecisionAt.set(t.id, started);
    this.eventBus.emit("isabella:decision", decision);

    decisionScore.observe(Math.max(0, Math.min(1, decision.score.total / 100)));
    isabellaTerritorialDecisionLatencyMs.observe(this.clock.now() - started);
    endManualSpan(span);

    return decision;
  }

  private resolveIntent(totalScore: number, pattern: string): RetentionIntent {
    if (totalScore >= 80 || pattern === "EXITING") return "SAFE_EXIT";
    if (totalScore >= 55) return "UPSELL";
    return "DISCOVERY";
  }

  private getNearestExit(coords: Coordenadas): Coordenadas | null {
    return this.exitIndex.nearest(coords)?.coords ?? null;
  }
}
