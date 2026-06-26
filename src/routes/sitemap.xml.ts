// RDM Digital · Sitemap XML
// - Reemplazar BASE_URL por el dominio definitivo.
// - Poblar entries desde el router o la BD (rutas dinámicas, slugs).
// - Mantener lastmod en formato ISO (YYYY-MM-DD o completo con TZ).[web:70][web:77]

import type { APIContext } from "./_types";

const BASE_URL = "https://realdelmonte.example";

type Changefreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface SitemapEntry {
  path: string;
  /** ISO 8601 date/time. Idealmente la fecha real de última modificación.[web:70][web:77] */
  lastmod?: string;
  /** Hint para crawlers; opcional y cada vez menos relevante.[web:73][web:74][web:77] */
  changefreq?: Changefreq;
  /** Cadena entre 0.0 y 1.0; opcional.[web:70][web:74] */
  priority?: string;
}

/**
 * Normaliza una ruta a <loc> absoluto.
 * Asegura que siempre exista una única barra entre BASE_URL y path.[web:75]
 */
function toAbsoluteLoc(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

/**
 * Serializa una entrada individual de sitemap a XML <url>…</url>.
 */
function serializeEntry(entry: SitemapEntry): string {
  const lines: string[] = [];

  lines.push("  <url>");
  lines.push(`    <loc>${toAbsoluteLoc(entry.path)}</loc>`);

  if (entry.lastmod) {
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  }
  if (entry.changefreq) {
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  }
  if (entry.priority) {
    lines.push(`    <priority>${entry.priority}</priority>`);
  }

  lines.push("  </url>");

  return lines.join("\n");
}

/**
 * Genera el contenido XML del sitemap a partir de una lista de entries.
 */
function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(serializeEntry).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");
}

/**
 * GET /sitemap.xml
 *
 * Nota:
 * - Idealmente, lastmod debería reflejar la fecha real de actualización de cada ruta.
 * - changefreq y priority son hints; Google suele ignorarlos o minimizar su peso.[web:73][web:74][web:77]
 */
export async function GET(_ctx: APIContext): Promise<Response> {
  const now = new Date().toISOString();

  const entries: SitemapEntry[] = [
    { path: "/", lastmod: now, changefreq: "weekly", priority: "1.0" },
    { path: "/cultura", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/economia", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/gemelo", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/contacto", lastmod: now, changefreq: "monthly", priority: "0.5" },
    // Ejemplo: entradas dinámicas poblando desde BD/router:
    // ...dynamicEntriesFromDB
  ];

  const xml = buildSitemapXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      // Suele ser razonable cachear 1h; ajusta según frecuencia de cambios.[web:75][web:76]
      "Cache-Control": "public, max-age=3600",
    },
  });
}
