// api/telemetry.js — Vercel Edge Function
// DOCUMENTO MAESTRO INTERCONECTADO DE SOBERANÍA DIGITAL — Capítulo IV
// Endpoint Perimetral de Telemetría del Nodo Cero
// Cabeceras defensivas: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CORS
// Cache-Control: no-store, max-age=0, must-revalidate

const ORIGIN_ALLOWLIST = [
  "https://www.visitarealdelmonte.online",
  // Si agregas otros dominios soberanos, inclúyelos aquí explícitamente
];

function getAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return ORIGIN_ALLOWLIST[0];
  return ORIGIN_ALLOWLIST.includes(origin) ? origin : ORIGIN_ALLOWLIST[0];
}

function buildHeaders(origin) {
  return {
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; media-src 'self' https: blob:; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store, max-age=0, must-revalidate",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}

/**
 * @param {Request} request
 */
export default async function handler(request) {
  const origin = getAllowedOrigin(request);
  const defensiveHeaders = buildHeaders(origin);

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: defensiveHeaders });
  }

  try {
    // --- Determinar topology_state ---
    const netflowDbUrl = process.env.NETFLOW_DB_SUPABASE_URL || null;
    const netflowAnonKey = process.env.NETFLOW_DB_SUPABASE_ANON_KEY || null;
    const topologyState = netflowDbUrl ? "FEDERATED_ACTIVE" : "STANDALONE_MODAL";

    // --- Construir respuesta soberana base ---
    const payloadBase = {
      infra_status: "operational",
      node_id: "nodo-cero-001",
      federation_schema_count: 7,
      topology_state: topologyState,
      edge_timestamp: new Date().toISOString(),
      service: "nodo-cero-telemetry",
    };

    if (request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return new Response(
          JSON.stringify({ error: "Invalid JSON body", ...payloadBase }),
          { status: 400, headers: defensiveHeaders },
        );
      }

      const requiredFields = [
        "flows_total",
        "packets_rx",
        "bytes_total",
        "cpu_percent",
        "memory_percent",
        "active_connections",
      ];

      for (const field of requiredFields) {
        if (body[field] === undefined) {
          return new Response(
            JSON.stringify({ error: `Missing required field: ${field}`, ...payloadBase }),
            { status: 400, headers: defensiveHeaders },
          );
        }
      }

      // Store in Supabase if NETFLOW_DB_ credentials exist
      let stored = false;
      if (netflowDbUrl && netflowAnonKey) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          // En el contexto de log drain, anon key es aceptable si RLS está correctamente configurado. [web:118][web:120]
          const supabase = createClient(netflowDbUrl, netflowAnonKey);

          const insertPayload = {
            flows_total: body.flows_total,
            packets_rx: body.packets_rx,
            bytes_total: body.bytes_total,
            cpu_percent: body.cpu_percent,
            memory_percent: body.memory_percent,
            active_connections: body.active_connections,
            last_flow_ts: body.last_flow_ts || null,
            node_id: body.node_id || payloadBase.node_id,
            status: body.status || payloadBase.infra_status,
          };

          const { error } = await supabase.from("telemetry_logs").insert(insertPayload);
          if (!error) {
            stored = true;
          } else {
            console.warn("telemetry_logs insert error:", error.message);
          }
        } catch (e) {
          console.warn("Supabase telemetry_logs insert failed:", e instanceof Error ? e.message : e);
        }
      }

      return new Response(
        JSON.stringify({ accepted: true, stored, ...payloadBase }),
        { status: 200, headers: defensiveHeaders },
      );
    }

    // GET — health check sobrio
    return new Response(JSON.stringify(payloadBase), { status: 200, headers: defensiveHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown telemetry error";
    return new Response(
      JSON.stringify({
        error: message,
        infra_status: "error",
        node_id: "nodo-cero-001",
        service: "nodo-cero-telemetry",
        edge_timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: defensiveHeaders },
    );
  }
}

export const config = {
  runtime: "edge",
};
