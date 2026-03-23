// @ts-nocheck
import type { IsabellaDecision } from "@/core/models";

export class DecisionStore {
  private lastDecision: IsabellaDecision | null = null;

  save(decision: IsabellaDecision) {
    this.lastDecision = decision;
  }

  getLastDecision() {
    return this.lastDecision;
  }
}

export const decisionStore = new DecisionStore();
