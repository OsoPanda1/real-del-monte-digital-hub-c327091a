import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RDM_TERRITORY_POIS, type TerritoryPOI } from "@/data/atlas/territory-pois";

/**
 * TerritorialSVGMap — Mapa SVG inmersivo y soberano del Nodo Cero.
 * Proyecta lat/lng a un viewBox normalizado; cada POI es un marcador glassmórfico
 * con halo, anillo orbital, y tooltip narrativo flotante de la guía turística.
 *
 * Sin dependencias externas (sin Mapbox). Pensado como visual hero del mapa.
 */

const FACET_TONES: Record<string, { ring: string; glow: string; tag: string }> = {
  gubernamental: { ring: "hsl(210,100%,55%)", glow: "hsla(210,100%,55%,0.45)", tag: "Gubernamental" },
  cultural: { ring: "hsl(43,80%,55%)", glow: "hsla(43,80%,55%,0.45)", tag: "Cultural" },
  economica: { ring: "hsl(145,55%,45%)", glow: "hsla(145,55%,45%,0.4)", tag: "Económica" },
  tecnologica: { ring: "hsl(280,70%,60%)", glow: "hsla(280,70%,60%,0.45)", tag: "Tecnológica" },
  educativa: { ring: "hsl(195,80%,55%)", glow: "hsla(195,80%,55%,0.4)", tag: "Educativa" },
  salud: { ring: "hsl(160,55%,45%)", glow: "hsla(160,55%,45%,0.4)", tag: "Salud" },
};

const PAD = 0.012;

function useProjection(pois: TerritoryPOI[]) {
  return useMemo(() => {
    const lats = pois.map((p) => p.lat);
    const lngs = pois.map((p) => p.lng);
    const minLat = Math.min(...lats) - PAD;
    const maxLat = Math.max(...lats) + PAD;
    const minLng = Math.min(...lngs) - PAD;
    const maxLng = Math.max(...lngs) + PAD;
    const W = 1000;
    const H = 620;
    const project = (lat: number, lng: number) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * W;
      // invertir Y (mayor lat = arriba)
      const y = H - ((lat - minLat) / (maxLat - minLat)) * H;
      return { x, y };
    };
    return { W, H, project };
  }, [pois]);
}

export interface TerritorialSVGMapProps {
  pois?: TerritoryPOI[];
  /** ID del POI a destacar (puede venir de ?poi=...) */
  highlightId?: string;
}

export default function TerritorialSVGMap({
  pois = RDM_TERRITORY_POIS,
  highlightId,
}: TerritorialSVGMapProps) {
  const { W, H, project } = useProjection(pois);
  const [hover, setHover] = useState<string | null>(highlightId ?? null);

  const active = pois.find((p) => p.id === hover) ?? null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[hsl(var(--gold)/0.2)] glass-card shadow-premium">
      <div className="absolute inset-0 aurora-bg opacity-70 pointer-events-none" />
      <div className="absolute inset-0 grid-paper opacity-50 pointer-events-none" />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative w-full h-auto block"
        role="img"
        aria-label="Mapa territorial inmersivo del Nodo Cero Real del Monte"
      >
        <defs>
          <radialGradient id="terrain" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="hsl(220, 30%, 96%)" />
            <stop offset="55%" stopColor="hsl(220, 25%, 90%)" />
            <stop offset="100%" stopColor="hsl(220, 30%, 80%)" />
          </radialGradient>
          <filter id="poiBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* terreno suave */}
        <rect x="0" y="0" width={W} height={H} fill="url(#terrain)" />

        {/* curvas de nivel decorativas */}
        {[0.25, 0.45, 0.65, 0.85].map((r, i) => (
          <ellipse
            key={i}
            cx={W * 0.5}
            cy={H * 0.55}
            rx={W * r * 0.55}
            ry={H * r * 0.55}
            fill="none"
            stroke="hsla(220,45%,18%,0.06)"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
        ))}

        {/* hilos de federación: conectar core-node entre sí */}
        {pois
          .filter((p) => p.relevance === "core-node")
          .map((a, i, arr) => {
            const b = arr[(i + 1) % arr.length];
            const pa = project(a.lat, a.lng);
            const pb = project(b.lat, b.lng);
            return (
              <line
                key={a.id + b.id}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke="hsla(43,80%,55%,0.35)"
                strokeWidth={1.2}
                strokeDasharray="3 5"
              />
            );
          })}

        {/* POIs */}
        {pois.map((p) => {
          const { x, y } = project(p.lat, p.lng);
          const tone = FACET_TONES[p.federationId] ?? FACET_TONES.gubernamental;
          const isActive = hover === p.id;
          const r = p.relevance === "core-node" ? 14 : 10;
          return (
            <g
              key={p.id}
              transform={`translate(${x} ${y})`}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover((cur) => (cur === p.id ? null : cur))}
              onFocus={() => setHover(p.id)}
              tabIndex={0}
              role="button"
              aria-label={`${p.name} — ${p.significance}`}
              className="cursor-pointer focus:outline-none"
            >
              {/* halo */}
              <circle r={r * 2.4} fill={tone.glow} filter="url(#poiBlur)" opacity={isActive ? 0.9 : 0.5} />
              {/* anillo orbital */}
              <circle
                r={r + 6}
                fill="none"
                stroke={tone.ring}
                strokeWidth={isActive ? 1.6 : 1}
                strokeDasharray="2 4"
                opacity={isActive ? 0.9 : 0.5}
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to="360"
                  dur="24s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* cuerpo glassmórfico */}
              <circle
                r={r}
                fill="hsla(220,20%,99%,0.85)"
                stroke={tone.ring}
                strokeWidth={1.6}
              />
              <circle r={r * 0.45} fill={tone.ring} opacity={0.9} />

              {/* etiqueta */}
              <text
                y={r + 16}
                textAnchor="middle"
                fontSize={11}
                fontWeight={isActive ? 700 : 500}
                fill="hsl(var(--foreground))"
                style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
              >
                {p.name.length > 22 ? p.name.slice(0, 21) + "…" : p.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip narrativo flotante */}
      {active && (
        <motion.aside
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm bottom-4 sm:bottom-6 rounded-2xl glass-card border border-[hsl(var(--gold)/0.3)] shadow-premium p-4 z-10"
          role="status"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[9px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-full"
              style={{
                background: `${FACET_TONES[active.federationId]?.glow ?? "hsla(0,0%,50%,0.2)"}`,
                color: FACET_TONES[active.federationId]?.ring ?? "hsl(var(--foreground))",
              }}
            >
              {FACET_TONES[active.federationId]?.tag ?? "Federación"}
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {active.lat.toFixed(4)}, {active.lng.toFixed(4)}
            </span>
          </div>
          <h3 className="font-display text-xl leading-tight">{active.name}</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {active.municipality} · {active.altitudeM} m
          </p>
          <p className="text-sm mt-2 text-[hsl(var(--foreground)/0.85)]">{active.description}</p>
          <p className="text-xs italic mt-2 text-[hsl(var(--foreground)/0.7)]">
            «{active.significance}»
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              to={`/lugares`}
              className="text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-[hsl(var(--electric)/0.4)] text-[hsl(var(--electric))] hover:bg-[hsl(var(--electric)/0.08)]"
            >
              Ver lugares
            </Link>
            <Link
              to={`/rutas`}
              className="text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold-dark))] hover:bg-[hsl(var(--gold)/0.08)]"
            >
              Rutas cercanas
            </Link>
          </div>
        </motion.aside>
      )}
    </div>
  );
}
