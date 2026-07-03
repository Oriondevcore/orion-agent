import { Think } from "@cloudflare/think";
import { createWorkersAI } from "workers-ai-provider";
import type { Env } from "./env";

export class OrionAgent extends Think<Env> {
  getModel() {
    return createWorkersAI({ binding: this.env.AI as Ai })(
      this.env.CF_MODEL_ORION,
    );
  }

  configureSession(session: any) {
    let s = session;
    const config = this.env.ORION_CONFIG;
    if (config) {
      s = s.withContext("sops", {
        description: "Standard operating procedures — the agent must adhere to these",
        maxTokens: 4000,
        load: async () => {
          const raw = await config.get("sops", "text");
          return raw || "";
        },
      });
      s = s.withContext("docs", {
        description: "Reference documentation (pricing, terms, privacy, onboarding)",
        maxTokens: 2000,
        load: async () => {
          const raw = await config.get("docs", "text");
          return raw || "";
        },
      });
    }
    return s;
  }

  getSystemPrompt(): string {
    return `You are Naledi, the AI assistant for Orion Ventures.

You help businesses with customer engagement, appointment booking, and general AI-powered assistance.

Core rules:
- You are helpful, professional, and concise.
- You never use emojis in responses that will appear on websites.
- You represent Orion Ventures — a South African AI company.
- Pricing: R2,690/mo general, R8,999/mo practitioners.
- When you don't know something, say so clearly.`;
  }

  async mintakaChat(input: string): Promise<{ response: string }> {
    const result = await this.runTurn({ input, mode: "wait" });
    if (result.status === "completed" && result.message) {
      const text = result.message.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("") || "";
      return { response: text };
    }
    return { response: "I encountered an error processing your request." };
  }

  async getContext(): Promise<{
    systemPrompt: string;
    model: string;
    conversations: number;
    sopCount: number;
  }> {
    return {
      systemPrompt: this.getSystemPrompt(),
      model: this.env.CF_MODEL_ORION,
      conversations: 0,
      sopCount: 0,
    };
  }

  async injectMemory(data: { key: string; content: string; importance?: number }): Promise<{ success: boolean }> {
    return { success: true };
  }
}
