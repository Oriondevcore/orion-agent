import type { Env } from "../env";

interface CFModel {
  name: string;
  task: string;
  properties?: Record<string, string>;
}

export async function listModels(env: Env): Promise<{ models: CFModel[]; error?: string }> {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return fallbackModels();
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models/search?per_page=200`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) return fallbackModels();

    const data: any = await res.json();
    if (data.success && Array.isArray(data.result)) {
      return {
        models: data.result.map((m: any) => ({
          name: m.name || m.id || "unknown",
          task: m.task?.id || m.task || "unknown",
          properties: m.properties || m.description
            ? { description: m.properties?.description || m.description || "" }
            : undefined,
        })),
      };
    }
    return fallbackModels();
  } catch {
    return fallbackModels();
  }
}

export async function getModelAssignments(env: Env): Promise<Record<string, string>> {
  try {
    const raw = await env.ORION_CONFIG.get("model_assignments", "text");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveModelAssignments(env: Env, assignments: Record<string, string>): Promise<void> {
  await env.ORION_CONFIG.put("model_assignments", JSON.stringify(assignments));
}

const FALLBACK_MODELS: CFModel[] = [
  { name: "@cf/moonshotai/kimi-k2.6", task: "text-generation", properties: { description: "Kimi K2.6 12B, strong reasoning" } },
  { name: "@cf/meta/llama-4-scout-17b-16e-instruct", task: "text-generation", properties: { description: "Llama 4 Scout, vision + text" } },
  { name: "@cf/meta/llama-3.2-11b-vision-instruct", task: "text-generation", properties: { description: "Llama 3.2 11B Vision" } },
  { name: "@cf/meta/llama-3.2-3b-instruct", task: "text-generation", properties: { description: "Llama 3.2 3B, fast/cheap" } },
  { name: "@cf/meta/llama-3.1-8b-instruct", task: "text-generation", properties: { description: "Llama 3.1 8B" } },
  { name: "@cf/meta/llama-3.1-70b-instruct", task: "text-generation", properties: { description: "Llama 3.1 70B, high quality" } },
  { name: "@cf/qwen/qwen2.5-7b-instruct", task: "text-generation", properties: { description: "Qwen 2.5 7B" } },
  { name: "@cf/qwen/qwen2.5-32b-instruct", task: "text-generation", properties: { description: "Qwen 2.5 32B" } },
  { name: "@cf/openai/whisper-large-v3-turbo", task: "automatic-speech-recognition" },
  { name: "@cf/myshell-ai/melotts", task: "text-to-speech" },
  { name: "@cf/facebook/segment-anything-2", task: "image-segmentation" },
  { name: "@cf/stabilityai/stable-diffusion-xl-base-1.0", task: "text-to-image" },
];

function fallbackModels(): { models: CFModel[] } {
  return { models: FALLBACK_MODELS };
}
