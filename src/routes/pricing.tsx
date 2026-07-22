import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { SectionHead } from "./index";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Reelio" },
      { name: "description", content: "Simple, transparent pricing. Free forever plan available." },
      { property: "og:title", content: "Reelio Pricing" },
      { property: "og:description", content: "Free, Pro, and Business plans for every kind of creator." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const tiers = [
    { name: "Free", monthly: 0, annual: 0, desc: "Casual downloads.", feats: ["5 downloads / day", "Up to 720p", "MP4 & MP3", "No login required"], cta: "Start free" },
    { name: "Pro", monthly: 12, annual: 9, desc: "Everyday creators.", feats: ["Unlimited downloads", "Up to 4K quality", "Batch queue (25)", "No ads", "Download history"], cta: "Go Pro", highlight: true },
    { name: "Business", monthly: 39, annual: 29, desc: "Teams and agencies.", feats: ["Everything in Pro", "5 team seats", "API access", "Priority support", "Custom watermarking"], cta: "Contact sales" },
  ];

  const compareRows = [
    { label: "Daily downloads", free: "5", pro: "Unlimited", biz: "Unlimited" },
    { label: "Max quality", free: "720p", pro: "4K", biz: "4K" },
    { label: "MP3 audio export", free: true, pro: true, biz: true },
    { label: "Batch queue", free: false, pro: "25 links", biz: "Unlimited" },
    { label: "Download history", free: false, pro: true, biz: true },
    { label: "Team seats", free: false, pro: false, biz: "5 included" },
    { label: "API access", free: false, pro: false, biz: true },
    { label: "Priority support", free: false, pro: false, biz: true },
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mesh-bg">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-gradient">Pricing</p>
          <h1 className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight">Fair. Fast. Flexible.</h1>
          <p className="mt-4 text-lg text-black/70 font-medium max-w-xl mx-auto">Pick a plan that grows with your workflow. Change anytime.</p>

          <div className="mt-10 inline-flex p-1 rounded-full bg-white border border-black/10 shadow-sm">
            <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-semibold ${!annual ? "bg-warm-gradient text-white" : "text-black/70"}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${annual ? "bg-warm-gradient text-white" : "text-black/70"}`}>
              Annual <span className={`text-[10px] px-1.5 py-0.5 rounded ${annual ? "bg-white/25" : "bg-warm-gradient text-white"}`}>-25%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 -mt-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-3xl p-8 bg-white ${t.highlight ? "shadow-[0_20px_60px_-20px_rgba(255,90,0,0.45)]" : "card-warm"}`}
              style={t.highlight ? { backgroundImage: "linear-gradient(#fff,#fff), linear-gradient(135deg,#FF3B30,#FF7A00,#FFC700)", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box", border: "2px solid transparent" } : {}}>
              {t.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-warm-gradient text-white">Most popular</span>}
              <h3 className="font-bold text-lg">{t.name}</h3>
              <p className="text-sm text-black/60 font-medium">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold">${annual ? t.annual : t.monthly}</span>
                <span className="text-black/60 font-medium">/mo</span>
              </div>
              {annual && t.monthly > 0 && <p className="text-xs text-black/50 mt-1">Billed annually · save ${(t.monthly - t.annual) * 12}/yr</p>}
              <ul className="mt-6 space-y-3">
                {t.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-medium">
                    <Check size={16} className="text-[#FF7A00] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-8 w-full inline-flex justify-center py-3 rounded-xl font-semibold text-sm transition ${t.highlight ? "btn-warm btn-warm-hover" : "border border-black/15 hover:bg-black/5"}`}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-24">
          <SectionHead eyebrow="Compare" title="Everything, side by side." />
          <div className="mt-10 card-warm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FFF6EF]">
                  <th className="text-left p-4 font-bold">Feature</th>
                  <th className="p-4 font-bold">Free</th>
                  <th className="p-4 font-bold">Pro</th>
                  <th className="p-4 font-bold">Business</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r, i) => (
                  <tr key={i} className="border-t border-black/5">
                    <td className="p-4 font-semibold">{r.label}</td>
                    {[r.free, r.pro, r.biz].map((v, j) => (
                      <td key={j} className="p-4 text-center font-medium">
                        {typeof v === "boolean" ? (v ? <Check size={18} className="text-[#FF7A00] inline" /> : <X size={18} className="text-black/25 inline" />) : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-24">
          <SectionHead eyebrow="FAQ" title="Pricing questions, answered." />
          <div className="mt-10 max-w-3xl mx-auto space-y-3">
            {[
              { q: "Can I switch plans anytime?", a: "Yes. Upgrades apply instantly and downgrades take effect at your next billing cycle." },
              { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee on all paid plans, no questions asked." },
              { q: "Is there a student discount?", a: "Yes, 50% off Pro with a valid student email. Contact us to apply." },
              { q: "What payment methods do you accept?", a: "All major cards, Apple Pay, Google Pay, and PayPal." },
            ].map((it) => (
              <div key={it.q} className="card-warm p-6">
                <p className="font-semibold">{it.q}</p>
                <p className="mt-2 text-sm text-black/70 font-medium">{it.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
