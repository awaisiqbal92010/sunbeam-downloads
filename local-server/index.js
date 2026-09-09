// Reelio local backend — runs on YOUR computer, not on Lovable's servers.
//
//   cd local-server
//   npm install
//   npm run keygen     -> writes .env with an API key + token secret
//   npm start          -> http://localhost:8787
//   npm run proxy      -> https://localhost:8788 (TLS in front of the above)
//
// Features: yt-dlp + ffmpeg extraction, API-key / signed-token auth,
// FIFO job queue with concurrency limits, live progress over SSE.
import express from "express";
import cors from "cors";
import { config, authEnabled } from "./config.js";
import { requireAuth, mintToken, isValidApiKey } from "./auth.js";
import { JobQueue } from "./queue.js";
import { probe, spawnDownload, isValidUrl, toolStatus, safeFilename } from "./media.js";

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: config.allowedOrigins.includes("*") ? true : config.allowedOrigins,
    credentials: false,
    allowedHeaders: ["Content-Type", "x-api-key", "authorization", "x-reelio-token"],
    exposedHeaders: ["x-reelio-job-id"],
  }),
);
app.use(express.json({ limit: "64kb" }));

const infoQueue = new JobQueue({
  concurrency: config.maxConcurrentInfo,
  maxQueued: config.maxQueueLength,
  timeoutMs: 60_000,
  name: "info",
});
const downloadQueue = new JobQueue({
  concurrency: config.maxConcurrentDownloads,
  maxQueued: config.maxQueueLength,
  timeoutMs: config.jobTimeoutMs,
  name: "download",
});

/* ------------------------------- health -------------------------------- */
// Public on purpose: the frontend banner needs to detect the server before it
// knows whether its API key is correct.
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "reelio-local",
    version: 2,
    authRequired: authEnabled(),
    tools: toolStatus(),
    queue: { info: infoQueue.stats, download: downloadQueue.stats },
  });
});

/** Verify a key without doing work — used by the status banner. */
app.get("/api/verify", requireAuth, (_req, res) => res.json({ ok: true }));

/** Short-lived token for header-less browser downloads. */
app.post("/api/token", (req, res) => {
  if (authEnabled()) {
    const key = req.get("x-api-key") || (req.get("authorization") || "").replace(/^Bearer /i, "");
    if (!isValidApiKey(key)) return res.status(401).json({ error: "Unauthorized" });
  }
  const token = mintToken();
  res.json({ token, expiresIn: config.tokenTtlSeconds });
});

/* -------------------------------- info --------------------------------- */
app.post("/api/info", requireAuth, async (req, res) => {
  const { url } = req.body ?? {};
  if (!isValidUrl(url)) return res.status(400).json({ error: "That doesn't look like a valid link." });

  let job;
  try {
    job = infoQueue.push(({ signal }) => probe(String(url).trim(), { signal }), { label: "info" });
  } catch (err) {
    return res.status(429).json({ error: "Server is busy", detail: err.message, queue: infoQueue.stats });
  }

  req.on("close", () => infoQueue.cancel(job.id));

  try {
    const data = await job.promise;
    res.json(data);
  } catch (err) {
    if (err.code === "CANCELLED") return;
    console.error("[info]", err.message);
    res.status(502).json({
      error: "Could not read that link",
      detail: String(err.stderr || err.message).slice(0, 600),
    });
  }
});

/* ------------------------------ download ------------------------------- */
app.get("/api/download", requireAuth, async (req, res) => {
  const url = String(req.query.url || "");
  const format = String(req.query.format || "mp4").toLowerCase() === "mp3" ? "mp3" : "mp4";
  const quality = String(req.query.quality || "1080p");
  const title = String(req.query.title || "reelio");

  if (!isValidUrl(url)) return res.status(400).json({ error: "Invalid URL" });
  if (format === "mp3" && !config.ffmpegPath) {
    return res.status(503).json({ error: "ffmpeg is not installed — MP3 conversion is unavailable." });
  }

  let job;
  try {
    job = downloadQueue.push(
      ({ signal }) =>
        new Promise((resolve, reject) => {
          const child = spawnDownload({ url, format, quality }, { signal });

          res.setHeader("x-reelio-job-id", job?.id ?? "");
          res.setHeader("Content-Type", format === "mp3" ? "audio/mpeg" : "video/mp4");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${safeFilename(title, format)}"`,
          );
          res.setHeader("Cache-Control", "no-store");

          child.stdout.pipe(res);
          let stderr = "";
          child.stderr.on("data", (d) => (stderr += d.toString().slice(0, 2000)));
          child.on("error", reject);
          child.on("close", (code) => {
            if (code === 0 || res.writableEnded) resolve();
            else reject(new Error(stderr.trim() || `yt-dlp exited with ${code}`));
          });
        }),
      { label: url },
    );
  } catch (err) {
    return res
      .status(429)
      .json({ error: "Too many downloads in progress", detail: err.message, queue: downloadQueue.stats });
  }

  req.on("close", () => downloadQueue.cancel(job.id));

  try {
    await job.promise;
    res.end();
  } catch (err) {
    if (err.code === "CANCELLED") return;
    console.error("[download]", err.message);
    if (!res.headersSent) res.status(502).json({ error: "Download failed", detail: err.message.slice(0, 600) });
    else res.end();
  }
});

/* ------------------------------- queue --------------------------------- */
app.get("/api/queue", requireAuth, (_req, res) => {
  res.json({ info: infoQueue.stats, download: downloadQueue.stats });
});

/** Live queue updates (Server-Sent Events) for realistic progress in the UI. */
app.get("/api/queue/stream", requireAuth, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  const send = () =>
    res.write(`data: ${JSON.stringify({ info: infoQueue.stats, download: downloadQueue.stats })}\n\n`);
  send();
  const onChange = () => send();
  downloadQueue.on("change", onChange);
  infoQueue.on("change", onChange);
  const beat = setInterval(() => res.write(": ping\n\n"), 15000);
  req.on("close", () => {
    clearInterval(beat);
    downloadQueue.off("change", onChange);
    infoQueue.off("change", onChange);
  });
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(config.port, () => {
  const t = toolStatus();
  console.log(`\n  Reelio local backend  →  http://localhost:${config.port}`);
  console.log(`  auth:      ${authEnabled() ? "API key required" : "OPEN (set REELIO_API_KEYS!)"}`);
  console.log(`  yt-dlp:    ${t.ytdlp ? t.ytdlpPath : "MISSING — run npm install"}`);
  console.log(`  ffmpeg:    ${t.ffmpeg ? t.ffmpegPath : "MISSING — MP3/merged MP4 disabled"}`);
  console.log(
    `  limits:    ${config.maxConcurrentDownloads} concurrent downloads, queue ${config.maxQueueLength}\n`,
  );
});
