# How-To Guide

## Dashboard

### Login

If `ORION_AUTH_TOKEN` was configured, the dashboard shows a password form. Enter the token value and click **Unlock**. The token is stored in your browser's `localStorage` — you won't need to re-enter unless you clear storage or logout.

### Chat

The **Chat** tab opens a WebSocket connection to the agent.

- Type a message and press Enter or click **Send**
- The agent streams responses with reasoning trace (collapsible)
- Your conversation history auto-saves to `localStorage` — reload the page and it restores

#### Voice Input

Click the microphone icon next to the input box to toggle voice mode.

- **Browser Speech** mode uses your browser's built-in speech recognition — works offline, supports multiple languages (check browser support)
- **Workers AI** mode sends audio to Workers AI Whisper for transcription and returns the agent's response via MeloTTS speech synthesis

Toggle between modes by clicking the mode label.

### Model Catalog

The **Models** tab shows all available Cloudflare Workers AI models with their descriptions.

- Browse the list, filter by name
- **Assign a model** to each role: chat, vision, embedding, tools, classifier
- Click **Save Assignments** to persist to KV — the agent reads these on next interaction

### SOPs (Standard Operating Procedures)

The **SOPs** tab lets you manage the instructions the agent follows.

- Edit SOPs in markdown with a live preview toggle
- Click **Save SOP** to persist to KV
- Click **Reset** to restore the defaults (built into the Worker)
- SOPs are injected into the agent's context blocks on every session

### Docs

The **Docs** tab manages reference documents the agent can read.

- Each doc has a name (key) and markdown content
- **Save** writes to KV, **Delete** removes from KV
- The agent loads all docs into context blocks on session configuration

### KPIs

The **KPIs** tab shows real-time metrics:

| Metric | Source | Update |
|--------|--------|--------|
| Conversations | KV counter | Incremented on each WebSocket message |
| Total AI Cost | KV counter | Tracks approximate cost from Workers AI usage |
| Errors (24h) | KV counter | Incremented on agent errors |

Click **Refresh** to reload from the server.

### Controls

The **Controls** tab provides:

- **System Prompt** — view and edit the agent's base system prompt
- **Tools** — toggle available tools (browser, sandbox, code mode, search)
- **Agent Info** — read-only: active model, host, SOP status
- **Actions** — clear chat history, reconnect WebSocket, reset SOPs

## Mintaka Integration

The OrionAgent exposes `@callable()` RPC methods for the Mintaka daemon:

- **mintakaChat(id, message)** — send a message to an agent session, get a response
- **getContext()** — get full agent context (config, SOPs, docs)
- **injectMemory(content, importance)** — inject system memory into agent context

Call these via WebSocket RPC through the Durable Object:

```js
// From another Worker:
const agent = env.OrionAgent.get(id);
const response = await agent.mintakaChat(sessionId, "Hello");
```

## Conversation History

- Automatically saved to `localStorage` under key `orion-chat-history`
- Survives page reloads and browser restarts
- Capped at 100 messages (oldest are trimmed)
- Clear via **Controls** → **Clear Conversation History**

## Model Assignments

Model → role assignments are stored in KV at key `model-assignments`. Default:

| Role | Model |
|------|-------|
| chat | `@cf/moonshotai/kimi-k2.6` |
| vision | `@cf/meta/llama-3.2-11b-vision-instruct` |
| embedding | `@cf/baai/bge-large-en-v1.5` |
| tools | `@cf/meta/llama-4-scout-17b-16e-instruct` |
| classifier | `@cf/huggingface/distilbert-sst-2-int8` |

Override any of these from the **Models** tab in the dashboard.
