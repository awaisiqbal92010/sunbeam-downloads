export const DOWNLOADER_API_URL =
  (import.meta.env['VITE_DOWNLOADER_API_URL'] as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8787";

export const DOWNLOADER_API_KEY =
  (import.meta.env['VITE_DOWNLOADER_API_KEY'] as string | undefined) || "";

export type VideoInfo = {
  title: string;
  uploader: string;
  duration: number | null;
  thumbnail: string | null;
  extractor: string;
  webpageUrl: string;
  filesizeApprox?: number | null;
  qualities: string[];
};

export type QueueStats = {
  name: string;
  active: number;
  queued: number;
  concurrency: number;
  maxQueued: number;
};

export type ServerHealth = {
  ok: boolean;
  service: string;
  version: number;
  authRequired: boolean;
  tools: { ytdlp: boolean; ffmpeg: boolean };
  queue: { info: QueueStats; download: QueueStats };
};

export type ServerStatus =
  | { state: "checking" }
  | { state: "online"; health: ServerHealth }
  | { state: "unauthorized" }
  | { state: "mixed-content" }
  | { state: "offline"; reason: string };

function authHeaders(extra: Record<string, string> = {}) {
  return DOWNLOADER_API_KEY ? { ...extra, "x-api-key": DOWNLOADER_API_KEY } : extra;
}

/** True when an https page tries to reach an http backend — browsers block it. */
export function isMixedContent() {
  return (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    DOWNLOADER_API_URL.startsWith("http://") &&
    !/^http:\/\/(localhost|127\.0\.0\.1)/.test(DOWNLOADER_API_URL)
  );
}

/** Probe the backend for the status banner. Never throws. */
export async function checkServer(): Promise<ServerStatus> {
  if (isMixedContent()) return { state: "mixed-content" };
  try {
    const res = await fetch(`${DOWNLOADER_API_URL}/health`, { cache: "no-store" });
    if (!res.ok) return { state: "offline", reason: `Server replied ${res.status}` };
    const health = (await res.json()) as ServerHealth;

    if (health.authRequired) {
      const verify = await fetch(`${DOWNLOADER_API_URL}/api/verify`, { headers: authHeaders() });
      if (verify.status === 401) return { state: "unauthorized" };
    }
    return { state: "online", health };
  } catch {
    return {
      state: "offline",
      reason: window.location.protocol === "https:"
        ? "The browser could not reach the server (it may be blocking the insecure connection)."
        : "No response from the server.",
    };
  }
}

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  let res: Response;
  try {
    res = await fetch(`${DOWNLOADER_API_URL}/api/info`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error(
      `Can't reach your server at ${DOWNLOADER_API_URL}. Start it with "cd local-server && npm start".`,
    );
  }
  if (res.status === 401) throw new Error("Your access key was rejected by the server.");
  if (res.status === 429) throw new Error("The server is busy — too many jobs queued. Try again shortly.");
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
    throw new Error(body.detail || body.error || `Server error (${res.status})`);
  }
  return (await res.json()) as VideoInfo;
}

/** Ask the server for a short-lived token so a plain browser download can authenticate. */
async function mintDownloadToken(): Promise<string | null> {
  try {
    const res = await fetch(`${DOWNLOADER_API_URL}/api/token`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { token: string | null };
    return body.token ?? null;
  } catch {
    return null;
  }
}

export async function buildDownloadUrl(
  url: string,
  format: "MP4" | "MP3",
  quality: string,
  title = "reelio",
) {
  const params = new URLSearchParams({ url, format: format.toLowerCase(), quality, title });
  const token = await mintDownloadToken();
  if (token) params.set("token", token);
  else if (DOWNLOADER_API_KEY) params.set("key", DOWNLOADER_API_KEY);
  return `${DOWNLOADER_API_URL}/api/download?${params.toString()}`;
}

export async function fetchQueue(): Promise<{ info: QueueStats; download: QueueStats } | null> {
  try {
    const res = await fetch(`${DOWNLOADER_API_URL}/api/queue`, { headers: authHeaders() });
    if (!res.ok) return null;
    return (await res.json()) as { info: QueueStats; download: QueueStats };
  } catch {
    return null;
  }
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
