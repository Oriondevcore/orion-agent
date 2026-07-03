# Orion Agent

Cloudflare Workers AI agent with a Think-based reasoning engine, real-time WebSocket chat, voice interface, and an admin dashboard — all running on Cloudflare Workers + Durable Objects + KV.

## Architecture

```
                    ┌─────────────────────────┐
                    │    Client (React SPA)    │
                    │  apps/orion-agent/client │
                    └────────┬───────┬─────────┘
                             │  WS   │  REST
                    ┌────────▼───────▼─────────┐
                    │   Worker (index.ts)      │
                    │  ┌───────────────────┐  │
                    │  │   OrionAgent DO    │  │
                    │  │  (Think + RPC)     │  │
                    │  └───────────────────┘  │
                    │         │               │
                    │  ┌──────▼────────┐     │
                    │  │   KV Store    │     │
                    │  │(SOPs, Docs,   │     │
                    │  │ models, KPIs) │     │
                    │  └───────────────┘     │
                    │         │               │
                    │  ┌──────▼────────┐     │
                    │  │  Workers AI   │     │
                    │  │ (inference)   │     │
                    │  └───────────────┘     │
                    └─────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
cd apps/orion-agent && bun install
cd client && bun install && cd ..

# Build dashboard
(cd client && bun run build)

# Run locally
bun run dev
# → Worker at http://localhost:8787
# → Dashboard at http://localhost:5173 (proxies to Worker)
```

## Deploy

```bash
# One-time: create KV namespace
npx wrangler kv namespace create ORION_CONFIG

# Deploy Worker + dashboard
npx wrangler deploy
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `CF_MODEL_ORION` | No | Model override (default: `@cf/moonshotai/kimi-k2.6`) |
| `ORION_AUTH_TOKEN` | No | Auth password (dashboard password gate) |

## Features

- Think-based reasoning agent with tool calling
- WebSocket real-time chat with auto-reconnect
- Voice input (browser native + Workers AI Whisper/MeloTTS)
- Model catalog browser (Cloudflare Workers AI models)
- SOPs/Docs CRUD management
- KPI tracking (conversations, cost, errors)
- Mintaka RPC via `@callable()` (mintakaChat, getContext, injectMemory)
- Auth gate with Bearer token
- Mobile responsive dashboard

## License

MIT
