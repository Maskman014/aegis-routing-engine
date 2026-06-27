import { useEffect, useRef } from "react";
import { TerminalLogEntry } from "../types";

export function TerminalLogs({ logs }: { logs: TerminalLogEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full" id="aegis-terminal-panel">
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-b border-zinc-800/80 text-[10px] uppercase tracking-wider font-mono text-zinc-500 rounded-t">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
          <span>Simulation Terminal Logs</span>
        </div>
        <span>stdout_stream.log</span>
      </div>
      <div
        ref={containerRef}
        className="bg-black/90 font-mono text-[11px] text-zinc-400 p-3 h-36 overflow-y-auto rounded-b border border-zinc-800/80 scrollbar-thin scrollbar-thumb-zinc-800"
        id="aegis-terminal-body"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-600 text-center py-10 italic select-none">
            &gt; Engine standby. Input text and trigger evaluation...
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => {
              let prefix = "  ";
              let color = "text-zinc-400";
              if (log.type === "success") {
                prefix = "✓ ";
                color = "text-emerald-400";
              } else if (log.type === "warn") {
                prefix = "⚠ ";
                color = "text-amber-400";
              } else if (log.type === "error") {
                prefix = "✗ ";
                color = "text-rose-400";
              } else if (log.type === "routing") {
                prefix = "⚡ ";
                color = "text-indigo-400";
              }

              return (
                <div key={log.id} className="leading-relaxed hover:bg-zinc-900/50 px-1 rounded transition-colors">
                  <span className="text-zinc-600 select-none">[{log.timestamp}]</span>{" "}
                  <span className={color}>{prefix}{log.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
