import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { Search, Plus, Minus, HelpCircle, CreditCard, Shield, Zap, User } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Help Center — Reelio" },
      { name: "description", content: "Answers, guides, and tips for downloading videos with Reelio." },
      { property: "og:title", content: "Reelio Help Center" },
      { property: "og:description", content: "Search articles and answers about downloading with Reelio." },
    ],
  }),
  component: FAQPage,
});

const categories = [
  { key: "getting-started", label: "Getting started", Icon: Zap },
  { key: "account", label: "Account & login", Icon: User },
  { key: "billing", label: "Billing & plans", Icon: CreditCard },
  { key: "privacy", label: "Privacy & security", Icon: Shield },
  { key: "troubleshoot", label: "Troubleshooting", Icon: HelpCircle },
];

const faqs = [
  { cat: "getting-started", q: "How do I download my first video?", a: "Head to the Downloader, paste any video URL, choose format and quality, then click Download. Reelio does the rest in seconds." },
  { cat: "getting-started", q: "Do I need to install anything?", a: "No. Reelio runs entirely in your browser — no extensions, no apps." },
  { cat: "account", q: "Do I need an account?", a: "No account is required for basic downloads. Sign up to unlock history, batch downloads, and Pro features." },
  { cat: "account", q: "How do I reset my password?", a: "Click 'Forgot?' on the login page and follow the emailed link. Reset takes about a minute." },
  { cat: "billing", q: "Can I switch plans anytime?", a: "Yes. Upgrades apply instantly. Downgrades take effect at your next billing cycle." },
  { cat: "billing", q: "Do you offer refunds?", a: "Every paid plan comes with a 14-day money-back guarantee." },
  { cat: "privacy", q: "Do you store the videos I download?", a: "No. We stream content directly to your device — nothing is stored on our servers." },
  { cat: "privacy", q: "Is my payment info secure?", a: "Payments are processed by industry-standard providers using end-to-end encryption. We never see your card details." },
  { cat: "troubleshoot", q: "The download failed. What now?", a: "Refresh the preview and try again. If the video is private or region-locked, we may not be able to fetch it." },
  { cat: "troubleshoot", q: "Why is my download slower than usual?", a: "Peak hours can affect speed. Pro users get priority bandwidth on all downloads." },
];

function FAQPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const filtered = useMemo(() => {
    return faqs.filter((f) =>
      (!cat || f.cat === cat) &&
      (!query || (f.q + f.a).toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, cat]);
  const [open, setOpen] = useState<string | null>(faqs[0].q);

  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mesh-bg">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-gradient">Help Center</p>
          <h1 className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight">How can we help?</h1>
          <div className="mt-8 card-warm p-2 flex items-center gap-2 max-w-2xl mx-auto">
            <Search size={18} className="ml-3 text-black/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…" className="flex-1 py-3 outline-none bg-transparent" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <button onClick={() => setCat(null)} className={`card-warm p-5 text-left transition ${!cat ? "ring-warm" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-warm-gradient text-white grid place-items-center"><HelpCircle size={18} /></div>
            <p className="mt-3 font-bold text-sm">All topics</p>
          </button>
          {categories.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)} className={`card-warm p-5 text-left transition ${cat === c.key ? "ring-warm" : ""}`}>
              <div className="w-10 h-10 rounded-xl border border-black/10 grid place-items-center"><c.Icon size={18} /></div>
              <p className="mt-3 font-bold text-sm">{c.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-10 space-y-3">
          {filtered.length === 0 && <p className="text-center text-black/50 font-medium py-12">No matches. Try a different search.</p>}
          {filtered.map((it) => (
            <button key={it.q} onClick={() => setOpen(open === it.q ? null : it.q)} className="w-full text-left card-warm p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">{it.q}</span>
                {open === it.q ? <Minus size={18} /> : <Plus size={18} />}
              </div>
              {open === it.q && <p className="mt-3 text-sm text-black/70 font-medium">{it.a}</p>}
            </button>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
