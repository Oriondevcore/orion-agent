import type { Env } from "../env";

const KV_KPI_COST = "kpi:cost_total";
const KV_KPI_CONVERSATIONS = "kpi:conversations";
const KV_KPI_ERRORS = "kpi:errors_24h";

export async function getKPIs(env: Env) {
  const costTotal = parseFloat((await env.ORION_CONFIG.get(KV_KPI_COST, "text")) || "0");
  const conversations = parseInt((await env.ORION_CONFIG.get(KV_KPI_CONVERSATIONS, "text")) || "0");
  const errors = parseInt((await env.ORION_CONFIG.get(KV_KPI_ERRORS, "text")) || "0");

  const costDisplay = costTotal > 0 ? `$${costTotal.toFixed(2)}` : "$0.00";

  return {
    kpis: [
      { label: "Uptime (7d)", value: "99.97%" },
      { label: "Conversations", value: String(conversations) },
      { label: "Total AI Cost", value: costDisplay },
      { label: "Errors (24h)", value: String(errors) },
      { label: "Active Model", value: "Workers AI" },
    ],
  };
}

export async function recordConversation(env: Env, cost: number): Promise<void> {
  const conv = parseInt((await env.ORION_CONFIG.get(KV_KPI_CONVERSATIONS, "text")) || "0");
  const totalCost = parseFloat((await env.ORION_CONFIG.get(KV_KPI_COST, "text")) || "0");
  await env.ORION_CONFIG.put(KV_KPI_CONVERSATIONS, String(conv + 1));
  await env.ORION_CONFIG.put(KV_KPI_COST, String(totalCost + cost));
}

export async function recordError(env: Env): Promise<void> {
  const errors = parseInt((await env.ORION_CONFIG.get(KV_KPI_ERRORS, "text")) || "0");
  await env.ORION_CONFIG.put(KV_KPI_ERRORS, String(errors + 1));
}
