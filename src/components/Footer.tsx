import { Link } from "@tanstack/react-router";
import { Download, Twitter, Instagram, Youtube, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-[#FFFBF7]">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-warm-gradient text-white">
              <Download size={18} strokeWidth={2.5} />
            </span>
            Reelio
          </Link>
          <p className="text-sm text-black/70 max-w-sm">
            The fastest way to save videos from any social platform. No watermarks. No login. Just paste and go.
          </p>
          <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-warm"
            />
            <button className="btn-warm btn-warm-hover text-sm">Subscribe</button>
          </form>
        </div>
        <div>
          <h4 className="font-bold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-black/70">
            <li><Link to="/download" className="hover:text-black">Downloader</Link></li>
            <li><Link to="/pricing" className="hover:text-black">Pricing</Link></li>
            <li><Link to="/dashboard" className="hover:text-black">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-black/70">
            <li><Link to="/about" className="hover:text-black">About</Link></li>
            <li><Link to="/faq" className="hover:text-black">FAQ</Link></li>
            <li><a href="#" className="hover:text-black">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Follow</h4>
          <div className="flex gap-3">
            {[Twitter, Instagram, Youtube, Github].map((I, i) => (
              <a key={i} href="#" className="w-9 h-9 grid place-items-center rounded-xl border border-black/10 hover:bg-warm-gradient hover:text-white hover:border-transparent transition">
                <I size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-black/60">
          <p>© 2026 Reelio. Crafted for creators.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
