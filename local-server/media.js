// yt-dlp / ffmpeg wrappers.
import { spawn } from "node:child_process";
import { config } from "./config.js";

export function isValidUrl(value) {
  try {
    const u = new URL(String(value));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function toolStatus() {
  return {
    ytdlp: Boolean(config.ytdlpPath),
    ytdlpPath: config.ytdlpPath,
    ffmpeg: Boolean(config.ffmpegPath),
    ffmpegPath: config.ffmpegPath,
  };
}

function run(bin, args, { signal, capture = true } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    if (capture) child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d.toString().slice(0, 4000)));
    const onAbort = () => child.kill("SIGKILL");
    signal?.addEventListener("abort", onAbort, { once: true });
    child.on("error", reject);
    child.on("close", (code) => {
      signal?.removeEventListener("abort", onAbort);
      if (signal?.aborted) return reject(Object.assign(new Error("Cancelled"), { code: "CANCELLED" }));
      if (code === 0) resolve(out);
      else reject(Object.assign(new Error(err.trim() || `yt-dlp exited with ${code}`), { stderr: err }));
    });
  });
}

/** Real metadata for a link. */
export async function probe(url, { signal } = {}) {
  if (!config.ytdlpPath) throw new Error("yt-dlp is not installed on this machine.");
  const raw = await run(
    config.ytdlpPath,
    [url, "--dump-single-json", "--no-warnings", "--no-playlist", "--no-check-certificates"],
    { signal },
  );
  const info = JSON.parse(raw);

  const heights = new Set();
  for (const f of info.formats ?? []) {
    if (f.vcodec && f.vcodec !== "none" && f.height) heights.add(f.height);
  }
  const qualities = [...heights].sort((a, b) => b - a).map((h) => `${h}p`);

  return {
    title: info.title ?? "Untitled",
    uploader: info.uploader || info.channel || info.uploader_id || "Unknown",
    duration: info.duration ?? null,
    thumbnail: info.thumbnail ?? null,
    extractor: info.extractor_key || info.extractor || "Unknown",
    webpageUrl: info.webpage_url || url,
    filesizeApprox: info.filesize_approx ?? null,
    qualities: qualities.length ? qualities : ["1080p", "720p", "480p"],
  };
}

/**
 * Build yt-dlp args that stream the finished file to stdout.
 * ffmpeg is required for MP3 extraction and for merged high-quality MP4.
 */
export function downloadArgs({ url, format, quality }) {
  const height = parseInt(quality, 10) || 1080;
  const args = [url, "--no-warnings", "--no-playlist", "--no-check-certificates", "-o", "-"];
  if (config.ffmpegPath) args.push("--ffmpeg-location", config.ffmpegPath);

  if (format === "mp3") {
    args.push("-f", "bestaudio/best", "-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    args.push(
      "-f",
      `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`,
      "--merge-output-format",
      "mp4",
    );
  }
  return args;
}

/** Spawn the streaming download. Returns the child process. */
export function spawnDownload(opts, { signal } = {}) {
  if (!config.ytdlpPath) throw new Error("yt-dlp is not installed on this machine.");
  const child = spawn(config.ytdlpPath, downloadArgs(opts), { stdio: ["ignore", "pipe", "pipe"] });
  signal?.addEventListener("abort", () => child.kill("SIGKILL"), { once: true });
  return child;
}

export function safeFilename(title, ext) {
  const base = String(title || "reelio")
    .replace(/[^\w\d\-_. ]+/g, "")
    .trim()
    .slice(0, 80) || "reelio";
  return `${base}.${ext}`;
}
