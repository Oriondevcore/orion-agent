# FAQ

## General

### What is the Orion Agent?

It's an AI reasoning agent running on Cloudflare Workers. It uses the Think model (from the Agents SDK) for structured reasoning, tool calling, and WebSocket-based chat. It comes with a full admin dashboard for managing SOPs, docs, model assignments, KPIs, and conversation history.

### Does it require a specific Cloudflare plan?

Workers AI inference requires a Cloudflare account on a paid plan (Pay-as-you-go or Enterprise). Durable Objects are included in the Workers Paid plan. KV has a generous free tier.

### Can I use my own model?

Yes. Set the `CF_MODEL_ORION` environment variable to any Workers AI model ID, or assign different models per role from the dashboard Models tab.

## Setup

### I get `KV namespace not found` on deploy

Create the namespace first:

```bash
npx wrangler kv namespace create ORION_CONFIG
```

Then copy the returned ID into `wrangler.jsonc`.

### The dashboard shows blank page

- Check that you ran `bun run build` in the `client/` directory before deploying or starting the dev server
- Check browser console for errors
- Verify the Worker is serving assets: `curl http://localhost:8787/` should return HTML

### CORS errors in development

The Vite dev server at `localhost:5173` proxies `/api/*` to `localhost:8787`. If you open `localhost:8787` directly in the browser, the SPA loads but the Vite HMR won't work. Use `localhost:5173` for development.

## Chat

### The WebSocket keeps disconnecting

There's a built-in exponential backoff reconnection strategy. If disconnects persist:
- Check your network connection
- Check the Worker logs for DO crashes
- Increase `CF_MODEL_ORION` timeout by choosing a faster model
- Click **Reconnect WebSocket** in the Controls tab

### My conversation disappeared

Check localStorage in browser DevTools for key `orion-chat-history`. If it's missing:
- Did you clear browser storage?
- Did you click **Clear Conversation History**?
- The cap is 100 messages — older messages are trimmed

### Agent responses are slow

Try switching to a smaller/faster model:
- `@cf/meta/llama-3.1-8b-instruct`
- `@cf/qwen/qwen2.5-7b-instruct`
- `@cf/mistral/mistral-7b-instruct-v0.3`

## Auth

### I forgot the auth token

If you set `ORION_AUTH_TOKEN` as a Wrangler secret:

```bash
npx wrangler secret list
```

Secrets are not readable after being set. You'll need to:

1. Set a new secret: `npx wrangler secret put ORION_AUTH_TOKEN`
2. Clear your browser localStorage for the dashboard domain

### The auth token isn't working

- Did you set it as a local `.dev.vars` for development? It won't be available in production
- Did you set it as a Wrangler secret for production? It won't be available locally

## Voice

### Microphone doesn't work

- Browser requires HTTPS (or localhost) for microphone access
- Grant microphone permission when prompted
- Check browser compatibility: SpeechRecognition is supported in Chrome, Edge, and Safari (not Firefox)

### Workers AI voice mode doesn't respond

Workers AI Whisper and MeloTTS models are accessed via the Workers AI binding. If the binding is misconfigured or the model doesn't exist, voice will silently fall back to browser mode.

## Deployment

### How do I update the dashboard?

```bash
cd client
bun run build
cd ..
npx wrangler deploy
```

The dashboard is served as static assets by the Worker. No separate deployment needed.

### Can I use a custom domain?

Yes. Add a route to `wrangler.jsonc`:

```jsonc
"routes": [
  { "pattern": "agent.yourdomain.com", "custom_domain": true }
]
```

Then configure DNS at your domain provider.

### Durable Object binding errors

Ensure Durable Objects are enabled on your Cloudflare account. The `OrionAgent` DO must be defined in `wrangler.jsonc` with a class name that matches the export in `src/orion-agent.ts`.
