import React from "react";
import { User } from "firebase/auth";
import { 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  Database, 
  Sliders, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  user: User;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onLogout: () => void;
  threshold: number;
}

export function Sidebar({ user, currentPage, setCurrentPage, onLogout, threshold }: SidebarProps) {
  const tabs = [
    { id: 1, label: "Security Gate", desc: "Auth Compliance Profile", icon: ShieldCheck, accent: "text-emerald-400" },
    { id: 2, label: "Execution Gate", desc: "Interactive Dev Workspace", icon: Cpu, accent: "text-indigo-400" },
    { id: 3, label: "Analytics Core", desc: "Performance Bento Matrix", icon: TrendingUp, accent: "text-indigo-400" },
    { id: 4, label: "Audit Ledger", desc: "Historic Logs Stream", icon: Database, accent: "text-amber-400" },
    { id: 5, label: "Threshold Config", desc: "System Settings Panel", icon: Sliders, accent: "text-purple-400" },
  ];

  return (
    <aside className="w-64 h-screen bg-[#121214] border-r border-white/[0.06] flex flex-col justify-between p-4 shrink-0 font-sans select-none" id="aegis-sidebar">
      {/* Branding Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">Aegis Engine</h1>
            <span className="text-[9px] font-mono text-zinc-500 tracking-wider uppercase">v1.0.4 • ACTIVE</span>
          </div>
        </div>

        {/* Proxy Indicator */}
        <div className="px-3 py-2 bg-zinc-950 rounded-lg border border-white/[0.04] text-[10px] font-mono text-zinc-500">
          <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">Engine Endpoint</span>
          <span className="text-indigo-400 font-medium truncate block">/api/v1/route-prompt</span>
        </div>

        {/* Tab Item Links */}
        <nav className="space-y-1 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left group ${
                  isActive 
                    ? "bg-white/[0.04] text-white border border-white/[0.06] shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]"
                }`}
                id={`sidebar-tab-${tab.id}`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? tab.accent : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block leading-none">{tab.label}</span>
                  <span className="text-[9px] text-zinc-500 block truncate mt-0.5">{tab.desc}</span>
                </div>
                {tab.id === 5 && (
                  <span className="ml-auto text-[9px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700/60 px-1 py-0.2 rounded">
                    {threshold}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Developer Authenticated Session Footer */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 bg-zinc-950/60 rounded-xl border border-white/[0.02]">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || "User"} 
              className="w-7 h-7 rounded-full border border-white/[0.1] shrink-0" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-bold text-indigo-400 uppercase shrink-0">
              {user.email?.charAt(0) || "D"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold leading-none tracking-wider">Developer Active</span>
            <span className="text-xs text-zinc-300 font-medium truncate block mt-0.5" title={user.displayName || user.email || ""}>
              {user.displayName || user.email}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-medium text-xs rounded-xl transition-all cursor-pointer"
          id="sidebar-sign-out-btn"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
}
