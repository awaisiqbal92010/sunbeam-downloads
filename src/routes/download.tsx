import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { platforms } from "../components/platforms";
import { useState } from "react";
import { ClipboardPaste, Download, Loader2, Play, Clock, User, Check, RotateCw } from "lucide-react";

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

type Stage = "idle" | "fetching" | "ready" | "downloading" | "done";

function DownloadPage() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [format, setFormat] = useState<"MP4" | "MP3">("MP4");
  const [quality, setQuality] = useState<"1080p" | "720p" | "480p">("1080p");
  const [progress, setProgress] = useState(0);

  const detectedPlatform = detectPlatform(url);

  const fetchPreview = () => {
    if (!url) return;
    setStage("fetching");
    setTimeout(() => setStage("ready"), 1400);
  };

  const startDownload = () => {
    setStage("downloading");
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setStage("done");
          return 100;
        }
        return p + 6;
      });
    }, 140);
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
            <p className="mt-3 text-lg text-black/70 font-medium">Paste a link — we'll fetch a preview instantly.</p>
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
                placeholder="https://www.youtube.com/watch?v=…"
                className="flex-1 py-3 bg-transparent outline-none"
              />
            </div>
            <button onClick={fetchPreview} className="btn-warm btn-warm-hover px-6 py-3">
              {stage === "fetching" ? <><Loader2 className="animate-spin" size={18} /> Fetching…</> : <>Fetch preview</>}
            </button>
          </div>

          {stage === "fetching" && (
            <div className="mt-8 card-warm p-6 flex items-center gap-4 animate-fade-up">
              <Loader2 className="animate-spin text-[#FF7A00]" />
              <p className="font-medium">Fetching preview from {detectedPlatform?.name ?? "source"}…</p>
            </div>
          )}

          {(stage === "ready" || stage === "downloading" || stage === "done") && (
            <div className="mt-8 card-warm p-6 animate-fade-up">
              <div className="grid md:grid-cols-[280px_1fr] gap-6">
                <div className="relative aspect-video rounded-2xl bg-warm-gradient overflow-hidden grid place-items-center">
                  <div className="absolute inset-0 bg-black/20" />
                  <Play size={40} className="relative text-white" fill="white" />
                  <span className="absolute bottom-2 right-2 text-xs font-bold bg-black/70 text-white px-2 py-0.5 rounded-md">04:32</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-warm-gradient">
                    {detectedPlatform?.name ?? "YouTube"}
                  </p>
                  <h3 className="mt-1 text-xl font-bold leading-tight">Sunset timelapse over the Dolomites — 4K</h3>
                  <div className="mt-3 flex items-center gap-4 text-sm text-black/60 font-medium">
                    <span className="flex items-center gap-1"><User size={14} /> Wandering Frames</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> 4:32</span>
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
                        {(["1080p", "720p", "480p"] as const).map((q) => (
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
                  <div>
                    <div className="flex items-center justify-between text-sm font-semibold mb-2">
                      <span>Downloading…</span><span>{progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#FFF6EF] overflow-hidden">
                      <div className="h-full bg-warm-gradient transition-[width] duration-150" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {stage === "done" && (
                  <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#FFF6EF]">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="w-8 h-8 rounded-full bg-warm-gradient text-white grid place-items-center"><Check size={16} /></span>
                      Download complete!
                    </div>
                    <button onClick={() => { setStage("idle"); setUrl(""); setProgress(0); }} className="text-sm font-semibold flex items-center gap-1">
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
