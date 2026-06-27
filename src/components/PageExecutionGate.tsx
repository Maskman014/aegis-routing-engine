import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Cpu, 
  Terminal, 
  PlayCircle,
  Copy,
  CheckCircle2,
  Clock,
  History,
  AlertCircle
} from "lucide-react";
import { TerminalLogs } from "./TerminalLogs";
import { TerminalLogEntry, RoutingRequest } from "../types";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { motion, AnimatePresence } from "motion/react";

interface PageExecutionGateProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  routingLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  logs: TerminalLogEntry[];
  addLog: (text: string, type: "info" | "success" | "warn" | "error" | "routing") => void;
  threshold: number;
}

// Helpers for history trace visual mapping
function getModelBadgeStyle(model: string) {
  const norm = (model || "").toLowerCase();
  if (norm.includes("deepseek")) {
    return {
      label: "DeepSeek",
      classes: "text-[#38bdf8] bg-sky-500/10 border border-sky-500/20"
    };
  } else if (norm.includes("gemini")) {
    return {
      label: "Google Gemini",
      classes: "text-[#a855f7] bg-purple-500/10 border border-purple-500/20"
    };
  } else if (norm.includes("anthropic") || norm.includes("claude")) {
    return {
      label: "Anthropic",
      classes: "text-[#f97316] bg-orange-500/10 border border-orange-500/20"
    };
  } else if (norm.includes("openai")) {
    return {
      label: "OpenAI",
      classes: "text-[#10b981] bg-emerald-500/10 border border-emerald-500/20"
    };
  } else {
    return {
      label: model || "Routed Tier",
      classes: "text-zinc-400 bg-zinc-500/10 border border-zinc-500/20"
    };
  }
}

function getScoreBreakdown(promptStr: string, score: number) {
  const text = promptStr || "";
  const length = text.length;
  const lengthPoints = Math.min(25, Math.floor(length / 80) * 2);
  
  // Estimate tech keywords
  const techKeywords = ["algorithm", "complexity", "recursive", "recursion", "backtracking", "memoization", "dynamic programming", "dp", "graph", "tree", "node", "vertex", "dijkstra", "astar", "dfs", "bfs", "matrix", "vector", "equation", "theorem", "induction", "algebra", "calculus", "big o", "big-o", "o(n)", "space complexity", "time complexity", "np-complete", "database", "sql", "nosql", "query", "join", "index", "transaction", "concurrency", "thread", "async", "mutex", "semaphore", "deadlock"];
  const hasTech = techKeywords.some(kw => text.toLowerCase().includes(kw));
  const techPoints = hasTech ? Math.min(35, Math.floor((score - lengthPoints) * 0.5)) : 0;

  // Estimate code syntax
  const codeKeywords = ["function", "class", "interface", "struct", "impl", "import", "export", "const", "let", "var", "return", "defer", "public", "private", "protected", "static", "void", "string", "int", "float", "boolean", "any", "unknown"];
  const hasCode = codeKeywords.some(kw => text.toLowerCase().includes(kw));
  const syntaxPoints = hasCode ? Math.min(30, Math.floor((score - lengthPoints - techPoints) * 0.4)) : 0;

  const remainder = Math.max(0, score - lengthPoints - techPoints - syntaxPoints);

  const segments = [];
  if (lengthPoints > 0) segments.push(`Payload baseline: +${lengthPoints} pts`);
  if (techPoints > 0) segments.push(`Semantic match: +${techPoints} pts`);
  if (syntaxPoints > 0) segments.push(`Syntactic structure: +${syntaxPoints} pts`);
  if (remainder > 0 || segments.length === 0) {
    segments.push(`Input volume metrics: +${Math.max(4, remainder)} pts`);
  }

  return segments.join(" | ");
}

export function PageExecutionGate({
  prompt,
  setPrompt,
  routingLoading,
  onSubmit,
  logs,
  addLog,
  threshold,
}: PageExecutionGateProps) {
  const [showHistory, setShowHistory] = useState(true);
  const [historyRequests, setHistoryRequests] = useState<RoutingRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Use useEffect to securely retrieve the latest 5 requests descending for currently logged in profile
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setHistoryRequests([]);
        setLoadingHistory(false);
        return;
      }

      setLoadingHistory(true);
      const collectionName = "requests";
      
      // Standard query with orderBy timestamp descending
      const q = query(
        collection(db, collectionName),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      );

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const list: RoutingRequest[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              userId: data.userId,
              timestamp: data.timestamp || { toDate: () => new Date() },
              originalPrompt: data.originalPrompt,
              estimatedTokens: data.estimatedTokens,
              semanticComplexityScore: data.semanticComplexityScore,
              targetModelRouted: data.targetModelRouted,
              executionLatencyMs: data.executionLatencyMs,
              costSavedUSD: data.costSavedUSD,
            });
          });
          setHistoryRequests(list);
          setLoadingHistory(false);
        },
        (error) => {
          console.warn("Aegis Telemetry index sorting fallback activated:", error);
          // If Firestore is indexing or requires index configuration, fallback to normal query + memory sort
          const fallbackQuery = query(
            collection(db, collectionName),
            where("userId", "==", currentUser.uid),
            limit(10)
          );

          onSnapshot(
            fallbackQuery,
            (fallbackSnap) => {
              const fallbackList: RoutingRequest[] = [];
              fallbackSnap.forEach((docSnap) => {
                const data = docSnap.data();
                fallbackList.push({
                  id: docSnap.id,
                  userId: data.userId,
                  timestamp: data.timestamp || { toDate: () => new Date() },
                  originalPrompt: data.originalPrompt,
                  estimatedTokens: data.estimatedTokens,
                  semanticComplexityScore: data.semanticComplexityScore,
                  targetModelRouted: data.targetModelRouted,
                  executionLatencyMs: data.executionLatencyMs,
                  costSavedUSD: data.costSavedUSD,
                });
              });

              const sorted = fallbackList.sort((a, b) => {
                const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
                const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
                return timeB - timeA;
              }).slice(0, 5);

              setHistoryRequests(sorted);
              setLoadingHistory(false);
            },
            (fallbackErr) => {
              console.error("Historical trace loading error:", fallbackErr);
              setLoadingHistory(false);
              handleFirestoreError(fallbackErr, OperationType.LIST, collectionName);
            }
          );
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  // Local Scenario presets for fast evaluation
  const presets = [
    {
      title: "Flash: Greeting",
      prompt: "Hello! Please summarize my daily schedule and tell me a short joke about servers.",
      desc: "Fast, simple descriptions",
    },
    {
      title: "Flash: Refactor",
      prompt: "Rewrite this string utility in vanilla JS to be more readable:\nconst format = s => s.trim().toLowerCase();",
      desc: "Lightweight updates",
    },
    {
      title: "Pro: Deep Reasoning",
      prompt: "Define a secure, multi-threaded Dijkstra shortest path router in Rust. Ensure thread safety via crossbeam/parking_lot, write code with extensive documentation, and perform a detailed mathematical analysis of space complexity.",
      desc: "Heavy math & algorithms",
    },
    {
      title: "Pro: Recursion & DP",
      prompt: "Write a dynamic programming algorithm to solve the Knapsack problem with weights and values. Include state transition formulas, and explain how the memoized cache optimizes O(2^N) down to O(N*W).",
      desc: "Complex structures",
    }
  ];

  return (
    <div className="space-y-6" id="page-execution-gate">
      {/* Header section with Drawer Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Interactive Execution Gate & Workspace
          </h2>
          <p className="text-xs text-zinc-400">
            Compose textual queries and evaluate server-side complexity routing calculations under active thresholds.
          </p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-center gap-2 px-3 py-2 self-start sm:self-auto rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
          id="toggle-history-button"
        >
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span>{showHistory ? "Collapse History" : "Recall History Trace"}</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Playground entry & live Terminal output */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-5 flex flex-col gap-4" id="playground-prompt-bay">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-zinc-200">Interactive Prompt Bay</h3>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-white/[0.04] px-2 py-0.5 rounded">
                Active Threshold Score: <span className="text-indigo-400 font-bold">{threshold}</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
              <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 p-3 focus-within:border-indigo-500/50 transition-colors">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type or click a preset below to analyze & route your text prompt..."
                  className="w-full min-h-[160px] bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none font-mono leading-relaxed"
                  required
                  disabled={routingLoading}
                  id="prompt-textarea"
                />
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono">
                  <span>Characters: {prompt.length}</span>
                  <span>Approximated Tokens: {Math.max(0, Math.ceil(prompt.length / 4))}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={routingLoading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.985] disabled:opacity-40 disabled:hover:bg-zinc-100 disabled:active:scale-100 transition-all text-zinc-900 font-bold text-sm rounded-xl shadow-sm cursor-pointer"
                id="evaluate-button"
              >
                {routingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                    <span>Executing Smart Agent Routing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-zinc-900" />
                    <span>Execute Route & Analyze Prompt</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Scenario Preset Triggers */}
            <div className="mt-2">
              <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block mb-3.5 flex items-center gap-1.5 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
                <span>Developer Scenarios / Presets</span>
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="prompt-presets-container">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (!routingLoading) {
                        setPrompt(preset.prompt);
                        addLog(`Preset loaded: "${preset.title}"`, "info");
                      }
                    }}
                    disabled={routingLoading}
                    className="p-3 bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 rounded-xl text-left transition-all active:scale-[0.98] group cursor-pointer"
                    title={preset.prompt}
                  >
                    <span className="text-[11px] font-bold text-zinc-200 block group-hover:text-indigo-400 transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1 block truncate">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Terminal Log Pane directly underneath */}
          <div id="playground-terminal-section">
            <TerminalLogs logs={logs} />
          </div>
        </div>

        {/* Right Column: Sliding/Collapsible History Trace Drawer */}
        <AnimatePresence mode="popLayout">
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "100%" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full lg:w-80 shrink-0 lg:sticky lg:top-6"
              id="history-trace-drawer"
            >
              <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-4 h-full backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-semibold text-sm text-zinc-200">History Trace Drawer</h3>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 border border-white/[0.04] px-1.5 py-0.5 rounded font-bold">
                    Latest 5
                  </span>
                </div>

                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-[10px] font-mono text-zinc-500">Retrieving telemetry traces...</span>
                  </div>
                ) : historyRequests.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-lg">
                    <p className="text-xs font-mono text-zinc-500">No execution traces yet.</p>
                    <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">Submit prompts in the workspace to initiate real-time multi-vendor routing.</p>
                  </div>
                ) : (
                  <div className="space-y-3" id="history-cards-list">
                    {historyRequests.map((req) => {
                      const badge = getModelBadgeStyle(req.targetModelRouted);
                      const breakdown = getScoreBreakdown(req.originalPrompt, req.semanticComplexityScore);
                      
                      return (
                        <div 
                          key={req.id}
                          onClick={() => {
                            if (!routingLoading) {
                              setPrompt(req.originalPrompt);
                              addLog(`Recalled historical prompt string into workspace.`, "info");
                            }
                          }}
                          className={`group relative p-3 bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 rounded-xl transition-all duration-200 cursor-pointer flex flex-col gap-2 ${routingLoading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {/* Tooltip on hover */}
                          <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-300 w-64 shadow-2xl leading-relaxed text-center">
                            <p className="font-bold text-zinc-100 font-mono mb-1">Complexity metrics: {req.semanticComplexityScore}/100</p>
                            <p className="font-mono text-[9px] text-zinc-400">{breakdown}</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-950" />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${badge.classes}`}>
                              {badge.label}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded">
                              {req.executionLatencyMs}ms
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-400 line-clamp-2 font-mono bg-zinc-950/30 p-1.5 rounded border border-white/[0.01]">
                            {req.originalPrompt}
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/[0.02] pt-2">
                            <span className="text-zinc-500 font-medium">Savings Delta:</span>
                            <span className="text-[#10b981] font-bold">
                              {req.costSavedUSD > 0 ? `$${req.costSavedUSD.toFixed(6)}` : "$0.000000"}
                            </span>
                          </div>

                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] text-indigo-400 font-mono bg-indigo-950/80 border border-indigo-950 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                              Recall &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

