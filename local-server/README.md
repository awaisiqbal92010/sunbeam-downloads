# Reelio local backend

Real video downloading runs on **your computer**, not on Lovable's servers
(the hosted runtime is a Cloudflare Worker and cannot run yt-dlp/ffmpeg).

## Setup

1. Install [ffmpeg](https://ffmpeg.org/download.html) and make sure `ffmpeg -version` works.
2. Start the server:

```bash
cd local-server
npm install
npm start
```

It listens on `http://localhost:8787`.

## Point the app at it

The web app reads `VITE_DOWNLOADER_API_URL` and falls back to
`http://localhost:8787`. To use a different host/port, add to `.env`:

```
VITE_DOWNLOADER_API_URL=http://localhost:8787
```

Note: browsers block requests from an `https://` page to `http://localhost`
in some configurations. Running the Reelio app locally (`npm run dev`) alongside
this server is the most reliable setup.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness check |
| POST | `/api/info` | `{ url }` -> title, uploader, duration, thumbnail, qualities |
| GET | `/api/download` | `?url=&format=mp4\|mp3&quality=1080p` -> streams the file |

## Legal

Only download content you own or have permission to download. Respect each
platform's Terms of Service and applicable copyright law.
