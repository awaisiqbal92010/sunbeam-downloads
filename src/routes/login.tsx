import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Reelio" },
      { name: "description", content: "Log in to your Reelio account." },
      { property: "og:title", content: "Log in to Reelio" },
      { property: "og:description", content: "Access your downloads and account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return <AuthShell mode="login" />;
}

export function AuthShell({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden md:block overflow-hidden bg-warm-gradient text-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/20 blur-3xl animate-blob" />
        <div className="absolute bottom-0 -right-24 w-[28rem] h-[28rem] rounded-full bg-white/15 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="relative h-full flex flex-col p-12">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur">
              <Download size={18} strokeWidth={2.5} />
            </span>
            Reelio
          </Link>
          <div className="mt-auto">
            <h2 className="text-4xl font-extrabold leading-tight">Paste a link.<br />Get the video.</h2>
            <p className="mt-4 text-white/90 font-medium max-w-sm">Reelio is trusted by 200,000+ creators to save clean, watermark-free video from any social platform.</p>
            <div className="mt-8 flex -space-x-2">
              {[...Array(5)].map((_, i) => <div key={i} className="w-9 h-9 rounded-full ring-2 ring-white/60 bg-white/30" />)}
              <div className="ml-3 flex items-center text-sm font-semibold">+200k creators</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-[#FFFBF7]">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden flex items-center gap-2 font-extrabold text-xl mb-8">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-warm-gradient text-white"><Download size={18} strokeWidth={2.5} /></span>
            Reelio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {isLogin ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-2 text-black/60 font-medium">
            {isLogin ? "Log in to continue where you left off." : "Free forever — no credit card required."}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <SocialBtn label="Google" />
            <SocialBtn label="Apple" />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold text-black/40">
            <div className="h-px bg-black/10 flex-1" /> OR <div className="h-px bg-black/10 flex-1" />
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <Field label="Full name" placeholder="Jane Doe" icon={<Mail size={16} />} />
            )}
            <Field label="Email" placeholder="you@example.com" type="email" icon={<Mail size={16} />} />
            <Field label="Password" placeholder="••••••••" type="password" icon={<Lock size={16} />} />
            {isLogin && (
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 font-medium"><input type="checkbox" className="accent-[#FF7A00]" /> Remember me</label>
                <a href="#" className="font-semibold text-warm-gradient">Forgot?</a>
              </div>
            )}
            <button className="btn-warm btn-warm-hover w-full py-3.5">
              {isLogin ? "Log in" : "Create account"} <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-sm text-center font-medium text-black/70">
            {isLogin ? "New to Reelio? " : "Already have an account? "}
            <Link to={isLogin ? "/signup" : "/login"} className="font-bold text-warm-gradient">
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/10 bg-white hover:border-[#FF7A00] transition text-sm font-semibold">
      <span className="w-4 h-4 rounded-full bg-warm-gradient" /> Continue with {label}
    </button>
  );
}

function Field({ label, placeholder, type = "text", icon }: { label: string; placeholder: string; type?: string; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 focus-within:ring-warm transition">
        <span className="text-black/40">{icon}</span>
        <input type={type} placeholder={placeholder} className="flex-1 py-3 outline-none bg-transparent text-sm" />
      </div>
    </label>
  );
}
