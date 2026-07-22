import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { platforms } from "../components/platforms";
import {
  Zap, ShieldCheck, FileVideo, Layers, KeyRound, Sparkles,
  ArrowRight, Check, ClipboardPaste, Wand2, Download, Star, Plus, Minus,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reelio — Paste a link. Get the video." },
      { name: "description", content: "Download videos from YouTube, Instagram, TikTok, X, Facebook, Vimeo and Pinterest. Fast, watermark-free, no login required." },
      { property: "og:title", content: "Reelio — Paste a link. Get the video." },
      { property: "og:description", content: "The premium video downloader for creators. Any platform, any format." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <PlatformsShowcase />
      <Testimonials />
      <PricingPreview />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}

function Hero() {
  const [url, setUrl] = useState("");
  return (
    <section className="relative overflow-hidden mesh-bg">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-warm-gradient opacity-30 blur-3xl animate-blob" />
      <div className="absolute top-20 -right-32 w-[28rem] h-[28rem] rounded-full bg-warm-gradient opacity-25 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 bg-white/70 backdrop-blur text-xs font-semibold animate-fade-up">
          <Sparkles size={14} className="text-[#FF7A00]" />
          Now supporting 7 platforms · No watermark
        </div>
        <h1 className="mt-6 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] animate-fade-up">
          Paste a link. <br className="hidden md:block" />
          <span className="text-warm-gradient">Get the video.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-black/70 max-w-2xl mx-auto font-medium animate-fade-up">
          Reelio is the fastest way to save videos from any social platform — in the exact format and quality you want.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 p-2 card-warm animate-fade-up"
        >
          <div className="flex-1 flex items-center gap-3 px-4">
            <ClipboardPaste size={18} className="text-black/50" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any video URL here…"
              className="flex-1 py-3 bg-transparent outline-none text-base placeholder:text-black/40"
            />
          </div>
          <Link to="/download" className="btn-warm btn-warm-hover px-6 py-3.5 text-base">
            <Download size={18} /> Download
          </Link>
        </form>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 opacity-80">
          <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Works with</span>
          {platforms.map(({ name, Icon }) => (
            <div key={name} className="flex items-center gap-2 text-sm font-semibold">
              <Icon size={18} /> {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { Icon: ClipboardPaste, title: "Paste the link", desc: "Copy any video URL from your favorite platform and drop it in." },
    { Icon: Wand2, title: "Pick format & quality", desc: "Choose MP4 or MP3, from 480p to 1080p. Reelio detects the rest." },
    { Icon: Download, title: "Download instantly", desc: "Your video is saved locally — clean, watermark-free, ready to share." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead eyebrow="How it works" title="Three steps. Zero friction." />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="card-warm p-8 relative overflow-hidden">
            <div className="absolute top-4 right-6 text-6xl font-extrabold text-black/5">0{i + 1}</div>
            <div className="w-12 h-12 rounded-2xl bg-warm-gradient text-white grid place-items-center shadow-[0_10px_25px_-10px_rgba(255,122,0,0.6)]">
              <s.Icon size={22} />
            </div>
            <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-black/70 font-medium">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { Icon: Zap, title: "Blazing fast downloads", desc: "Optimized fetch pipeline gets you your file in seconds, not minutes." },
    { Icon: ShieldCheck, title: "No watermarks, ever", desc: "Clean video output that respects the creator's craft." },
    { Icon: FileVideo, title: "Multiple formats", desc: "MP4, MOV, WebM, MP3 — pick what fits your workflow." },
    { Icon: Layers, title: "Batch downloads", desc: "Queue dozens of links and let Reelio handle the rest." },
    { Icon: KeyRound, title: "No login required", desc: "Zero accounts, zero tracking, zero friction. Just download." },
    { Icon: Sparkles, title: "Premium quality", desc: "Original resolution preserved — up to 4K where available." },
  ];
  return (
    <section className="bg-[#FFF6EF] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead eyebrow="Features" title="Built for creators who move fast." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feats.map((f) => (
            <div key={f.title} className="group card-warm p-6 hover:shadow-[0_16px_40px_-16px_rgba(255,90,0,0.35)] transition">
              <div className="w-11 h-11 rounded-xl border border-black/10 grid place-items-center group-hover:bg-warm-gradient group-hover:text-white group-hover:border-transparent transition">
                <f.Icon size={20} />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-black/70 font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformsShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead eyebrow="Supported platforms" title="One tool. Every network." />
      <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {platforms.map(({ name, Icon }) => (
          <div key={name} className="card-warm p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition">
            <div className="w-12 h-12 rounded-2xl bg-warm-gradient text-white grid place-items-center">
              <Icon size={22} />
            </div>
            <p className="text-sm font-semibold text-center">{name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Maya Chen", role: "Content Strategist", quote: "I stopped using every other downloader the day I found Reelio. It just works." },
    { name: "Diego Alvarez", role: "Video Editor", quote: "Batch downloads saved me hours a week. The 1080p output is untouched quality." },
    { name: "Priya Nair", role: "Social Manager", quote: "Fast, clean interface, no watermarks. Reelio is my daily driver now." },
  ];
  return (
    <section className="bg-[#FFF6EF] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead eyebrow="Loved by creators" title="Trusted by 200k+ makers worldwide." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="card-warm p-8">
              <div className="flex gap-1 text-[#FF7A00]">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="mt-4 font-medium text-black/85 leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warm-gradient" />
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-black/60 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  const tiers = [
    { name: "Free", price: "$0", desc: "For casual downloads.", feats: ["5 downloads/day", "720p max", "MP4 & MP3"], cta: "Start free" },
    { name: "Pro", price: "$9", desc: "For daily creators.", feats: ["Unlimited downloads", "1080p & 4K", "Batch queue", "No ads"], cta: "Go Pro", highlight: true },
    { name: "Business", price: "$29", desc: "For teams & agencies.", feats: ["Everything in Pro", "Team seats", "API access", "Priority support"], cta: "Contact sales" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead eyebrow="Pricing" title="Simple plans. Serious value." />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`relative rounded-3xl p-8 bg-white ${t.highlight ? "shadow-[0_20px_60px_-20px_rgba(255,90,0,0.45)]" : "card-warm"}`}
            style={t.highlight ? { backgroundImage: "linear-gradient(#fff,#fff), linear-gradient(135deg,#FF3B30,#FF7A00,#FFC700)", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box", border: "2px solid transparent" } : {}}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-warm-gradient text-white">Most popular</span>
            )}
            <h3 className="font-bold text-lg">{t.name}</h3>
            <p className="text-sm text-black/60 font-medium">{t.desc}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold">{t.price}</span>
              <span className="text-black/60 font-medium">/mo</span>
            </div>
            <ul className="mt-6 space-y-3">
              {t.feats.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium">
                  <Check size={16} className="text-[#FF7A00]" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/pricing" className={`mt-8 w-full inline-flex justify-center py-3 rounded-xl font-semibold text-sm transition ${t.highlight ? "btn-warm btn-warm-hover" : "border border-black/15 hover:bg-black/5"}`}>
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Is Reelio really free?", a: "Yes. The free plan lets you download up to 5 videos a day in 720p with no login. Upgrade for higher quality and batch features." },
    { q: "Do I need to create an account?", a: "No. Reelio works instantly without a login. An account only unlocks history, batch, and Pro features." },
    { q: "Which platforms are supported?", a: "YouTube, Instagram, TikTok, Facebook, X/Twitter, Vimeo, and Pinterest. More coming soon." },
    { q: "Are videos watermark-free?", a: "Every download is delivered in its original quality with no Reelio watermark added." },
    { q: "Can I download in MP3?", a: "Yes — pick the MP3 format on the downloader page to save audio only." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[#FFF6EF] py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHead eyebrow="FAQ" title="Answers to the essentials." />
        <div className="mt-10 space-y-3">
          {items.map((it, i) => (
            <button
              key={it.q}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left card-warm p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">{it.q}</span>
                {open === i ? <Minus size={18} /> : <Plus size={18} />}
              </div>
              {open === i && <p className="mt-3 text-sm text-black/70 font-medium">{it.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="relative overflow-hidden rounded-[32px] bg-warm-gradient p-12 md:p-16 text-white text-center">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/20 blur-3xl rounded-full" />
        <h2 className="relative text-4xl md:text-5xl font-extrabold">Start downloading in seconds.</h2>
        <p className="relative mt-4 text-lg font-medium opacity-95 max-w-xl mx-auto">
          Free forever. No credit card. Just paste and go.
        </p>
        <Link to="/download" className="relative mt-8 inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition">
          Try Reelio now <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-gradient">{eyebrow}</p>
      <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h2>
    </div>
  );
}
