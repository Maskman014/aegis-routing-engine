import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialize Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({ 
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Aegis: GoogleGenAI client initialized successfully.");
      } catch (err) {
        console.error("Aegis Error: Failed to initialize GoogleGenAI SDK:", err);
      }
    }
  }
  return aiClient;
}

// Algorithmic prompt complexity scorer
function evaluatePromptComplexity(prompt: string): {
  score: number;
  estimatedTokens: number;
  reasons: string[];
} {
  const text = prompt || "";
  const length = text.length;
  const estimatedTokens = Math.max(1, Math.ceil(length / 4));
  
  let score = 0;
  const reasons: string[] = [];

  // 1. Length-based evaluation (Max 25 points)
  const lengthPoints = Math.min(25, Math.floor(length / 80) * 2);
  if (lengthPoints > 0) {
    score += lengthPoints;
    reasons.push(`Payload volume metrics (+${lengthPoints} pts: ${length} chars)`);
  }

  // 2. Technical and Computer Science/Math Terminology (Max 35 points)
  const techKeywords = [
    { regex: /\b(algorithm|complexity|recursive|recursion|backtracking|memoization|dynamic programming|dp)\b/i, label: "Advanced algorithmic terminology" },
    { regex: /\b(graph|tree|bst|avl|node|vertex|adjacency|dijkstra|astar|dfs|bfs)\b/i, label: "Data structures & graph theory" },
    { regex: /\b(matrix|determinant|eigenvalue|vector|derivative|integral|equation|theorem|induction|algebra|calculus)\b/i, label: "Mathematical or numerical constructs" },
    { regex: /\b(big o|big-o|o\(n\)|space complexity|time complexity|np-complete|p vs np)\b/i, label: "Computational complexity class" },
    { regex: /\b(database|sql|nosql|query|join|index|transaction|acid|firestore|postgres)\b/i, label: "Data engine / persistence terminology" },
    { regex: /\b(concurrency|thread|async|mutex|semaphore|race condition|deadlock|coroutine)\b/i, label: "Concurrent runtime structures" }
  ];

  techKeywords.forEach((kw) => {
    const match = text.match(kw.regex);
    if (match) {
      score += 7;
      reasons.push(`Semantic match: ${kw.label} ("${match[0]}") (+7 pts)`);
    }
  });

  // 3. Programming syntax & structural code markers (Max 30 points)
  const codeSyntaxPatterns = [
    { regex: /[{};()\[\]]/, label: "Syntactic structure brackets ({}, [])" },
    { regex: /\b(function|class|interface|struct|impl|import|export|const|let|var|return|defer)\b/, label: "Code declaration reserved keywords" },
    { regex: /\b(def|lambda|elif|print|import numpy|sys\.argv)\b/, label: "Scripting markers (Python/Ruby style)" },
    { regex: /\b(public|private|protected|static|void|string|int|float|boolean|any|unknown)\b/, label: "Strong static type signifiers" },
    { regex: /(console\.log|sys\.out|printf|print\(|stdout|stderr)/, label: "Diagnostic logger statements" },
    { regex: /(=>|===|!==|&&|\|\||\+\+|--)/, label: "Logical and conditional operators" }
  ];

  codeSyntaxPatterns.forEach((pat) => {
    if (pat.regex.test(text)) {
      score += 6;
      reasons.push(`Code signature: ${pat.label} (+6 pts)`);
    }
  });

  // 4. Advanced or deeply nested patterns (Max 10 points)
  const structuralPatterns = [
    { regex: /\b(for|while|forEach|map|filter|reduce)\b/, label: "Iterative loops or functional array operators" },
    { regex: /\\n\s*(if|else|for|while|function|class)/, label: "Indented multi-line formatting" }
  ];

  structuralPatterns.forEach((pat) => {
    if (pat.regex.test(text)) {
      score += 5;
      reasons.push(`Structural flow: ${pat.label} (+5 pts)`);
    }
  });

  score = Math.min(100, score);
  
  if (text.trim().length > 0 && score < 10) {
    score = 12;
    reasons.push("Default minimal request baseline (+12 pts)");
  }

  return { score, estimatedTokens, reasons };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Local Proxy Prompt Router
  app.post("/api/v1/route-prompt", async (req, res) => {
    try {
      const { prompt, threshold } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "A valid 'prompt' string is required in the body." });
      }

      const evalMetrics = evaluatePromptComplexity(prompt);
      const score = evalMetrics.score;
      const estimatedTokens = evalMetrics.estimatedTokens;

      let targetModelRouted = "";
      let costPer1k = 0;
      let minLatency = 100;
      let maxLatency = 300;

      if (score <= 20) {
        targetModelRouted = "DeepSeek V4 Flash";
        costPer1k = 0.00005;
        minLatency = 90;
        maxLatency = 150;
      } else if (score <= 50) {
        targetModelRouted = "Google Gemini";
        costPer1k = 0.000075;
        minLatency = 120;
        maxLatency = 250;
      } else if (score <= 80) {
        targetModelRouted = "Anthropic Claude";
        costPer1k = 0.00300;
        minLatency = 750;
        maxLatency = 1100;
      } else {
        targetModelRouted = "OpenAI";
        costPer1k = 0.01500;
        minLatency = 1800;
        maxLatency = 3200;
      }

      let responseText = "";
      let isSimulated = true;
      let backupTriggered = false;
      const finalModelRouted = targetModelRouted;
      const finalCostPer1k = costPer1k;
      const finalMinLatency = minLatency;
      const finalMaxLatency = maxLatency;

      // Real execution attempt with valid SDK production string key identifiers
      try {
        if (targetModelRouted === "Google Gemini") {
          const ai = getAIClient();
          if (ai) {
            console.log(`[Aegis Gateway] Executing real Gemini request for ${targetModelRouted}`);
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash", 
              contents: prompt,
            });
            if (response && response.text) {
              responseText = response.text;
              isSimulated = false;
            }
          }
        }
      } catch (err: any) {
        console.warn(`[Aegis Router Warning] Selected route ${targetModelRouted} failed or unconfigured: ${err.message}`);
        backupTriggered = true;
      }

      // High-quality fallback simulation response generator
      if (!responseText) {
        if (finalModelRouted === "DeepSeek V4 Flash") {
          responseText = `[Aegis Gateway - DeepSeek V4 Flash Simulation Response]\n` +
                         `• Status: Success\n` +
                         `• Complexity Score: ${score}/100\n` +
                         `• Estimated Payload Tokens: ${estimatedTokens}\n\n` +
                         `This prompt was evaluated at low complexity and successfully routed to the ultra-fast DeepSeek Flash tier. The request was processed with near-zero latency optimization settings.`;
        } else if (finalModelRouted === "Google Gemini") {
          responseText = `[Aegis Gateway - Google Gemini Simulation Response]\nThis prompt was evaluated at low-to-medium complexity (${score}/100) and routed to the Google Gemini tier.\n\nResponse Summary:\nYour request has been processed successfully by Gemini 2.5 Flash. The multimodal-optimized routing delivered a rapid response at highly optimized cost efficiency.`;
        } else if (finalModelRouted === "Anthropic Claude") {
          responseText = `### [Aegis Gateway - Anthropic Claude Simulation Response]\nThis prompt was evaluated at medium-to-high complexity (${score}/100) and routed to the Anthropic Claude tier.\n\n#### Detailed Cognitive Walkthrough:\n1. **Syntactic analysis** matches key code signatures or specialized data constructs.\n2. **System resolved** to allocate Anthropic's Claude 4.5 Sonnet reasoning engine to balance nuance and complexity.\n3. **Recommended modular implementation pattern**:\n\`\`\`typescript\nexport interface GatewayConfig {\n  provider: "deepseek" | "gemini" | "anthropic" | "openai";\n  latencyLimitMs: number;\n}\n\`\`\`\nLet me know if you would like me to conduct a full mathematical or architectural breakdown!`;
        } else {
          responseText = `[Aegis Gateway - OpenAI Deep-Reasoning Simulation Response]\nThis prompt was evaluated at extreme complexity (${score}/100) and routed to the deep-reasoning OpenAI Pro tier.\n\nDeep System Verification & Logic Tree Resolution:\n- Evaluated heavy mathematical equations, deep technical keywords, or recursive programming syntax structures.\n- Engaged OpenAI's multi-step deep reasoning paradigm to execute thorough pre-computation search sweeps.\n- Final proof, dynamic recursion formulas, and cached data patterns verified. System state fully coherent.`;
        }
      }

      const executionLatencyMs = Math.floor(Math.random() * (finalMaxLatency - finalMinLatency + 1)) + finalMinLatency;

      const responseTokens = Math.max(20, Math.ceil(responseText.length / 4));
      const totalTokens = estimatedTokens + responseTokens;
      
      const baselineCost = (totalTokens * 0.015) / 1000;
      const actualCost = (totalTokens * finalCostPer1k) / 1000;
      const costSavedUSD = Math.max(0, baselineCost - actualCost);

      return res.json({
        success: true,
        originalPrompt: prompt,
        estimatedTokens,
        semanticComplexityScore: score,
        targetModelRouted: finalModelRouted,
        executionLatencyMs,
        costSavedUSD,
        responseText,
        isSimulated,
        backupTriggered,
        reasons: evalMetrics.reasons
      });

    } catch (error: any) {
      console.error("Aegis Backend Server Route Error:", error);
      return res.status(500).json({ error: error.message || "Internal server error." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Aegis Routing Engine" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aegis Engine Server] Running at http://0.0.0.0:${PORT} (ENV: ${process.env.NODE_ENV || "development"})`);
  });
}

startServer();
