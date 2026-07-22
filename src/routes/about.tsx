import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { Heart, Sparkles, Users, MessageSquare, Mail, MapPin } from "lucide-react";
import { SectionHead } from "./index";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Contact — Reelio" },
      { name: "description", content: "The story behind Reelio — the premium video downloader for creators. Get in touch." },
      { property: "og:title", content: "About Reelio" },
      { property: "og:description", content: "Built by creators, for creators." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mesh-bg">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-gradient">About Reelio</p>
          <h1 className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            We're on a mission to <span className="text-warm-gradient">free your videos.</span>
          </h1>
          <p className="mt-6 text-lg text-black/70 font-medium max-w-2xl mx-auto">
            Reelio started as a weekend project between two creators tired of clunky downloaders. Today it powers 200,000+ makers across 40 countries.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid gap-6 md:grid-cols-3">
        {[
          { Icon: Heart, title: "Creator-first", desc: "We build every feature by asking one question: does this help someone ship?" },
          { Icon: Sparkles, title: "Ruthless polish", desc: "No dark patterns, no bloat. Fast, warm, and thoughtful — down to the pixel." },
          { Icon: Users, title: "Independent", desc: "Bootstrapped, no VC. Answerable only to the creators who use Reelio every day." },
        ].map((v) => (
          <div key={v.title} className="card-warm p-8">
            <div className="w-12 h-12 rounded-2xl bg-warm-gradient text-white grid place-items-center"><v.Icon size={22} /></div>
            <h3 className="mt-5 text-xl font-bold">{v.title}</h3>
            <p className="mt-2 text-black/70 font-medium">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-[#FFF6EF] py-24">
        <div className="mx-auto max-w-6xl px-6 grid gap-12 md:grid-cols-2 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-warm-gradient">Get in touch</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">Say hi. We reply.</h2>
            <p className="mt-4 text-black/70 font-medium">Feature requests, partnerships, bug reports, or just fan mail — the whole team reads every message.</p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 font-semibold"><span className="w-10 h-10 rounded-xl bg-warm-gradient text-white grid place-items-center"><Mail size={16} /></span> hey@reelio.app</div>
              <div className="flex items-center gap-3 font-semibold"><span className="w-10 h-10 rounded-xl bg-warm-gradient text-white grid place-items-center"><MessageSquare size={16} /></span> @reelioapp on X</div>
              <div className="flex items-center gap-3 font-semibold"><span className="w-10 h-10 rounded-xl bg-warm-gradient text-white grid place-items-center"><MapPin size={16} /></span> Lisbon · Remote-first</div>
            </div>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="card-warm p-8 space-y-4">
            <Field label="Your name" placeholder="Jane Doe" />
            <Field label="Email" placeholder="you@example.com" type="email" />
            <label className="block">
              <span className="text-sm font-semibold">Message</span>
              <textarea placeholder="What's on your mind?" rows={5}
                className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-warm resize-none" />
            </label>
            <button className="btn-warm btn-warm-hover w-full py-3">Send message</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <SectionHead eyebrow="By the numbers" title="A tiny team. Big impact." />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[
            { n: "200k+", l: "Creators" },
            { n: "12M", l: "Videos saved" },
            { n: "40", l: "Countries" },
            { n: "4.9★", l: "App rating" },
          ].map((s) => (
            <div key={s.l} className="card-warm p-8 text-center">
              <p className="text-4xl font-extrabold text-warm-gradient">{s.n}</p>
              <p className="mt-1 text-sm font-semibold text-black/60">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input type={type} placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-warm" />
    </label>
  );
}
