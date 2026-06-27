import React from "react";
import { RoutingRequest } from "../types";
import { 
  TrendingDown, 
  Zap, 
  Layers, 
  Scale, 
  LineChart, 
  Activity 
} from "lucide-react";

interface PageAnalyticsCoreProps {
  requests: RoutingRequest[];
  threshold: number;
}

export function PageAnalyticsCore({ requests, threshold }: PageAnalyticsCoreProps) {
  const totalRequests = requests.length;
  
  const totalCostSaved = requests.reduce((sum, req) => sum + req.costSavedUSD, 0);
  
  const averageLatency = totalRequests > 0 
    ? Math.round(requests.reduce((sum, req) => sum + req.executionLatencyMs, 0) / totalRequests)
    : 0;

  const averageComplexity = totalRequests > 0
    ? Math.round(requests.reduce((sum, req) => sum + req.semanticComplexityScore, 0) / totalRequests)
    : 0;

  const deepseekCount = requests.filter(req => req.targetModelRouted === "DeepSeek V4 Flash").length;
  const geminiCount = requests.filter(req => req.targetModelRouted === "Google Gemini" || req.targetModelRouted === "Google Gemini 3.5 Flash").length;
  const anthropicCount = requests.filter(req => req.targetModelRouted === "Anthropic Claude" || req.targetModelRouted === "Anthropic Claude 4.5 Sonnet").length;
  const openaiProCount = requests.filter(req => req.targetModelRouted === "OpenAI" || req.targetModelRouted === "OpenAI Deep-Reasoning").length;

  const deepseekPercentage = totalRequests > 0
    ? Math.round((deepseekCount / totalRequests) * 100)
    : 0;
  const geminiPercentage = totalRequests > 0
    ? Math.round((geminiCount / totalRequests) * 100)
    : 0;
  const anthropicPercentage = totalRequests > 0
    ? Math.round((anthropicCount / totalRequests) * 100)
    : 0;
  const openaiProPercentage = totalRequests > 0
    ? Math.round((openaiProCount / totalRequests) * 100)
    : 0;

  // Formatting currency safely
  const formatUSD = (val: number) => {
    if (val === 0) return "$0.000000";
    if (val < 0.01) return `$${val.toFixed(6)}`;
    return `$${val.toFixed(4)}`;
  };

  return (
    <div className="space-y-6" id="page-analytics-core">
      {/* Header section */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
          Analytics Core & Performance Bento Matrix
        </h2>
        <p className="text-xs text-zinc-400">
          Compute real-time mathematical distributions of developer queries, financial gains, and computational latency performance.
        </p>
      </div>

      {/* Main Bento Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Metric Module 1: Cumulative USD Savings */}
        <div 
          className="bg-[#121214] border border-white/[0.06] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl"
          id="metric-usd-savings-bento"
        >
          {/* Intense emerald glow backdrop */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Cumulative Delta Savings</span>
              <h3 className="text-4xl font-sans font-bold text-[#10b981] tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.15)] mt-1.5">
                {formatUSD(totalCostSaved)}
              </h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-2">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span>Reduced developer API billing overhead</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.04] grid grid-cols-2 gap-4 text-[11px] font-mono">
            <div>
              <span className="text-zinc-500">Routed Gateway Tiers:</span>
              <p className="text-zinc-300 font-medium mt-0.5">$0.00005 - $0.015 / 1k</p>
            </div>
            <div>
              <span className="text-zinc-500">Unoptimized flat-rate:</span>
              <p className="text-[#f87171] font-medium mt-0.5">$0.015000 / 1k tkn</p>
            </div>
          </div>
        </div>

        {/* Metric Module 2: System Average Optimization Latency */}
        <div 
          className="bg-[#121214] border border-white/[0.06] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl"
          id="metric-latency-bento"
        >
          {/* Ambient indigo glow backdrop */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Avg Optimization Latency</span>
              <h3 className="text-4xl font-sans font-bold text-indigo-400 tracking-tight mt-1.5">
                {averageLatency || "0"} <span className="text-sm text-zinc-500 font-normal">ms</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-2">
                Turnaround latency optimized dynamically
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shadow-lg">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.04] text-[11px] font-mono flex items-center justify-between text-zinc-500">
            <span>Routing Threshold Score:</span>
            <span className="text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50 font-bold">{threshold} pts</span>
          </div>
        </div>

        {/* Metric Module 3: Average Semantic Complexity */}
        <div 
          className="bg-[#121214] border border-white/[0.06] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl"
          id="metric-complexity-bento"
        >
          {/* Ambient purple glow backdrop */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Avg Query Complexity</span>
              <h3 className="text-4xl font-sans font-bold text-purple-400 tracking-tight mt-1.5">
                {averageComplexity || "0"}<span className="text-xs text-zinc-500 font-normal"> / 100</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-2">
                Overall computational prompt density
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shadow-lg">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.04] text-[11px] font-mono flex items-center justify-between text-zinc-500">
            <span>Evaluated Transactions:</span>
            <span className="text-zinc-300 font-bold">{totalRequests} logs</span>
          </div>
        </div>

      </div>

      {/* Traffic Split Ratio Card */}
      <div 
        className="bg-[#121214] border border-white/[0.06] rounded-xl p-6 relative overflow-hidden shadow-xl"
        id="metric-traffic-split-bento"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.04] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-indigo-400" />
            <h4 className="font-semibold text-sm text-zinc-200">Interactive Model Routing Split Distribution</h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 sm:mt-0 uppercase font-bold tracking-wider">
            Real-Time Allocation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Based on prompt evaluation scores, computational resources are automatically partitioned across four dynamic provider tiers to maximize efficiency and minimize execution costs.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  DeepSeek V4 Flash Allocated
                </span>
                <span className="text-[#38bdf8] font-bold">{deepseekCount} ({deepseekPercentage}%)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                  Google Gemini 3.5 Flash Allocated
                </span>
                <span className="text-[#a855f7] font-bold">{geminiCount} ({geminiPercentage}%)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                  Anthropic Claude 4.5 Sonnet Allocated
                </span>
                <span className="text-[#f97316] font-bold">{anthropicCount} ({anthropicPercentage}%)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  OpenAI Deep-Reasoning Allocated
                </span>
                <span className="text-[#10b981] font-bold">{openaiProCount} ({openaiProPercentage}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 rounded-xl p-5 border border-white/[0.04] flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3">
              <span className="text-[#38bdf8] font-bold text-left font-semibold">DeepSeek ({deepseekPercentage}%)</span>
              <span className="text-[#a855f7] font-bold text-right font-semibold">Google Gemini ({geminiPercentage}%)</span>
              <span className="text-[#f97316] font-bold text-left font-semibold">Anthropic ({anthropicPercentage}%)</span>
              <span className="text-[#10b981] font-bold text-right font-semibold">OpenAI ({openaiProPercentage}%)</span>
            </div>

            {/* Interactive progress track */}
            <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden flex relative border border-white/[0.06]">
              {totalRequests === 0 ? (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-600">
                  NO ACTIVE DATA ENUMERATED
                </div>
              ) : (
                <>
                  <div 
                    className="h-full bg-gradient-to-r from-sky-600 to-[#38bdf8] transition-all duration-700 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]" 
                    style={{ width: `${deepseekPercentage}%` }}
                    title={`${deepseekPercentage}% DeepSeek`}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-[#a855f7] transition-all duration-700 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]" 
                    style={{ width: `${geminiPercentage}%` }}
                    title={`${geminiPercentage}% Google Gemini`}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-[#f97316] transition-all duration-700 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]" 
                    style={{ width: `${anthropicPercentage}%` }}
                    title={`${anthropicPercentage}% Anthropic`}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-[#10b981] transition-all duration-700 shadow-[inset_2px_0_4px_rgba(0,0,0,0.3)]" 
                    style={{ width: `${openaiProPercentage}%` }}
                    title={`${openaiProPercentage}% OpenAI`}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono text-zinc-500 mt-3 border-t border-white/[0.02] pt-2">
              <div>
                <span className="text-[#38bdf8] block font-semibold">DeepSeek</span>
                <span>Score &le; {Math.round(threshold * 0.5)}</span>
              </div>
              <div>
                <span className="text-[#a855f7] block font-semibold">Google Gemini</span>
                <span>Score &le; {Math.round(threshold * 1.25)}</span>
              </div>
              <div>
                <span className="text-[#f97316] block font-semibold">Anthropic</span>
                <span>Score &le; {Math.round(threshold * 1.25 + (100 - threshold * 1.25) * 0.6)}</span>
              </div>
              <div>
                <span className="text-[#10b981] block font-semibold">OpenAI Pro</span>
                <span>Score &gt; {Math.round(threshold * 1.25 + (100 - threshold * 1.25) * 0.6)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
