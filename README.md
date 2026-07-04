# Orion Agent

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%23EA4AAA.svg?style=flat&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Oriondevcore)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://github.com/Oriondevcore/orion-agent/actions/workflows/deploy.yml/badge.svg)](https://github.com/Oriondevcore/orion-agent/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

Think-based AI agent on Cloudflare Workers with real-time WebSocket chat, voice interface, admin dashboard, and a modular reasoning engine.

## What Makes Orion Agent Different

Most AI agents are stateless — fire a prompt, get a reply, forget everything. Orion Agent uses a **Think-then-Act** reasoning loop inspired by cognitive architectures. Every user message triggers a structured deliberation cycle: context retrieval → reasoning → tool selection → action → observation. This gives the agent genuine situational awareness across sessions.

The agent maintains persistent memory via Durable Objects, supports real-time collaboration through WebSocket state sync, and integrates with Cloudflare Workers AI for inference, Whisper for speech-to-text, and MeloTTS for voice output.

## Architecture

```
Client (React SPA) ──WebSocket──► Worker ──► OrionAgent DO ──► KV Store
                        │                                    │
                        └──────── REST ───────────────────────┘
                                              │
                                        Workers AI
                                    (inference + voice)
```

- **OrionAgent DO** — Durable Object that owns conversation state, Think loop, and RPC interface
- **KV Store** — SOPs, documentation, model catalog, KPI counters
- **React Dashboard** — WebSocket-connected admin UI with model browser, memory inspector, and voice input

## Quick Start

```bash
cd apps/orion-agent
bun install
cd client && bun install && cd ..
(cd client && bun run build)
bun run dev
```

Worker at `localhost:8787`, dashboard at `localhost:5173`.

## Deploy

```bash
npx wrangler kv namespace create ORION_CONFIG
npx wrangler deploy
```

## Features

- Think-based reasoning engine with tool-calling loop
- WebSocket real-time chat with auto-reconnect
- Voice input + output (Whisper + MeloTTS)
- Model catalog browser with live inference switching
- SOPs / Docs CRUD management (KV-backed)
- KPI tracking (conversations, cost, error rates)
- Mintaka RPC `@callable()` — `mintakaChat`, `getContext`, `injectMemory`
- Auth gate with Bearer token
- Mobile responsive dashboard

## Environment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CF_MODEL_ORION` | No | `@cf/moonshotai/kimi-k2.6` | Model override |
| `ORION_AUTH_TOKEN` | No | — | Dashboard password |

## License

MIT
