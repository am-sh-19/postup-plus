# postup+

Hackathon project for post-operative patient care.

## Run locally

From the repo root:

```bash
bun install
bun run dev
```

Or from the app folder:

```bash
cd web
bun install
bun run dev
```

Open http://localhost:3000

## Vercel deploy

In the Vercel project: **Settings → General → Root Directory → `web`** (then redeploy).

If Root Directory is the repo root, framework detection fails because `next` is declared in `web/package.json`, not the root wrapper.
