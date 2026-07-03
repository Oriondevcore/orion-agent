import { routeAgentRequest } from "agents";
import { OrionAgent } from "./orion-agent";
import { listModels, getModelAssignments, saveModelAssignments } from "./routes/models";
import { getSOPs, saveSOPs, resetSOPs, getDoc, saveDoc, deleteDoc, getDocList } from "./routes/content";
import { getKPIs, recordConversation, recordError } from "./routes/kpis";
import { requireAuth, json } from "./routes/auth";
import type { Env } from "./env";

export { OrionAgent };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Auth gate (skip for health and agent WebSocket)
    if (!path.startsWith("/agents/") && path !== "/health") {
      const authErr = requireAuth(request, env);
      if (authErr) return authErr;
    }

    // WebSocket chat — Think agent handles cf_agent_chat_* protocol
    if (path.startsWith("/agents/")) {
      const result = await routeAgentRequest(request, env);
      if (result) {
        recordConversation(env, 0.001).catch(() => {});
        return result;
      }
    }

    // ── Models ──

    if (path === "/api/models" && method === "GET") {
      const result = await listModels(env);
      return json(result);
    }

    if (path === "/api/models/assignments" && method === "GET") {
      const assignments = await getModelAssignments(env);
      return json(assignments);
    }

    if (path === "/api/models/assignments" && method === "PUT") {
      const body: any = await request.json();
      await saveModelAssignments(env, body);
      return json({ success: true });
    }

    // ── SOPs ──

    if (path === "/api/sops" && method === "GET") {
      const content = await getSOPs(env);
      return new Response(content, {
        headers: { "Content-Type": "text/markdown", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (path === "/api/sops" && method === "PUT") {
      const body: any = await request.json();
      await saveSOPs(env, body.content);
      return json({ success: true });
    }

    if (path === "/api/sops/reset" && method === "POST") {
      await resetSOPs(env);
      return json({ success: true });
    }

    // ── KPIs ──

    if (path === "/api/kpis" && method === "GET") {
      return json(await getKPIs(env));
    }

    // ── Docs ──

    if (path === "/api/docs" && method === "GET") {
      return json({ docs: getDocList() });
    }

    if (path.startsWith("/api/docs/") && method === "GET") {
      const name = path.slice("/api/docs/".length);
      const content = await getDoc(env, name);
      if (!content) return new Response("Not found", { status: 404 });
      return new Response(content, {
        headers: { "Content-Type": "text/markdown", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (path.startsWith("/api/docs/") && method === "PUT") {
      const name = path.slice("/api/docs/".length);
      const body: any = await request.json();
      await saveDoc(env, name, body.content);
      return json({ success: true });
    }

    if (path.startsWith("/api/docs/") && method === "DELETE") {
      const name = path.slice("/api/docs/".length);
      await deleteDoc(env, name);
      return json({ success: true });
    }

    // ── Context ──

    if (path === "/api/context" && method === "GET") {
      const sops = await getSOPs(env);
      const assignments = await getModelAssignments(env);
      return json({
        model: env.CF_MODEL_ORION,
        modelAssignments: assignments,
        status: "online",
        host: url.hostname,
        sopsLength: sops.length,
      });
    }

    // ── Health (no auth) ──

    if (path === "/health" && method === "GET") {
      return json({ status: "ok", model: env.CF_MODEL_ORION });
    }

    // Serve dashboard SPA
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
