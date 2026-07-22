import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, LayoutDashboard, History, CreditCard, Settings, LogOut, Search, MoreHorizontal, Play } from "lucide-react";
import { platforms } from "../components/platforms";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Reelio" },
      { name: "description", content: "Your Reelio downloads, usage, and settings." },
      { property: "og:title", content: "Reelio Dashboard" },
      { property: "og:description", content: "Manage downloads and your account." },
    ],
  }),
  component: Dashboard,
});

const history = [
  { title: "Neon Tokyo drive · 4K cut", platform: "YouTube", size: "128 MB", quality: "1080p", when: "2h ago", status: "done" },
  { title: "Coffee shop ambient loop", platform: "TikTok", size: "9.4 MB", quality: "720p", when: "5h ago", status: "done" },
  { title: "Interview: designer's toolkit", platform: "Vimeo", size: "312 MB", quality: "1080p", when: "Yesterday", status: "done" },
  { title: "Snowboarding runs — winter '26", platform: "Instagram", size: "22.1 MB", quality: "1080p", when: "Yesterday", status: "done" },
  { title: "Album drop teaser", platform: "X / Twitter", size: "6.2 MB", quality: "720p", when: "2d ago", status: "failed" },
  { title: "Studio tour — full walkthrough", platform: "YouTube", size: "421 MB", quality: "1080p", when: "3d ago", status: "done" },
];

function Dashboard() {
  const [tab, setTab] = useState<"overview" | "settings">("overview");

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex">
      <Sidebar tab={tab} setTab={setTab} />
      <main className="flex-1 min-w-0">
        <TopBar />
        <div className="p-6 md:p-10">
          {tab === "overview" ? <Overview /> : <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

function Sidebar({ tab, setTab }: { tab: string; setTab: (t: "overview" | "settings") => void }) {
  const items = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "history", label: "History", icon: History },
    { key: "billing", label: "Billing", icon: CreditCard },
    { key: "settings", label: "Settings", icon: Settings },
  ] as const;
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-black/5 bg-white p-5 sticky top-0 h-screen">
      <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-warm-gradient text-white"><Download size={18} strokeWidth={2.5} /></span>
        Reelio
      </Link>
      <nav className="mt-8 space-y-1">
        {items.map((it) => {
          const active = tab === it.key || (it.key === "overview" && tab === "overview");
          const clickable = it.key === "overview" || it.key === "settings";
          return (
            <button
              key={it.key}
              onClick={() => clickable && setTab(it.key as "overview" | "settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${active ? "bg-warm-gradient text-white shadow-[0_10px_25px_-12px_rgba(255,90,0,0.55)]" : "hover:bg-black/5"}`}
            >
              <it.icon size={16} /> {it.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto card-warm p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-black/50">Plan</p>
        <p className="mt-1 font-bold">Pro · Annual</p>
        <Link to="/pricing" className="mt-3 block text-sm font-semibold text-warm-gradient">Manage plan →</Link>
      </div>
      <button className="mt-3 flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-black/5">
        <LogOut size={16} /> Log out
      </button>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="h-16 border-b border-black/5 bg-white/60 backdrop-blur px-6 md:px-10 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search size={16} className="text-black/40" />
        <input placeholder="Search your downloads…" className="flex-1 py-2 outline-none bg-transparent text-sm" />
      </div>
      <div className="flex items-center gap-3">
        <Link to="/download" className="btn-warm btn-warm-hover text-sm px-4 py-2"><Download size={14} /> New download</Link>
        <div className="w-9 h-9 rounded-full bg-warm-gradient" />
      </div>
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Welcome back, Jane 👋</h1>
        <p className="mt-1 text-black/60 font-medium">Here's what's happening with your downloads.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <UsageRing used={642} total={1000} label="Downloads this month" />
        <StatCard label="Total saved" value="82.4 GB" trend="+12% vs last month" />
        <StatCard label="Batch queue" value="3 running" trend="Est. 2m 15s remaining" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent downloads</h2>
          <button className="text-sm font-semibold text-warm-gradient">View all →</button>
        </div>
        <div className="mt-4 card-warm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FFF6EF] text-left">
                <th className="p-4 font-bold">Video</th>
                <th className="p-4 font-bold hidden md:table-cell">Platform</th>
                <th className="p-4 font-bold hidden md:table-cell">Quality</th>
                <th className="p-4 font-bold hidden lg:table-cell">Size</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => {
                const p = platforms.find((x) => x.name === h.platform);
                const Icon = p?.Icon;
                return (
                  <tr key={i} className="border-t border-black/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-warm-gradient text-white grid place-items-center shrink-0">
                          <Play size={16} fill="white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{h.title}</p>
                          <p className="text-xs text-black/50 font-medium">{h.when}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        {Icon && <Icon size={14} />} {h.platform}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell font-medium">{h.quality}</td>
                    <td className="p-4 hidden lg:table-cell font-medium">{h.size}</td>
                    <td className="p-4">
                      {h.status === "done" ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-warm-gradient text-white">Done</span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-black/5 text-black/70">Failed</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-black/10 hover:bg-warm-gradient hover:text-white hover:border-transparent transition">
                        <Download size={12} className="inline mr-1" /> Re-download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsageRing({ used, total, label }: { used: number; total: number; label: string }) {
  const pct = used / total;
  const size = 120, stroke = 12, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="card-warm p-6 flex items-center gap-5">
      <svg width={size} height={size} className="shrink-0">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="50%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FFC700" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#FFF6EF" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" textAnchor="middle" dy=".35em" className="font-extrabold" fontSize="22" fill="#0A0A0A">
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-black/50">{label}</p>
        <p className="mt-1 text-2xl font-extrabold">{used.toLocaleString()} <span className="text-black/40 text-base font-semibold">/ {total.toLocaleString()}</span></p>
        <p className="mt-1 text-xs font-semibold text-black/60">Resets in 12 days</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="card-warm p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-black/50">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
      <p className="mt-2 text-xs font-semibold text-warm-gradient">{trend}</p>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account settings</h1>
        <p className="mt-1 text-black/60 font-medium">Manage your profile and preferences.</p>
      </div>
      <div className="card-warm p-6 space-y-4">
        <h3 className="font-bold">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-warm-gradient" />
          <button className="text-sm font-semibold px-4 py-2 rounded-xl border border-black/10">Change photo</button>
        </div>
        <SettingField label="Full name" value="Jane Doe" />
        <SettingField label="Email" value="jane@studio.io" />
      </div>
      <div className="card-warm p-6 space-y-4">
        <h3 className="font-bold">Preferences</h3>
        <SettingToggle label="Save downloads to history" defaultChecked />
        <SettingToggle label="Email me when a batch finishes" defaultChecked />
        <SettingToggle label="Beta features" />
      </div>
      <button className="btn-warm btn-warm-hover px-6 py-3">Save changes</button>
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input defaultValue={value} className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 outline-none focus:ring-warm" />
    </label>
  );
}

function SettingToggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold">{label}</span>
      <button onClick={() => setOn(!on)} className={`w-11 h-6 rounded-full p-0.5 transition ${on ? "bg-warm-gradient" : "bg-black/15"}`}>
        <span className={`block w-5 h-5 bg-white rounded-full shadow transition ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
