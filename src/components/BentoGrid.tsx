import { RoutingRequest } from "../types";
import { TrendingDown, Zap, ShieldAlert, Layers } from "lucide-react";

interface BentoGridProps {
  requests: RoutingRequest[];
}

export function BentoGrid({ requests }: BentoGridProps) {
  // Aggregate stats
  const totalRequests = requests.length;
  
  const totalCostSaved = requests.reduce((sum, req) => sum + req.costSavedUSD, 0);
  
  const averageLatency = totalRequests > 0 
    ? Math.round(requests.reduce((sum, req) => sum + req.executionLatencyMs, 0) / totalRequests)
    : 0;

  const deepseekCount = requests.filter(req => req.targetModelRouted === "DeepSeek V4 Flash").length;
  const geminiCount = requests.filter(req => req.targetModelRouted === "Google Gemini" || req.targetModelRouted === "Google Gemini 3.5 Flash").length;
  const anthropicCount = requests.filter(req => req.targetModelRouted === "Anthropic Claude" || req.targetModelRouted === "Anthropic Claude 4.5 Sonnet").length;
  const openaiProCount = requests.filter(req => req.targetModelRouted === "OpenAI" || req.targetModelRouted === "OpenAI Deep-Reasoning").length;

  const deepseekPercentage = totalRequests > 0 ? Math.round((deepseekCount / totalRequests) * 100) : 0;
  const geminiPercentage = totalRequests > 0 ? Math.round((geminiCount / totalRequests) * 100) : 0;
  const anthropicPercentage = totalRequests > 0 ? Math.round((anthropicCount / totalRequests) * 100) : 0;
  const openaiProPercentage = totalRequests > 0 ? Math.round((openaiProCount / totalRequests) * 100) : 0;

  // Formatting currency safely
  const formatUSD = (val: number) => {
    if (val === 0) return "$0.000000";
    if (val < 0.01) return `$${val.toFixed(6)}`;
    return `$${val.toFixed(4)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="aegis-bento-grid">
      
      {/* Metric Module 1: Cumulative USD Savings */}
      <div 
        className="col-span-1 md:col-span-2 bg-[#121214] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg"
        id="metric-usd-savings"
      >
        {/* Glow backdrop effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">Aegis Cumulative Savings</p>
            <h3 className="text-3xl font-sans font-bold text-[#10b981] mt-2 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              {formatUSD(totalCostSaved)}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              <span>Reduced developer API billing overhead</span>
            </p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-zinc-500">Gateway pricing:</span>
            <p className="text-zinc-300 font-medium mt-0.5">$0.00005 - $0.015 / 1k</p>
          </div>
          <div>
            <span className="text-zinc-500">Unoptimized Flat Rate:</span>
            <p className="text-red-400 font-medium mt-0.5">$0.015000 / 1k</p>
          </div>
        </div>
      </div>

      {/* Metric Module 2: Average System Latency */}
      <div 
        className="col-span-1 bg-[#121214] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg"
        id="metric-average-latency"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">Avg Response Latency</p>
            <h3 className="text-3xl font-sans font-bold text-indigo-400 mt-2 tracking-tight">
              {averageLatency || "0"} <span className="text-xs text-zinc-500 font-normal">ms</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Optimized transaction turnaround
            </p>
          </div>
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.04] text-[10px] font-mono flex items-center justify-between text-zinc-500">
          <span>Active Layer routing threshold:</span>
          <span className="text-zinc-300 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50">40 pts</span>
        </div>
      </div>

      {/* Traffic Split Ratio Meter */}
      <div 
        className="col-span-1 bg-[#121214] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between shadow-lg"
        id="metric-traffic-split"
      >
        <div>
          <div className="flex justify-between items-center">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">Traffic Allocation</p>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              Active Routing
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-1.5 mt-3 text-[9px] font-mono">
            <div className="text-left">
              <span className="text-sky-400 block font-bold">DS ({deepseekPercentage}%)</span>
              <span className="text-[#a855f7] block font-bold">GEM ({geminiPercentage}%)</span>
            </div>
            <div className="text-right">
              <span className="text-orange-400 block font-bold">ANT ({anthropicPercentage}%)</span>
              <span className="text-emerald-400 block font-bold">OAI ({openaiProPercentage}%)</span>
            </div>
          </div>

          {/* 4-Segmented dynamic progress bar */}
          <div className="w-full h-2.5 bg-zinc-900 border border-white/[0.04] rounded-full mt-2.5 overflow-hidden flex">
            {totalRequests === 0 ? (
              <div className="w-full h-full bg-zinc-800" />
            ) : (
              <>
                <div 
                  className="h-full bg-gradient-to-r from-sky-600 to-[#38bdf8] transition-all duration-500" 
                  style={{ width: `${deepseekPercentage}%` }}
                  title={`${deepseekPercentage}% DeepSeek`}
                />
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-[#a855f7] transition-all duration-500" 
                  style={{ width: `${geminiPercentage}%` }}
                  title={`${geminiPercentage}% Google Gemini`}
                />
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-[#f97316] transition-all duration-500" 
                  style={{ width: `${anthropicPercentage}%` }}
                  title={`${anthropicPercentage}% Anthropic`}
                />
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-[#10b981] transition-all duration-500" 
                  style={{ width: `${openaiProPercentage}%` }}
                  title={`${openaiProPercentage}% OpenAI`}
                />
              </>
            )}
          </div>
        </div>

        <div className="text-[9px] font-mono text-zinc-500 mt-2 flex justify-between">
          <span>{deepseekCount + geminiCount} fast</span>
          <span>{anthropicCount + openaiProCount} deep</span>
        </div>
      </div>

      {/* Historical Analytics Ledger */}
      <div 
        className="col-span-1 md:col-span-2 lg:col-span-4 bg-[#121214] border border-white/[0.06] rounded-xl overflow-hidden shadow-lg animate-fade-in"
        id="analytics-ledger-panel"
      >
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h4 className="font-sans font-semibold text-sm text-zinc-200">Historical Optimization Ledger</h4>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Total Logs: {totalRequests}
          </span>
        </div>

        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="p-8 text-center" id="empty-ledger-state">
              <ShieldAlert className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono">No evaluations recorded in telemetry DB yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" id="ledger-table">
              <thead>
                <tr className="bg-zinc-950 text-[10px] uppercase font-mono tracking-wider text-zinc-500 border-b border-white/[0.06]">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Prompt Excerpt</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3">Routed Model</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                  <th className="px-4 py-3 text-right">Latency</th>
                  <th className="px-4 py-3 text-right text-emerald-400">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {requests.map((req) => {
                  const dateStr = req.timestamp?.toDate
                    ? req.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr key={req.id} className="hover:bg-white/[0.01] transition-colors text-xs text-zinc-300">
                      <td className="px-4 py-3.5 font-mono text-zinc-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate font-medium text-zinc-200" title={req.originalPrompt}>
                        {req.originalPrompt}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">
                        {(() => {
                          const sc = req.semanticComplexityScore;
                          let colorClasses = "";
                          if (sc <= 20) colorClasses = "bg-sky-500/10 text-[#38bdf8] border border-sky-500/10";
                          else if (sc <= 50) colorClasses = "bg-emerald-500/10 text-[#10b981] border border-emerald-500/10";
                          else if (sc <= 80) colorClasses = "bg-orange-500/10 text-[#f97316] border border-orange-500/10";
                          else colorClasses = "bg-purple-500/10 text-[#c084fc] border border-purple-500/10";
                          return (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClasses}`}>
                              {sc}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {(() => {
                          const model = req.targetModelRouted || "";
                          if (model === "DeepSeek V4 Flash") {
                            return (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded border text-[#38bdf8] bg-sky-500/10 border-sky-500/20">
                                DeepSeek V4 Flash
                              </span>
                            );
                          } else if (model === "Google Gemini" || model === "Google Gemini 3.5 Flash") {
                            return (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded border text-[#a855f7] bg-purple-500/10 border-purple-500/20">
                                Google Gemini
                              </span>
                            );
                          } else if (model === "Anthropic Claude" || model === "Anthropic Claude 4.5 Sonnet") {
                            return (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded border text-[#f97316] bg-orange-500/10 border-orange-500/20">
                                Anthropic Claude
                              </span>
                            );
                          } else if (model === "OpenAI" || model === "OpenAI Deep-Reasoning") {
                            return (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded border text-[#10b981] bg-emerald-500/10 border-emerald-500/20">
                                OpenAI
                              </span>
                            );
                          } else {
                            return (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                                {model}
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-zinc-400">
                        {req.estimatedTokens}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-zinc-400">
                        {req.executionLatencyMs}ms
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                        {req.costSavedUSD > 0 ? formatUSD(req.costSavedUSD) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
