// Central configuration for the Reelio local backend.
// Everything is overridable through local-server/.env (see .env.example).
import "dotenv/config";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);

function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH && existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  try {
    const bundled = require("ffmpeg-static");
    if (bundled && existsSync(bundled)) return bundled;
  } catch {
    /* ffmpeg-static not installed */
  }
  try {
    const which = process.platform === "win32" ? "where" : "which";
    return execFileSync(which, ["ffmpeg"]).toString().trim().split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

function resolveYtDlp() {
  if (process.env.YTDLP_PATH && existsSync(process.env.YTDLP_PATH)) return process.env.YTDLP_PATH;
  const suffix = process.platform === "win32" ? ".exe" : "";
  const bundled = new URL(
    `./node_modules/youtube-dl-exec/bin/yt-dlp${suffix}`,
    import.meta.url,
  ).pathname;
  if (existsSync(bundled)) return bundled;
  try {
    const which = process.platform === "win32" ? "where" : "which";
    return execFileSync(which, ["yt-dlp"]).toString().trim().split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

export const config = {
  port: Number(process.env.PORT || 8787),
  httpsPort: Number(process.env.HTTPS_PORT || 8788),

  // Auth: comma-separated list of accepted API keys, plus an optional HMAC
  // secret for short-lived signed tokens (used for <a href> / window.location
  // downloads where custom headers are impossible).
  apiKeys: String(process.env.REELIO_API_KEYS || process.env.REELIO_API_KEY || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean),
  tokenSecret: process.env.REELIO_TOKEN_SECRET || "",
  tokenTtlSeconds: Number(process.env.REELIO_TOKEN_TTL || 300),

  // CORS: which frontend origins may call this server. "*" allows all.
  allowedOrigins: String(process.env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // Queue / concurrency
  maxConcurrentDownloads: Number(process.env.MAX_CONCURRENT_DOWNLOADS || 2),
  maxConcurrentInfo: Number(process.env.MAX_CONCURRENT_INFO || 4),
  maxQueueLength: Number(process.env.MAX_QUEUE_LENGTH || 20),
  jobTimeoutMs: Number(process.env.JOB_TIMEOUT_MS || 15 * 60 * 1000),

  ffmpegPath: resolveFfmpeg(),
  ytdlpPath: resolveYtDlp(),
};

export function authEnabled() {
  return config.apiKeys.length > 0 || Boolean(config.tokenSecret);
}
