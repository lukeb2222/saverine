# Saverine support API

Serverless proxy between the support chat on saverine.shop (a static GitHub
Pages site) and xAI's Grok. It holds the API key so the browser never sees it.

`POST /api/chat` with `{ "messages": [{ "role": "user" | "assistant", "content": "..." }] }`
returns `{ "reply": "..." }`.

- **Facts:** the system prompt (`lib/prompt.js`) only allows answers from
  `lib/knowledge.js`, which is generated from `data/*.ts` in the site. After
  editing site data run `npm run support:knowledge` in the repo root and
  redeploy. `npm run test:support` fails if it's stale.
- **Model:** `grok-4.20-0309-non-reasoning` by default (fast, cheap). Override
  with `XAI_MODEL`, and optionally `XAI_REASONING_EFFORT` for reasoning models.
- **Limits:** 32 KB body, last 12 messages, 1000 chars per message, 30
  requests per IP per 5 minutes (in memory, per instance), 20 s upstream timeout.
- **CORS:** https://saverine.shop, https://lukeb2222.github.io, http://localhost:3000.

## Deploy on Vercel

1. New Project → import `lukeb2222/saverine`.
2. **Root Directory:** `support-api`. Framework preset: **Other**. Leave the
   build command, output directory and install command empty (there's nothing
   to build or install; `api/chat.js` becomes a Node.js function).
3. **Environment variable:** `XAI_API_KEY` = your xAI key (Production, and
   Preview if you want previews to work). Optional: `XAI_MODEL`.
4. Deploy. The endpoint is `https://<project>.vercel.app/api/chat`.
5. In GitHub: repo Settings → Secrets and variables → Actions → Variables →
   add `SUPPORT_API_URL` = that full endpoint URL, then re-run the Pages
   workflow. Without it the site keeps using the built-in keyword matcher.

## Local

```bash
cd support-api
XAI_API_KEY=... node dev-server.js     # http://localhost:8787/api/chat
```

Then build the site with `NEXT_PUBLIC_SUPPORT_API_URL=http://localhost:8787/api/chat`
and serve it on port 3000.
