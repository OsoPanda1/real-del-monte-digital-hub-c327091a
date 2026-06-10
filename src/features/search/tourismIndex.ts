// @ts-nocheck
/**
 * Tourism Search Index — unifica POIs canónicos + capítulos + minas + pastes +
 * leyendas + rutas en un solo dataset consultable para el SearchOverlay
 * y para el mapa territorial inmersivo. Cada entrada apunta a un POI real
 * (lat/lng) cuando aplica, y a una ruta navegable.
 */
import {
  RDM_TERRITORY_POIS,
  chapters,
  mines,
  pastes,
  type TerritoryPOI,
} from "@/data/atlas/territory-pois";

export type SearchHitKind =
  | "poi"
  | "capitulo"
  | "mina"
  | "paste"
  | "ruta"
  | "leyenda";

export interface SearchHit {
  id: string;
  kind: SearchHitKind;
  title: string;
  subtitle: string;
  narrative: string;
  href: string;
  /** Federación/categoría para colorear la tarjeta */
  facet: string;
  lat?: number;
  lng?: number;
  poiId?: string;
}

/** Heurística simple: relaciona narrativas con su POI físico más probable. */
function poiAnchor(keyword: string): TerritoryPOI | undefined {
  const k = keyword.toLowerCase();
  return RDM_TERRITORY_POIS.find(
    (p) =>
      p.name.toLowerCase().includes(k) ||
      p.description.toLowerCase().includes(k) ||
      p.significance.toLowerCase().includes(k),
  );
}

export const TOURISM_INDEX: SearchHit[] = [
  ...RDM_TERRITORY_POIS.map<SearchHit>((p) => ({
    id: p.id,
    kind: "poi",
    title: p.name,
    subtitle: p.municipality,
    narrative: p.significance || p.description,
    href: `/mapa?poi=${encodeURIComponent(p.id)}`,
    facet: p.federationId,
    lat: p.lat,
    lng: p.lng,
    poiId: p.id,
  })),
  ...chapters.map<SearchHit>((c) => ({
    id: c.id,
    kind: "capitulo",
    title: c.title,
    subtitle: c.kicker,
    narrative: c.blurb,
    href: `/capitulos${c.href}`.replace("/capitulos/capitulos", "/capitulos"),
    facet: c.federationLayer,
  })),
  ...mines.map<SearchHit>((m) => {
    const anchor = poiAnchor(m.name.split(" ").pop() || "");
    return {
      id: m.id,
      kind: "mina",
      title: m.name,
      subtitle: `Fundada ${m.founded} · ${m.status}`,
      narrative: m.description,
      href: "/capitulos/minas",
      facet: "subsuelo",
      lat: anchor?.lat,
      lng: anchor?.lng,
      poiId: anchor?.id,
    };
  }),
  ...pastes.map<SearchHit>((p) => ({
    id: p.id,
    kind: "paste",
    title: p.name,
    subtitle: `Origen ${p.origin}`,
    narrative: p.note,
    href: "/capitulos/pastes",
    facet: "memoria-comestible",
    lat: 20.143,
    lng: -98.67,
    poiId: "mercado-paste",
  })),
];

export function searchTourism(query: string, limit = 18): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOURISM_INDEX.slice(0, limit);
  return TOURISM_INDEX.filter((hit) => {
    const haystack = `${hit.title} ${hit.subtitle} ${hit.narrative} ${hit.facet}`.toLowerCase();
    return haystack.includes(q);
  }).slice(0, limit);
}

export const SEARCH_OPEN_EVENT = "rdm:search:open";

export function openSearchOverlay() {
  window.dispatchEvent(new CustomEvent(SEARCH_OPEN_EVENT));
}
