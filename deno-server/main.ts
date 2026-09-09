// Reelio backend — Deno edition.
// Same HTTP API as local-server/, no npm install needed.
//
//   deno task start          -> http://localhost:8787
//   deno task start --https  -> https://localhost:8788 (needs certs/)
//
// Requires yt-dlp and ffmpeg on PATH (or set YTDLP_PATH / FFMPEG_PATH).

const env = (k: string, d = "") => Deno.env.get(k) ?? d;

const PORT = Number(env("PORT", "8787"));
const HTTPS_PORT = Number(env("HTTPS_PORT", "8788"));
const API_KEYS = env("REELIO_API_KEYS").split(",").map((s) => s.trim()).filter(Boolean);
const TOKEN_SECRET = env("REELIO_TOKEN_SECRET");
const TOKEN_TTL = Number(env("REELIO_TOKEN_TTL", "300"));
const MAX_DOWNLOADS = Number(env("MAX_CONCURRENT_DOWNLOADS", "2"));
const MAX_INFO = Number(env("MAX_CONCURRENT_INFO", "4"));
const MAX_QUEUE = Number(env("MAX_QUEUE_LENGTH", "20"));
const YTDLP = env("YTDLP_PATH", "yt-dlp");
const FFMPEG = env("FFMPEG_PATH", "ffmpeg");
const ALLOWED = env("ALLOWED_ORIGINS", "*");

const authEnabled = () => API_KEYS.length > 0 || TOKEN_SECRET.length > 0;

/* ------------------------------ auth ---------------------------------- */

const enc = new TextEncoder();

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(TOKEN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function mintToken() {
  if (!TOKEN_SECRET) return null;
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL;
  return `${exp}.${await hmac(String(exp))}`;
}

async function validToken(token: string | null) {
  if (!token || !TOKEN_SECRET) return false;
  const [expRaw, sig] = token.split(".");
  const exp = Number(expRaw);
  if (!exp || !sig || exp < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(await hmac(String(exp)), sig);
}

function validKey(key: string | null) {
  return !!key && API_KEYS.some((k) => safeEqual(k, key));
}

async function authorize(req: Request, url: URL): Promise<boolean> {
  if (!authEnabled()) return true;
  const key = req.headers.get("x-api-key") ??
    (req.headers.get("authorization")?.replace(/^Bearer /i, "") ?? null);
  if (validKey(key)) return true;
  return await validToken(url.searchParams.get("token") ?? req.headers.get("x-reelio-token"));
}

/* ------------------------------ queue ---------------------------------- */

class Queue {
  active = 0;
  pending: Array<() => void> = [];
  constructor(public name: string, public concurrency: number, public maxQueued: number) {}
  get stats() {
    return {
      name: this.name,
      active: this.active,
      queued: this.pending.length,
      concurrency: this.concurrency,
      maxQueued: this.maxQueued,
    };
  }
  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.concurrency) {
      if (this.pending.length >= this.maxQueued) throw new Error("QUEUE_FULL");
      await new Promise<void>((r) => this.pending.push(r));
    }
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      this.pending.shift()?.();
    }
  }
}

const infoQueue = new Queue("info", MAX_INFO, MAX_QUEUE);
const downloadQueue = new Queue("download", MAX_DOWNLOADS, MAX_QUEUE);

/* ------------------------------ helpers -------------------------------- */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED === "*" ? "*" : ALLOWED.split(",")[0].trim(),
    "Access-Control-Allow-Headers": "Content-Type, x-api-key, authorization, x-reelio-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders() },
  });

function isValidUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function which(bin: string) {
  try {
    const p = new Deno.Command(bin, { args: ["--version"], stdout: "null", stderr: "null" });
    return (await p.output()).success;
  } catch {
    return false;
  }
}

async function probe(url: string) {
  const cmd = new Deno.Command(YTDLP, {
    args: [url, "--dump-single-json", "--no-warnings", "--no-playlist", "--no-check-certificates"],
    stdout: "piped",
    stderr: "piped",
  });
  const out = await cmd.output();
  if (!out.success) throw new Error(new TextDecoder().decode(out.stderr).slice(0, 600));
  // deno-lint-ignore no-explicit-any
  const info: any = JSON.parse(new TextDecoder().decode(out.stdout));
  const heights = new Set<number>();
  for (const f of info.formats ?? []) {
    if (f.vcodec && f.vcodec !== "none" && f.height) heights.add(f.height);
  }
  const qualities = [...heights].sort((a, b) => b - a).map((h) => `${h}p`);
  return {
    title: info.title ?? "Untitled",
    uploader: info.uploader ?? info.channel ?? "Unknown",
    duration: info.duration ?? null,
    thumbnail: info.thumbnail ?? null,
    extractor: info.extractor_key ?? info.extractor ?? "Unknown",
    webpageUrl: info.webpage_url ?? url,
    filesizeApprox: info.filesize_approx ?? null,
    qualities: qualities.length ? qualities : ["1080p", "720p", "480p"],
  };
}

function downloadArgs(url: string, format: string, quality: string) {
  const height = parseInt(quality, 10) || 1080;
  const args = [url, "--no-warnings", "--no-playlist", "--no-check-certificates", "-o", "-", "--ffmpeg-location", FFMPEG];
  if (format === "mp3") {
    args.push("-f", "bestaudio/best", "-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    args.push(
      "-f",
      `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`,
      "--merge-output-format",
      "mp4",
    );
  }
  return args;
}

function safeName(title: string, ext: string) {
  const base = title.replace(/[^\w\d\-_. ]+/g, "").trim().slice(0, 80) || "reelio";
  return `${base}.${ext}`;
}

/* ------------------------------ router --------------------------------- */

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });

  if (url.pathname === "/health") {
    return json({
      ok: true,
      service: "reelio-deno",
      version: 2,
      authRequired: authEnabled(),
      tools: { ytdlp: await which(YTDLP), ffmpeg: await which(FFMPEG) },
      queue: { info: infoQueue.stats, download: downloadQueue.stats },
    });
  }

  if (url.pathname === "/api/token" && req.method === "POST") {
    if (authEnabled() && !validKey(req.headers.get("x-api-key"))) return json({ error: "Unauthorized" }, 401);
    return json({ token: await mintToken(), expiresIn: TOKEN_TTL });
  }

  if (!(await authorize(req, url))) return json({ error: "Unauthorized" }, 401);

  if (url.pathname === "/api/verify") return json({ ok: true });
  if (url.pathname === "/api/queue") return json({ info: infoQueue.stats, download: downloadQueue.stats });

  if (url.pathname === "/api/info" && req.method === "POST") {
    const { url: target } = await req.json().catch(() => ({ url: "" }));
    if (!isValidUrl(target)) return json({ error: "That doesn't look like a valid link." }, 400);
    try {
      return json(await infoQueue.run(() => probe(target)));
    } catch (e) {
      const msg = String((e as Error).message);
      if (msg === "QUEUE_FULL") return json({ error: "Server is busy", queue: infoQueue.stats }, 429);
      return json({ error: "Could not read that link", detail: msg }, 502);
    }
  }

  if (url.pathname === "/api/download") {
    const target = url.searchParams.get("url") ?? "";
    const format = (url.searchParams.get("format") ?? "mp4").toLowerCase() === "mp3" ? "mp3" : "mp4";
    const quality = url.searchParams.get("quality") ?? "1080p";
    const title = url.searchParams.get("title") ?? "reelio";
    if (!isValidUrl(target)) return json({ error: "Invalid URL" }, 400);

    try {
      return await downloadQueue.run(async () => {
        const child = new Deno.Command(YTDLP, {
          args: downloadArgs(target, format, quality),
          stdout: "piped",
          stderr: "null",
        }).spawn();
        return new Response(child.stdout, {
          headers: {
            "content-type": format === "mp3" ? "audio/mpeg" : "video/mp4",
            "content-disposition": `attachment; filename="${safeName(title, format)}"`,
            "cache-control": "no-store",
            ...corsHeaders(),
          },
        });
      });
    } catch (e) {
      const msg = String((e as Error).message);
      if (msg === "QUEUE_FULL") {
        return json({ error: "Too many downloads in progress", queue: downloadQueue.stats }, 429);
      }
      return json({ error: "Download failed", detail: msg }, 502);
    }
  }

  return json({ error: "Not found" }, 404);
}

const useHttps = Deno.args.includes("--https");
if (useHttps) {
  Deno.serve(
    {
      port: HTTPS_PORT,
      cert: await Deno.readTextFile(env("TLS_CERT_PATH", "./certs/cert.pem")),
      key: await Deno.readTextFile(env("TLS_KEY_PATH", "./certs/key.pem")),
    },
    handler,
  );
  console.log(`Reelio (Deno, TLS) on https://localhost:${HTTPS_PORT}`);
} else {
  Deno.serve({ port: PORT }, handler);
  console.log(`Reelio (Deno) on http://localhost:${PORT}`);
}
