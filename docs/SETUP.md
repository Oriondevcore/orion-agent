# Setup Guide

## Prerequisites

- [Bun](https://bun.sh) >= 1.2 (`curl -fsSL https://bun.sh/install | bash`)
- [Node.js](https://nodejs.org) >= 20
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`bun install -g wrangler` or `npx wrangler`)
- [Cloudflare account](https://dash.cloudflare.com) with:
  - Workers AI enabled
  - Durable Objects enabled

## Step 1: Clone & Install

```bash
# From the monorepo root
cd apps/orion-agent
bun install

# Install dashboard dependencies
cd client
bun install
cd ..
```

## Step 2: KV Namespace

The app uses a KV namespace for persistent config (SOPs, docs, model assignments, KPIs).

```bash
npx wrangler kv namespace create ORION_CONFIG
```

Copy the returned ID into `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  { "binding": "ORION_CONFIG", "id": "your-id-here" }
]
```

> If you are deploying to a different environment, create separate namespaces per environment:
> ```bash
> npx wrangler kv namespace create ORION_CONFIG --env staging
> ```

## Step 3: Build Dashboard

```bash
cd client
bun run build
cd ..
```

This builds the React SPA into `client/dist/`. The Worker serves it via Workers + Assets.

## Step 4: Local Development

```bash
# Terminal 1: Worker
bun run dev
# → http://localhost:8787

# Terminal 2: Dashboard dev server (Vite with API/WS proxy)
cd client && bun run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/*` and `/agents/*` to `localhost:8787` so you get hot module reload for the dashboard while the Worker handles backend.

## Step 5: Environment Variables (Optional)

Set a custom model:

```bash
export CF_MODEL_ORION=@cf/qwen/qwen2.5-7b-instruct
```

Enable auth:

```bash
# Locally in .dev.vars:
echo 'ORION_AUTH_TOKEN=my-secret-password' > .dev.vars

# For production as a secret:
npx wrangler secret put ORION_AUTH_TOKEN
# Enter the password when prompted
```

Once `ORION_AUTH_TOKEN` is set, the dashboard will show a password gate on load.

## Step 6: Deploy

```bash
# Make sure dashboard is built first
cd client && bun run build && cd ..

# Deploy
npx wrangler deploy

# Or with staging environment
npx wrangler deploy --env staging
```

## Post-Deploy Checks

```bash
# Health check
curl https://orion-agent.your-subdomain.workers.dev/health

# Check model catalog loads
curl https://orion-agent.your-subdomain.workers.dev/api/models | head -c 500

# Verify KV is working (default SOPs)
curl https://orion-agent.your-subdomain.workers.dev/api/sops
```
