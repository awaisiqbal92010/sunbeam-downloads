<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

<!-- BASE44:BEGIN -->
## Base44 development environment

- Start with `docker compose -f docker-compose.base44.yml up -d` (web on host port 3000, download API on 8000).
- `web` uses `oven/bun:1.2`, bind-mounts the repo, runs `bun install --frozen-lockfile && bun run dev`.
  The lockfile resolves some `@lovable.dev/*` packages from a GCP artifact registry — bun reaches it fine, but if installs ever fail there, run `bun install` (non-frozen) to fall back to the public npm registry.
- `api` is `local-server` (Express + yt-dlp + ffmpeg) on `node:22-bookworm`, port 8000.
  Its dev API key / token secret are self-generated in compose (`REELIO_API_KEY`, `REELIO_TOKEN_SECRET` with `:-` defaults); real credentials can be supplied as the same env names.
- The frontend reads `VITE_DOWNLOADER_API_URL` (the sandbox's public port 8000) and `VITE_DOWNLOADER_API_KEY`.
- Supabase publishable keys live in the committed `.env` (Lovable convention — public by design, not secrets).
- Verify: all routes SSR-return HTTP 200 (`/`, `/download`, `/dashboard`, ...), and the `/download` page banner says "Connected to your server".
<!-- BASE44:END -->
