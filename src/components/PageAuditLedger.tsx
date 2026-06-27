import React, { useState } from "react";
import { RoutingRequest } from "../types";
import { 
  Database, 
  Search, 
  Calendar, 
  ArrowUpDown, 
  ShieldAlert,
  Download 
} from "lucide-react";

interface PageAuditLedgerProps {
  requests: RoutingRequest[];
}

export function PageAuditLedger({ requests }: PageAuditLedgerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Filtering based on search query
  const filtered = requests.filter((req) => 
    (req.originalPrompt || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.targetModelRouted || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting order
  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  const formatUSD = (val: number) => {
    if (val === 0) return "$0.000000";
    if (val < 0.01) return `$${val.toFixed(6)}`;
    return `$${val.toFixed(4)}`;
  };

  const handleExportCSV = () => {
    if (sorted.length === 0) return;
    const headers = ["ID", "Timestamp", "Prompt", "Score", "Routed Model", "Tokens", "Latency(ms)", "Savings(USD)"];
    const rows = sorted.map((r) => {
      const dateStr = r.timestamp?.toDate ? r.timestamp.toDate().toISOString() : new Date(r.timestamp).toISOString();
      return [
        r.id,
        dateStr,
        `"${(r.originalPrompt || "").replace(/"/g, '""')}"`,
        r.semanticComplexityScore,
        r.targetModelRouted,
        r.estimatedTokens,
        r.executionLatencyMs,
        r.costSavedUSD
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aegis_telemetry_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="page-audit-ledger">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            Audit Ledger & Historical Telemetry Stream
          </h2>
          <p className="text-xs text-zinc-400">
            A chronological database ledger tracing all prompt proxy executions.
          </p>
        </div>

        {sorted.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-white/[0.06] hover:border-white/[0.1] text-xs font-mono text-zinc-300 rounded-lg transition-all cursor-pointer"
            id="ledger-export-button"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV Record</span>
          </button>
        )}
      </div>

      {/* Filter and Search Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#121214] border border-white/[0.06] rounded-xl p-3.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt payload contents or routed models..."
            className="w-full bg-zinc-950/60 text-xs text-zinc-200 placeholder-zinc-500 rounded-lg pl-9 pr-4 py-2.5 border border-white/[0.04] focus:outline-none focus:border-indigo-500/50 transition-colors"
            id="ledger-search-input"
          />
        </div>

        <button
          onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-white/[0.04] rounded-lg text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
          id="ledger-sort-toggle"
        >
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>Date Order: {sortOrder === "desc" ? "Most Recent" : "Oldest First"}</span>
          <ArrowUpDown className="w-3 h-3 text-zinc-500 ml-1" />
        </button>
      </div>

      {/* Main Ledger Sheet */}
      <div className="bg-[#121214] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl" id="ledger-sheet-panel">
        <div className="overflow-x-auto">
          {sorted.length === 0 ? (
            <div className="p-16 text-center" id="ledger-empty-state">
              <ShieldAlert className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 font-sans font-medium">No records found matching your query criteria.</p>
              <p className="text-xs text-zinc-600 font-mono mt-1">Execute prompts on Page 2 to compile telemetry.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-auto" id="audit-ledger-table">
              <thead>
                <tr className="bg-zinc-950 text-[10px] uppercase font-mono tracking-wider text-zinc-500 border-b border-white/[0.06]">
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4 w-1/3">Raw Prompt Input</th>
                  <th className="px-5 py-4 text-center">Complexity</th>
                  <th className="px-5 py-4">Target Routed</th>
                  <th className="px-5 py-4 text-right">Tokens</th>
                  <th className="px-5 py-4 text-right">Latency</th>
                  <th className="px-5 py-4 text-right text-emerald-400">USD Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sorted.map((req) => {
                  const dateObject = req.timestamp?.toDate ? req.timestamp.toDate() : new Date(req.timestamp);
                  const dateStr = dateObject.toLocaleDateString([], { month: "short", day: "numeric" }) + " " +
                                  dateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

                  return (
                    <tr 
                      key={req.id} 
                      className="hover:bg-zinc-800/30 transition-all duration-150 text-xs text-zinc-300"
                    >
                      <td className="px-5 py-4 font-mono text-zinc-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-5 py-4 max-w-sm font-medium text-zinc-200" title={req.originalPrompt}>
                        <p className="line-clamp-2 break-all whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                          {req.originalPrompt}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {(() => {
                            const sc = req.semanticComplexityScore;
                            let colorClasses = "";
                            if (sc <= 20) colorClasses = "bg-sky-500/10 text-[#38bdf8] border border-sky-500/20";
                            else if (sc <= 50) colorClasses = "bg-emerald-500/10 text-[#10b981] border border-emerald-500/20";
                            else if (sc <= 80) colorClasses = "bg-orange-500/10 text-[#f97316] border border-orange-500/20";
                            else colorClasses = "bg-purple-500/10 text-[#c084fc] border border-purple-500/20";
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${colorClasses}`}>
                                {sc}
                              </span>
                            );
                          })()}
                          
                          {/* Miniature visual numerical meter */}
                          <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full ${
                                req.semanticComplexityScore <= 20 ? 'bg-sky-400' :
                                req.semanticComplexityScore <= 50 ? 'bg-emerald-400' :
                                req.semanticComplexityScore <= 80 ? 'bg-orange-400' : 'bg-purple-400'
                              }`}
                              style={{ width: `${req.semanticComplexityScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {(() => {
                          const model = req.targetModelRouted || "";
                          if (model === "DeepSeek V4 Flash") {
                            return (
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded border text-[#38bdf8] bg-sky-500/10 border-sky-500/20">
                                DeepSeek V4 Flash
                              </span>
                            );
                          } else if (model === "OpenAI GPT-5.4-mini") {
                            return (
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded border text-[#10b981] bg-emerald-500/10 border-emerald-500/20">
                                OpenAI GPT-5.4-mini
                              </span>
                            );
                          } else if (model === "Anthropic Claude 4.5 Sonnet") {
                            return (
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded border text-[#f97316] bg-orange-500/10 border-orange-500/20">
                                Anthropic Claude 4.5 Sonnet
                              </span>
                            );
                          } else if (model === "OpenAI Deep-Reasoning") {
                            return (
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded border text-[#c084fc] bg-purple-500/10 border-purple-500/20">
                                OpenAI Deep-Reasoning
                              </span>
                            );
                          } else {
                            // Standard fallback compatibility
                            return (
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                                {model}
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-zinc-400">
                        {req.estimatedTokens.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-zinc-400">
                        {req.executionLatencyMs}ms
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-emerald-400">
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
