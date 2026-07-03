export interface Env {
  AI: unknown;
  ASSETS: Fetcher;
  ORION_CONFIG: KVNamespace;
  OrionAgent: DurableObjectNamespace;
  CF_MODEL_ORION: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  ORION_AUTH_TOKEN?: string;
  YOCO_LIVE_KEY?: string;
}
