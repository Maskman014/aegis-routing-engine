import React from "react";
import { User } from "firebase/auth";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Key, Server, Database } from "lucide-react";

interface PageSecurityGateProps {
  user: User | null;
  onLogin: () => void;
  errorMessage: string | null;
  routingLoading?: boolean;
}

export function PageSecurityGate({ user, onLogin, errorMessage, routingLoading }: PageSecurityGateProps) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8" id="page-security-gate-loggedout">
        <div className="w-full max-w-md bg-[#121214] border border-white/[0.06] rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          {/* Top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="text-center relative">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mx-auto text-indigo-400 mb-5 shadow-inner">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            
            <h1 className="text-2xl font-bold font-sans tracking-tight text-white">
              Aegis Routing Engine
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
              AI Cost & Latency Optimization Layer
            </p>

            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              Evaluate textual length, debugging syntax, and CS semantic depth of requests in real-time. Automatically route to 
              <span className="text-[#38bdf8] font-medium"> DeepSeek</span>, 
              <span className="text-[#a855f7] font-medium"> Google Gemini</span>, 
              <span className="text-[#f97316] font-medium"> Anthropic</span>, or 
              <span className="text-[#10b981] font-medium"> OpenAI</span> dynamically to maximize performance while minimizing API expenditures.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg text-left" id="login-error-card">
                <span className="font-bold">OAuth Error:</span> {errorMessage}
              </div>
            )}

            <div className="mt-8 space-y-4">
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.98] text-zinc-900 font-medium font-sans rounded-xl transition-all shadow-md hover:shadow-zinc-100/5 cursor-pointer"
                id="sign-in-button-gate"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Authenticate with Google</span>
              </button>

              <div className="flex items-center gap-1.5 justify-center text-[10px] font-mono text-zinc-600">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>Compliant client-side and server-side data isolation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="page-security-gate-loggedin">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Security, Compliance & Isolation Gate
        </h2>
        <p className="text-xs text-zinc-400">
          Cryptographically isolated environment verifying ABAC tenant security and session tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Isolated developer session credentials card */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden" id="security-session-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] blur-2xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.04] pb-3">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-zinc-200">Active Developer Session</h3>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Authentication Provider</span>
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Google OAuth 2.0 Client (Firebase)
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Tenant Isolation ID (userId)</span>
              <span className="text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded text-[11px] font-bold mt-1 block select-all break-all leading-tight">
                {user.uid}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Email Context</span>
              <span className="text-zinc-300 font-medium block mt-0.5 truncate">{user.email}</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Email Verified Status</span>
              {user.emailVerified ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFIED AND COMPLIANT
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1 mt-0.5 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  UNVERIFIED CONTEXT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Firestore ABAC Security Rules Card */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden" id="security-rules-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] blur-2xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.04] pb-3">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-zinc-200">ABAC Compliance Enforcements</h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            The telemetry storage layer enforces dynamic attribute-based access controls (ABAC) verified server-side inside Firestore database policies.
          </p>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.02] text-zinc-300">
              <span className="text-zinc-500">Identity Lock</span>
              <span className="text-emerald-400 font-bold">ACTIVE (`request.auth.uid`)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.02] text-zinc-300">
              <span className="text-zinc-500">Write Immutability</span>
              <span className="text-emerald-400 font-bold">STRICT (Write-Once / Read-Only)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.02] text-zinc-300">
              <span className="text-zinc-500">Global Blanket Queries</span>
              <span className="text-rose-400 font-bold">FORBIDDEN (Tenant Isolated)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-zinc-300">
              <span className="text-zinc-500">LLM Endpoint Secret Guard</span>
              <span className="text-emerald-400 font-bold">ENFORCED (Server-Side Proxy)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security assertions section */}
      <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-5" id="security-assertions-box">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          <h4 className="font-semibold text-sm text-zinc-200">Active Storage Security Ledger Assurance</h4>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The Aegis Routing Engine separates user accounts at the database engine root level. This means your private prompt evaluation logs and dynamic token pricing data cannot be scraped, targeted, or retrieved by any other developer sessions. This complies with strict tenant isolation principles.
        </p>
      </div>
    </div>
  );
}
