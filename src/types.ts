export interface RoutingRequest {
  id?: string;
  userId: string;
  timestamp: any; // Firestore Timestamp
  originalPrompt: string;
  estimatedTokens: number;
  semanticComplexityScore: number;
  targetModelRouted: string; // Dynamic multi-vendor models
  executionLatencyMs: number;
  costSavedUSD: number;
  backupTriggered?: boolean;
}

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: "info" | "success" | "warn" | "error" | "routing";
}
