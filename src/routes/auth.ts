import type { Env } from "../env";

export function requireAuth(request: Request, env: Env): Response | null {
  const token = env.ORION_AUTH_TOKEN;
  if (!token) return null; // no auth configured = open

  const auth = request.headers.get("Authorization");
  if (auth === `Bearer ${token}`) return null;

  // Allow WebSocket upgrade requests through (auth via token in URL if needed)
  if (request.headers.get("Upgrade") === "websocket") return null;

  return new Response("Unauthorized", { status: 401 });
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: corsHeaders() });
}
