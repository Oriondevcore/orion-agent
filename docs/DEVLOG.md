# Development Log

## 3 July 2026 — Initial scaffold

- Created `apps/orion-agent` with Think-based agent harness
- Set up Worker entry with WebSocket chat, REST API, and SPA fallback
- Integrated `workers-ai-provider` for LLM inference (replacing siliconflow dependency)
- Created Durable Object `OrionAgent` extending Think with `@callable()` RPC methods
- Default model: `@cf/moonshotai/kimi-k2.6`

### Structure

```
apps/orion-agent/
  src/
    orion-agent.ts    → Think<Env> subclass, configureSession, callable RPC
    index.ts          → Worker entry, API routes, auth, WebSocket handler
    env.ts            → Bindings & env type
    routes/
      auth.ts         → Auth middleware, CORS, json helper
      models.ts       → CF model catalog proxy, KV-backed assignments
      content.ts      → SOPs + Docs CRUD (KV-backed)
      kpis.ts         → KV counter KPIs
  client/             → React SPA dashboard
    src/
      App.tsx         → Auth gate, routing
      components/
        Layout.tsx    → Sidebar nav with mobile responsiveness
      pages/
        Chat.tsx      → WebSocket chat with voice, history persistence
        Models.tsx    → Model browser + role assignment
        SOPs.tsx      → SOPs markdown editor
        Docs.tsx      → Docs CRUD editor
        KPIs.tsx      → Real-time metrics
        Controls.tsx  → System prompt, tools, agent info
      styles.css      → Dark theme, mobile breakpoints
```

## 4 July 2026 — Nine improvements

Executed the complete improvement plan:

### 1. Chat with streaming & recovery
- WebSocket connection with auto-reconnect using exponential backoff
- Streaming message rendering (agent response appears token by token)
- Connection recovery: if WebSocket drops mid-conversation, history survives

### 2. Model persistence
- Model assignments stored in KV (`ORION_CONFIG`) at key `model-assignments`
- Dashboard Models tab: browse CF catalog, assign per role, Save to KV
- Worker reads assignments on each agent session

### 3. SOPs/Docs CRUD
- SOPs stored in KV at key `sops`
- Docs stored in KV with prefix `doc:{name}`
- SOPs tab: markdown editor with edit/preview toggle, save, reset to defaults
- Docs tab: per-doc markdown editor, save and delete
- Dashboard never shows hardcoded values — always reads from KV

### 4. Agent reads SOPs
- `configureSession()` loads SOPs from KV at session start
- SOPs injected as context blocks via `.withContext()`
- Docs also injected as context blocks
- Lazy-load callbacks so agent always reads latest

### 5. Authentication
- `ORION_AUTH_TOKEN` secret env var
- Dashboard shows password gate if token is set
- Token stored in localStorage, sent as `Authorization: Bearer` header
- Server validates on every API call and WebSocket connect

### 6. Mobile responsive
- Hamburger menu button on mobile (< 768px)
- Sidebar slides in from left with CSS transition
- Semi-transparent overlay behind sidebar
- Close on overlay click or nav link click
- Responsive grid for Controls and KPIs

### 7. Workers AI voice toggle
- Browser SpeechRecognition as default (native, low-latency)
- Workers AI Whisper + MeloTTS as toggle option
- Dashboard toggle in Chat page
- Fallback to browser mode if AI models unavailable

### 8. Conversation history
- Auto-save to localStorage on each message
- Restore on page load
- Cap at 100 messages (oldest trimmed)
- Clear from Controls tab

### 9. Cost tracking KPI
- KV counters: `kpi:conversations`, `kpi:cost`, `kpi:errors`
- Incremented in index.ts on each event
- Displayed in KPIs tab

### Technical decisions

- KV chosen over D1 for config: simpler, global, no schema needed
- `useAgentChat` from `@cloudflare/ai-chat/react` had peer-dependency issues — used raw WebSocket protocol instead
- TypeScript strict mode throughout
- `experimentalDecorators` disabled — Agents SDK uses its own transform
- Assets served via Workers + Assets (`not_found_handling: single-page-application`)
- Vite dev server proxies API/WS to Worker for HMR in development

### Build verification

```
$ cd client && bun run build
✓ built in 1.99s (48 modules, 249KB JS, 8KB CSS)

$ cd .. && tsc --noEmit
✓ No type errors
```

## Known Issues

- Cost tracking uses KV counters (approximate, not transactional)
- No DO SQLite storage for conversation persistence yet
- Mintaka RPC returns full response, not streamed
- No CI/CD pipeline configured
