// api/ai/chat.js — Vercel Edge Function
// AI Gateway chat endpoint — uses AI SDK with automatic OIDC auth
// Deploys to Vercel Edge Runtime, routes through Vercel AI Gateway

import { streamText } from 'ai';

const DEFENSIVE_HEADERS = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * @param {Request} request
 */
export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...DEFENSIVE_HEADERS, ...CORS_HEADERS } });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...DEFENSIVE_HEADERS, ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const prompt = body.prompt || body.messages?.[body.messages.length - 1]?.content || "";
    const model = body.model || "openai/gpt-5.4";

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...DEFENSIVE_HEADERS, ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const result = streamText({
      model,
      prompt,
      maxTokens: body.maxTokens || 1024,
      temperature: body.temperature ?? 0.85,
      ...(body.system && { system: body.system }),
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";
        try {
          for await (const chunk of result.textStream) {
            fullText += chunk;
            const payload = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
          const usage = await result.usage;
          const donePayload = JSON.stringify({ done: true, fullText, usage });
          controller.enqueue(encoder.encode(`data: ${donePayload}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          const errorPayload = JSON.stringify({ error: err instanceof Error ? err.message : "stream failed" });
          controller.enqueue(encoder.encode(`data: ${errorPayload}\n\n`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      {
        status: 500,
        headers: { ...DEFENSIVE_HEADERS, ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }
}

export const config = {
  runtime: "edge",
};
