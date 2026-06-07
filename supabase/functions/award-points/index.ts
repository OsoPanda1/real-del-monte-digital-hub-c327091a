import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Server-authoritative points table (mirror of client) — clients cannot inflate.
const POINTS: Record<string, number> = {
  daily_login: 5,
  visit_place: 10,
  share_post: 25,
  upload_photo: 30,
  review_business: 40,
  complete_route: 75,
  attend_event: 50,
  refer_friend: 100,
  register_business: 200,
};

// Per-action throttling (seconds) to prevent abuse
const COOLDOWN_SEC: Record<string, number> = {
  daily_login: 60 * 60 * 20, // ~once/day
  visit_place: 60,
  share_post: 30,
  upload_photo: 30,
  review_business: 60,
  complete_route: 300,
  attend_event: 600,
  refer_friend: 86400,
  register_business: 86400,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing_auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify caller using their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "invalid_user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const metadata = body.metadata ?? null;

    const points = POINTS[action];
    if (typeof points !== "number") {
      return new Response(JSON.stringify({ error: "invalid_action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for cooldown check + award
    const admin = createClient(supabaseUrl, serviceKey);

    const cooldown = COOLDOWN_SEC[action] ?? 30;
    const since = new Date(Date.now() - cooldown * 1000).toISOString();
    const { data: recent } = await admin
      .from("point_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      return new Response(JSON.stringify({ error: "cooldown" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: rpcErr } = await admin.rpc("award_points", {
      _user_id: userId,
      _action: action,
      _points: points,
      _metadata: metadata,
    });
    if (rpcErr) {
      return new Response(JSON.stringify({ error: rpcErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, action, points }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
