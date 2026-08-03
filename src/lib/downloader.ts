export const DOWNLOADER_API_URL =
  (import.meta.env['VITE_DOWNLOADER_API_URL'] as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8787";

export type VideoInfo = {
  title: string;
  uploader: string;
  duration: number | null;
  thumbnail: string | null;
  extractor: string;
  webpageUrl: string;
  qualities: string[];
};

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  let res: Response;
  try {
    res = await fetch(`${DOWNLOADER_API_URL}/api/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error(
      `Can't reach your local server at ${DOWNLOADER_API_URL}. Start it with "cd local-server && npm start".`,
    );
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Server error (${res.status})`);
  }
  return (await res.json()) as VideoInfo;
}

export function buildDownloadUrl(url: string, format: "MP4" | "MP3", quality: string) {
  const params = new URLSearchParams({ url, format: format.toLowerCase(), quality });
  return `${DOWNLOADER_API_URL}/api/download?${params.toString()}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
