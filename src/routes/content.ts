import type { Env } from "../env";

const DEFAULT_SOPS = `# Standard Operating Procedures

## 1. Client Communication
- Always respond within 30 seconds
- Use professional, clear language
- Never use emojis on public-facing websites
- Escalate unresolved issues to Graham

## 2. Data Privacy
- Never share client data with third parties
- All conversations are stored encrypted
- GDPR and POPIA compliance required

## 3. Onboarding Flow
1. Client expresses interest
2. Send pricing information
3. Schedule onboarding call
4. Set up WABA or Meta setup
5. Configure agent persona
6. Go live

## 4. Error Handling
- If model call fails, retry once
- If webhook verification fails, log and alert
- Never expose internal errors to end users
- All 5xx errors return { success: false }`;

const DEFAULT_DOCS: Record<string, string> = {
  pricing: `# Pricing

- **General:** R2,690/mo flat
- **Meta setup:** R4,690 once-off
- **Practitioners:** R8,999/mo
- **Practitioner special:** R6,999/mo (code: OPDOC26)
- **Medical Reps:** 10-15% recurring commission
- **Agentic Chat (US):** Contact for pricing`,
  onboarding: `# Practitioner Onboarding

1. Submit form at oriondevcore.com/onboard/practitioner
2. Verify practice details
3. Configure WABA number
4. Set up booking integration
5. Train Naledi on practice services
6. Go live with test conversation`,
  terms: `# Terms of Service

Service provided by Orion Dev Core.
Monthly subscription billed via PayFast.
Cancellation with 30 days notice.
Data stored on Cloudflare Workers (GDPR compliant).`,
  privacy: `# Privacy Policy

We collect only necessary business data.
Conversation data is stored encrypted.
We do not sell user data.
GDPR and POPIA compliant.
Data deletion available on request.`,
};

const KV_SOPS_KEY = "sops";
const KV_DOCS_PREFIX = "doc:";

export async function getSOPs(env: Env): Promise<string> {
  try {
    const raw = await env.ORION_CONFIG.get(KV_SOPS_KEY, "text");
    return raw || DEFAULT_SOPS;
  } catch {
    return DEFAULT_SOPS;
  }
}

export async function saveSOPs(env: Env, content: string): Promise<void> {
  await env.ORION_CONFIG.put(KV_SOPS_KEY, content);
}

export async function resetSOPs(env: Env): Promise<void> {
  await env.ORION_CONFIG.put(KV_SOPS_KEY, DEFAULT_SOPS);
}

export async function getDoc(env: Env, name: string): Promise<string | null> {
  try {
    const raw = await env.ORION_CONFIG.get(`${KV_DOCS_PREFIX}${name}`, "text");
    return raw || DEFAULT_DOCS[name.toLowerCase()] || null;
  } catch {
    return DEFAULT_DOCS[name.toLowerCase()] || null;
  }
}

export async function saveDoc(env: Env, name: string, content: string): Promise<void> {
  await env.ORION_CONFIG.put(`${KV_DOCS_PREFIX}${name}`, content);
}

export async function deleteDoc(env: Env, name: string): Promise<void> {
  await env.ORION_CONFIG.delete(`${KV_DOCS_PREFIX}${name}`);
}

export function getDocList(): string[] {
  return Object.keys(DEFAULT_DOCS);
}

export function getDefaultSOPs(): string {
  return DEFAULT_SOPS;
}

export function getDefaultDoc(name: string): string | null {
  return DEFAULT_DOCS[name.toLowerCase()] || null;
}
