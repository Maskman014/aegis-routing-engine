import React from "react";
import { Sliders, HelpCircle, AlertTriangle, ShieldCheck, Zap, Layers } from "lucide-react";

interface PageThresholdConfiguratorProps {
  threshold: number;
  setThreshold: (val: number) => void;
}

export function PageThresholdConfigurator({ threshold, setThreshold }: PageThresholdConfiguratorProps) {
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setThreshold(Math.max(1, Math.min(100, value)));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (e.target.value === "") {
      return; // allow blank while typing
    }
    if (!isNaN(value)) {
      setThreshold(Math.max(1, Math.min(100, value)));
    }
  };

  return (
    <div className="space-y-6" id="page-threshold-configurator">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          Threshold Configurator & Administration Panel
        </h2>
        <p className="text-xs text-zinc-400">
          Dynamically alter model evaluation partitions to re-balance cloud expenditures against reasoning depth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main interactive adjuster panel */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-6 md:col-span-2 space-y-6 shadow-xl" id="configurator-adjuster-panel">
          <div className="border-b border-white/[0.04] pb-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-zinc-200">Baseline Complexity Partition</h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-white/[0.04] px-2 py-0.5 rounded">
              Default: 40 pts
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            The routing threshold acts as a baseline complexity partition for inbound developer prompts. Prompts are automatically matched and distributed across four dedicated provider tiers (DeepSeek, Google Gemini, Anthropic Claude, OpenAI Pro) based on this threshold.
          </p>

          {/* Slider and Input row */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 bg-zinc-950 p-4 rounded-xl border border-white/[0.04]">
              <div className="flex-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-1">
                  Complexity Score Threshold
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={threshold}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  id="threshold-slider-control"
                />
              </div>

              <div className="w-20 shrink-0">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block text-center mb-1">
                  Value (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={threshold || ""}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 text-sm font-mono font-bold text-center text-zinc-100 rounded-lg py-2 border border-white/[0.08] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  id="threshold-numeric-input"
                />
              </div>
            </div>
          </div>

          {/* Interactive Routing partition map demo */}
          <div className="bg-zinc-950/40 rounded-xl p-5 border border-white/[0.02] space-y-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-widest block">
              Active Evaluation Partition Mapping
            </span>

            <div className="flex items-center gap-1 w-full h-8 bg-zinc-900 rounded-lg overflow-hidden border border-white/[0.04] p-1 text-[9px] font-mono">
              <div 
                className="h-full bg-sky-500/10 text-[#38bdf8] border border-sky-500/25 rounded flex items-center justify-center font-bold transition-all duration-300"
                style={{ width: `${Math.max(12, Math.round(threshold * 0.5))}%` }}
              >
                DeepSeek (0-{Math.round(threshold * 0.5)})
              </div>
              <div 
                className="h-full bg-purple-500/10 text-[#a855f7] border border-purple-500/25 rounded flex items-center justify-center font-bold transition-all duration-300"
                style={{ width: `${Math.max(12, Math.round(threshold * 1.25) - Math.round(threshold * 0.5))}%` }}
              >
                Gemini
              </div>
              <div 
                className="h-full bg-orange-500/10 text-[#f97316] border border-orange-500/25 rounded flex items-center justify-center font-bold transition-all duration-300"
                style={{ width: `${Math.max(12, Math.round(threshold * 1.25 + (100 - threshold * 1.25) * 0.6) - Math.round(threshold * 1.25))}%` }}
              >
                Anthropic
              </div>
              <div 
                className="h-full bg-emerald-500/10 text-[#10b981] border border-emerald-500/25 rounded flex items-center justify-center font-bold transition-all duration-300 flex-1"
              >
                OpenAI Pro
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal">
              Increasing this threshold routes more prompts to highly optimized lightweight tiers, yielding massive comparative financial savings. Decreasing it routes more prompts to deep-reasoning models for complex tasks.
            </p>
          </div>
        </div>

        {/* Informational Guidance Sidebar Card */}
        <div className="space-y-6" id="configurator-guidance">
          
          <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2 text-indigo-400">
              <HelpCircle className="w-4 h-4" />
              <h4 className="font-semibold text-xs uppercase tracking-wider font-mono">Dynamic Settings</h4>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-400 leading-relaxed">
              <div className="flex gap-2.5">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-zinc-200">Fast Latency (1-39):</strong> Ideal for simple conversational templates, summaries, and light structural text.
                </p>
              </div>

              <div className="flex gap-2.5">
                <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-zinc-200">Deep Reasoning (&ge;40):</strong> Required for intricate algorithms, code debugging, and syntax mapping.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-xl p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-zinc-200 font-sans">Deployment Guard</h5>
              <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                Changes to this active threshold are immediately dispatched across memory channels to all routing execution threads in this browser session.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
