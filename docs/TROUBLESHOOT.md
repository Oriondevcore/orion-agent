# Troubleshooting Guide

## Worker won't start

### "Module not found" errors

```bash
# From apps/orion-agent/
bun install
(cd client && bun install && bun run build)
```

If you only installed root dependencies, the client build step was skipped. The Worker expects `client/dist/` to exist.

### "KV namespace not found"

```
✘ [ERROR] Could not find KV namespace "ORION_CONFIG"
```

```bash
npx wrangler kv namespace create ORION_CONFIG
# Paste the returned ID into wrangler.jsonc
```

### "Durable Object not defined"

The class name in `wrangler.jsonc` must match the export in `src/orion-agent.ts`:

```jsonc
// wrangler.jsonc
"durable_objects": {
  "bindings": [
    { "name": "OrionAgent", "class_name": "OrionAgent" }
  ]
}
```

```typescript
// src/orion-agent.ts
export class OrionAgent extends Think<Env> { ... }
```

## Dashboard issues

### Blank page, no errors in console

The SPA may have a broken build. Run:

```bash
cd client && bun run build
```

Check `client/dist/index.html` exists and contains valid HTML. If using local dev, check Vite dev server is running on port 5173.

### Styles are broken

Hard refresh (Ctrl+F5 / Cmd+Shift+R) to clear cached CSS. CSS is extracted to a separate file (`index-*.css`) and may be cached aggressively by the browser or Cloudflare.

### Auth gate loops infinitely

- Clear `localStorage`: DevTools → Application → Local Storage → Clear All
- The token might be corrupted or expired (auth resets on secret change)
- If you haven't set `ORION_AUTH_TOKEN`, auth is disabled — you shouldn't see the gate at all

## WebSocket issues

### "WebSocket connection failed"

Check:
1. Worker is running (`curl /health`)
2. No firewall blocking WebSocket upgrade (port 8787 locally, or Cloudflare WebSocket support)
3. Durable Objects are not rate-limited (Workers Free plan has DO limits)

### Messages send but no response

The agent may be:
- Hitting a Workers AI rate limit (try a smaller model)
- Hitting a timeout (the Think model has a 30-second response limit)
- Crashing on an invalid tool call (check Worker logs: `wrangler tail`)

```bash
npx wrangler tail
# Watch for AI or model errors
```

### Chat history lost

Check `localStorage`:

```js
// In browser DevTools console
console.log(localStorage.getItem('orion-chat-history'));
```

If `null`, the history was cleared or never saved. Check:
- Is localStorage full? (try clearing other site data)
- Are you in incognito/private mode? (localStorage is cleared on close)

## Model issues

### "Model not found" errors

```json
{ "success": false, "error": "Model not found" }
```

The model ID may be incorrect. Browse available models at `GET /api/models` or check [Cloudflare Workers AI docs](https://developers.cloudflare.com/workers-ai/models/).

### Model catalog returns empty

The Workers AI API may be unavailable. The endpoint has a fallback list if the API call fails. Check:

```bash
curl https://orion-agent.your-subdomain.workers.dev/api/models | head
```

If even the fallback is empty, the Worker may not have the AI binding configured correctly.

## Performance

### Agent is slow

- **Model**: Use a smaller model (7B instead of 70B parameters)
- **Context**: Fewer SOPs/docs = faster context setup
- **Tools**: Disable unused tools in Controls
- **Cold starts**: Durable Objects cold start on first request after idle. Keep a ping endpoint or use Workers cron

### Memory usage

The Think agent stores conversation state in DO memory. Each session uses approximately:
- ~100KB + message content per session
- Messages are not evicted automatically

To free memory, the DO is garbage-collected by Cloudflare after ~30 seconds of inactivity. If you need longer sessions, keep the WebSocket open.

## Voice issues

### Microphone permission denied

- Check browser location/address bar for the microphone icon
- Click the icon and allow permission
- On macOS, check System Settings → Privacy → Microphone
- On Linux, check pulseaudio/pipewire is running

### Workers AI voice fails silently

The Whisper model (`@cf/openai/whisper`) and MeloTTS model (`@cf/myshell-ai/melo-tts-large`) must be available in Workers AI. If unavailable, the voice toggle falls back to browser mode. Check:

```bash
curl /api/models | grep -i whisper
curl /api/models | grep -i melo
```

## Deployment

### "wrangler deploy" fails

Common causes:
1. Missing KV namespace (see above)
2. Missing `account_id` in `wrangler.jsonc`
3. Missing `AI` binding (Workers AI must be enabled)
4. TypeScript compilation errors (run `tsc --noEmit` first)

### "Script too large"

The Worker bundles client assets into the deployment. If the dashboard is very large (many dependencies), the combined bundle may exceed Cloudflare's 5MB Worker size limit. The current dashboard is ~250KB JS + ~8KB CSS, well within limits.

## Logs

### Viewing Worker logs

```bash
# Live tail
npx wrangler tail

# With filters
npx wrangler tail --status ok --status error

# For a specific function
npx wrangler tail --function orion-agent
```

### Viewing DO logs

Durable Object logs are not yet available via `wrangler tail`. Use `console.log` in the agent and check the Cloudflare Dashboard → Workers & Pages → Orion Agent → Logs.

## Known Issues

- **DO storage not yet configured**: Conversations are stored in DO memory only. If the DO restarts, conversation state is lost. Use the dashboard's chat history (localStorage) as your source of truth for past conversations.
- **Cost tracking is approximate**: KPIs increment via KV counters rather than actual billing data. Numbers are directional, not auditable.
- **No streaming in Mintaka RPC**: The `mintakaChat()` callable returns the full response at once, not streamed. For streaming, use the WebSocket endpoint.
