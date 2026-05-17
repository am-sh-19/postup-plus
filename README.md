# postup+

Post-operative patient care and pain management platform. Built during MIT Hacking Medicine Hackathon at Boston Orthopedic Technology Summit (BOTS). 

Won 2nd place. 


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
