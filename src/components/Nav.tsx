import { Link } from "@tanstack/react-router";
import { Download, Menu, X } from "lucide-react";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/download", label: "Downloader" },
    { to: "/pricing", label: "Pricing" },
    { to: "/faq", label: "FAQ" },
    { to: "/about", label: "About" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[#FFFBF7]/80 border-b border-black/5">
      <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-warm-gradient text-white shadow-[0_8px_20px_-6px_rgba(255,122,0,0.55)]">
            <Download size={18} strokeWidth={2.5} />
          </span>
          <span>Reelio</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-black/80 hover:text-black transition"
              activeProps={{ className: "text-black font-semibold" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl hover:bg-black/5 transition">
            Log in
          </Link>
          <Link to="/signup" className="btn-warm btn-warm-hover text-sm">
            Get Started
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-black/5 bg-white px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block font-medium py-2" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 text-center py-2 rounded-xl border font-semibold">Log in</Link>
            <Link to="/signup" className="flex-1 btn-warm btn-warm-hover text-sm">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
