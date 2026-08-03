import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { platforms } from "../components/platforms";
import { useState } from "react";
import { ClipboardPaste, Download, Loader2, Play, Clock, User, Check, RotateCw, AlertTriangle, ServerCog } from "lucide-react";
import {
  DOWNLOADER_API_URL,
  buildDownloadUrl,
  fetchVideoInfo,
  formatDuration,
  type VideoInfo,
} from "@/lib/downloader";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Downloader — Reelio" },
      { name: "description", content: "Paste any video link and grab it in the format and quality you want." },
      { property: "og:title", content: "Reelio Downloader" },
      { property: "og:description", content: "Fast, watermark-free video downloads." },
    ],
  }),
  component: DownloadPage,
});

type Stage = "idle" | "fetching" | "ready" | "downloading" | "done" | "error";

function DownloadPage() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [format, setFormat] = useState<"MP4" | "MP3">("MP4");
  const [quality, setQuality] = useState("1080p");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string>("");

  const detectedPlatform = detectPlatform(url);

  const fetchPreview = async () => {
    if (!url) return;
    setStage("fetching");
    setError("");
    setInfo(null);
    try {
      const data = await fetchVideoInfo(url.trim());
      setInfo(data);
      setQuality(data.qualities[0] ?? "1080p");
      setStage("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStage("error");
    }
  };

  const startDownload = () => {
    if (!info) return;
    setStage("downloading");
    // The browser handles the actual transfer; the local server streams the file.
    window.location.href = buildDownloadUrl(info.webpageUrl, format, quality);
    setTimeout(() => setStage("done"), 2500);
  };

  const reset = () => {
    setStage("idle");
    setUrl("");
    setInfo(null);
    setError("");
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mesh-bg">
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Download <span className="text-warm-gradient">any video</span>
            </h1>
            <p className="mt-3 text-lg text-black/70 font-medium">Paste a link — your local Reelio server does the rest.</p>
          </div>

          <div className="mt-10 card-warm p-3 flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 px-4">
              {detectedPlatform ? (
                <detectedPlatform.Icon size={18} className="text-[#FF7A00]" />
              ) : (
                <ClipboardPaste size={18} className="text-black/40" />
              )}
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPreview()}
                placeholder="https://www.youtube.com/watch?v=…"
                className="flex-1 py-3 bg-transparent outline-none"
              />
            </div>
            <button onClick={fetchPreview} disabled={stage === "fetching"} className="btn-warm btn-warm-hover px-6 py-3 disabled:opacity-60">
              {stage === "fetching" ? <><Loader2 className="animate-spin" size={18} /> Fetching…</> : <>Fetch preview</>}
            </button>
          </div>

          <p className="mt-3 text-xs font-medium text-black/50 flex items-center gap-1.5">
            <ServerCog size={13} /> Connected to your server at {DOWNLOADER_API_URL}
          </p>

          {stage === "fetching" && (
            <div className="mt-8 card-warm p-6 flex items-center gap-4 animate-fade-up">
              <Loader2 className="animate-spin text-[#FF7A00]" />
              <p className="font-medium">Reading {detectedPlatform?.name ?? "the link"}…</p>
            </div>
          )}

          {stage === "error" && (
            <div className="mt-8 card-warm p-6 animate-fade-up border-l-4 border-[#FF3B30]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-[#FF3B30] shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold">Couldn't fetch that link</p>
                  <p className="mt-1 text-sm text-black/70 font-medium break-words">{error}</p>
                  <button onClick={fetchPreview} className="mt-3 text-sm font-semibold flex items-center gap-1">
                    <RotateCw size={14} /> Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {info && (stage === "ready" || stage === "downloading" || stage === "done") && (
            <div className="mt-8 card-warm p-6 animate-fade-up">
              <div className="grid md:grid-cols-[280px_1fr] gap-6">
                <div className="relative aspect-video rounded-2xl bg-warm-gradient overflow-hidden grid place-items-center">
                  {info.thumbnail ? (
                    <img src={info.thumbnail} alt={info.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/20" />
                      <Play size={40} className="relative text-white" fill="white" />
                    </>
                  )}
                  <span className="absolute bottom-2 right-2 text-xs font-bold bg-black/70 text-white px-2 py-0.5 rounded-md">
                    {formatDuration(info.duration)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-warm-gradient">{info.extractor}</p>
                  <h3 className="mt-1 text-xl font-bold leading-tight">{info.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-sm text-black/60 font-medium">
                    <span className="flex items-center gap-1"><User size={14} /> {info.uploader}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {formatDuration(info.duration)}</span>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Format</p>
                    <div className="inline-flex p-1 rounded-xl bg-[#FFF6EF] border border-black/5">
                      {(["MP4", "MP3"] as const).map((f) => (
                        <button key={f} onClick={() => setFormat(f)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${format === f ? "bg-warm-gradient text-white shadow" : "text-black/70"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {format === "MP4" && (
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Quality</p>
                      <div className="inline-flex flex-wrap gap-2">
                        {info.qualities.slice(0, 6).map((q) => (
                          <button key={q} onClick={() => setQuality(q)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${quality === q ? "bg-warm-gradient text-white border-transparent" : "border-black/15 hover:border-[#FF7A00]"}`}>
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                {stage === "ready" && (
                  <button onClick={startDownload} className="btn-warm btn-warm-hover w-full py-3.5">
                    <Download size={18} /> Download {format} {format === "MP4" ? quality : ""}
                  </button>
                )}
                {stage === "downloading" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFF6EF] font-semibold">
                    <Loader2 className="animate-spin text-[#FF7A00]" size={18} />
                    Preparing your file — the download will start in your browser.
                  </div>
                )}
                {stage === "done" && (
                  <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#FFF6EF]">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="w-8 h-8 rounded-full bg-warm-gradient text-white grid place-items-center"><Check size={16} /></span>
                      Sent to your downloads!
                    </div>
                    <button onClick={reset} className="text-sm font-semibold flex items-center gap-1">
                      <RotateCw size={14} /> Download another
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <RecentDownloads />
        </div>
      </section>
      <Footer />
    </div>
  );
}

function detectPlatform(url: string) {
  const map: Record<string, string> = {
    youtube: "YouTube", "youtu.be": "YouTube",
    instagram: "Instagram", tiktok: "TikTok",
    facebook: "Facebook", twitter: "X / Twitter", "x.com": "X / Twitter",
    vimeo: "Vimeo", pinterest: "Pinterest",
  };
  for (const key in map) if (url.toLowerCase().includes(key)) {
    return platforms.find((p) => p.name === map[key]);
  }
  return null;
}

const recents = [
  { title: "Morning coffee ritual", platform: "Instagram", size: "12.4 MB", quality: "1080p" },
  { title: "Behind the scenes: album cover", platform: "TikTok", size: "8.1 MB", quality: "720p" },
  { title: "How I built a home studio", platform: "YouTube", size: "48.9 MB", quality: "1080p" },
  { title: "City lights hyperlapse", platform: "Vimeo", size: "22.0 MB", quality: "1080p" },
];

function RecentDownloads() {
  return (
    <div className="mt-14">
      <h2 className="text-2xl font-bold">Recent downloads</h2>
      <div className="mt-4 card-warm divide-y divide-black/5">
        {recents.map((r, i) => {
          const p = platforms.find((x) => x.name === r.platform);
          const Icon = p?.Icon;
          return (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-14 h-14 rounded-xl bg-warm-gradient grid place-items-center text-white shrink-0">
                {Icon && <Icon size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.title}</p>
                <p className="text-xs text-black/60 font-medium">{r.platform} · {r.quality} · {r.size}</p>
              </div>
              <button className="text-sm font-semibold px-4 py-2 rounded-xl border border-black/10 hover:bg-warm-gradient hover:text-white hover:border-transparent transition shrink-0">
                <Download size={14} className="inline mr-1" /> Again
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
