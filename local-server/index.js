// Reelio local backend — runs on YOUR computer, not on Lovable's servers.
//
//   cd local-server
//   npm install
//   npm start           -> http://localhost:8787
//
// Requires yt-dlp + ffmpeg available (youtube-dl-exec downloads a yt-dlp binary
// on install; ffmpeg must be installed separately for MP3 / merged MP4 output).

import express from "express";
import cors from "cors";
import { spawn } from "node:child_process";
import ytdlp from "youtube-dl-exec";

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

const YTDLP_BIN =
  process.env.YTDLP_PATH ||
  // youtube-dl-exec ships a binary; expose its path for raw streaming spawns.
  new URL("./node_modules/youtube-dl-exec/bin/yt-dlp", import.meta.url).pathname;

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "reelio-local" }));

/**
 * POST /api/info  { url }
 * Returns real metadata: title, uploader, duration, thumbnail, available qualities.
 */
app.post("/api/info", async (req, res) => {
  const { url } = req.body ?? {};
  if (!isValidUrl(url)) return res.status(400).json({ error: "Invalid URL" });

  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
    });

    const heights = new Set();
    for (const f of info.formats ?? []) {
      if (f.vcodec && f.vcodec !== "none" && f.height) heights.add(f.height);
    }
    const qualities = [...heights].sort((a, b) => b - a).map((h) => `${h}p`);

    res.json({
      title: info.title,
      uploader: info.uploader || info.channel || info.uploader_id || "Unknown",
      duration: info.duration ?? null,
      thumbnail: info.thumbnail ?? null,
      extractor: info.extractor_key || info.extractor || "Unknown",
      webpageUrl: info.webpage_url || url,
      qualities: qualities.length ? qualities : ["1080p", "720p", "480p"],
    });
  } catch (err) {
    console.error("[info]", err?.stderr || err?.message || err);
    res.status(502).json({ error: "Could not read that link", detail: String(err?.stderr || err?.message || err).slice(0, 500) });
  }
});

/**
 * GET /api/download?url=...&format=mp4|mp3&quality=1080p
 * Streams the real file straight to the browser.
 */
app.get("/api/download", (req, res) => {
  const url = String(req.query.url || "");
  const format = String(req.query.format || "mp4").toLowerCase();
  const quality = String(req.query.quality || "1080p");

  if (!isValidUrl(url)) return res.status(400).json({ error: "Invalid URL" });

  const height = parseInt(quality, 10) || 1080;
  const args = [url, "--no-warnings", "--no-playlist", "-o", "-"];

  if (format === "mp3") {
    args.push("-f", "bestaudio", "-x", "--audio-format", "mp3");
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'attachment; filename="reelio-audio.mp3"');
  } else {
    args.push("-f", `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`, "--merge-output-format", "mp4");
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="reelio-video.mp4"');
  }

  const child = spawn(YTDLP_BIN, args, { stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.pipe(res);
  child.stderr.on("data", (d) => process.stderr.write(d));
  child.on("error", (err) => {
    console.error("[download]", err);
    if (!res.headersSent) res.status(500).json({ error: "yt-dlp failed to start" });
    else res.end();
  });
  req.on("close", () => child.kill("SIGKILL"));
});

app.listen(PORT, () => {
  console.log(`Reelio local backend listening on http://localhost:${PORT}`);
});
