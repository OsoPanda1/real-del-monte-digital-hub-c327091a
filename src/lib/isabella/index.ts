import { isabellaIdentidad } from "@/isabella/core/identity";
import { juramentoIsabella } from "@/isabella/core/oath";
import { motorConciencia } from "@/isabella/core/consciousness";
import { almaYCorazon } from "@/isabella/emotional/heart";
import { memoriaEmocional } from "@/isabella/emotional/memory";
import { isabellaAPI } from "@/isabella/api/index";
import type { IsabellaDecision } from "@/core/models";

interface LastDecisionState {
  traceId: string;
  territory: string;
  decision?: IsabellaDecision;
}

let lastDecision: LastDecisionState | null = null;

export {
  isabellaIdentidad,
  juramentoIsabella,
  motorConciencia,
  almaYCorazon,
  memoriaEmocional,
  isabellaAPI,
};

export function getLastDecision(): LastDecisionState | null {
  return lastDecision;
}

export function setLastDecision(state: LastDecisionState): void {
  lastDecision = state;
}

export function procesarEntrada(texto: string, usuarioId: string) {
  return isabellaAPI.procesarEmocion(texto, usuarioId);
}

export function validarAccion(accion: string) {
  return isabellaAPI.validarEticamente(accion);
}

export function getEstadisticas(usuarioId: string) {
  return isabellaAPI.obtenerEstadisticas(usuarioId);
}
