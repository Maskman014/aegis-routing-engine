import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from "./firebase";
import { Sidebar } from "./components/Sidebar";
import { PageSecurityGate } from "./components/PageSecurityGate";
import { PageExecutionGate } from "./components/PageExecutionGate";
import { PageAnalyticsCore } from "./components/PageAnalyticsCore";
import { PageAuditLedger } from "./components/PageAuditLedger";
import { PageThresholdConfigurator } from "./components/PageThresholdConfigurator";
import { RoutingRequest, TerminalLogEntry } from "./types";
import { Loader2, ShieldAlert } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [requests, setRequests] = useState<RoutingRequest[]>([]);
  const [prompt, setPrompt] = useState("");
  const [routingLoading, setRoutingLoading] = useState(false);
  const [logs, setLogs] = useState<TerminalLogEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Persistent baseline routing complexity threshold score state
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("aegis_complexity_threshold");
    return saved ? parseInt(saved, 10) : 40;
  });

  // Keep threshold persisted in localStorage
  useEffect(() => {
    localStorage.setItem("aegis_complexity_threshold", threshold.toString());
  }, [threshold]);

  // Dynamic Navigation state. Starts on Page 2 (Developer Workspace) when logged in,
  // or Page 1 if not authenticated.
  const [currentPage, setCurrentPage] = useState<number>(2);

  // Authentication observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        addLog(`Authenticated successfully as developer: ${currentUser.email}`, "success");
      } else {
        setRequests([]);
        setLogs([]);
        setCurrentPage(1); // redirect to Security Gate immediately when logged out
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time telemetry subscription bound strictly to authenticated user context
  useEffect(() => {
    if (!user) return;

    addLog("Establishing connection to Firestore 'requests' database collection...", "info");
    const collectionName = "requests";
    
    // We filter strictly by userId = authenticated user's unique ID to enforce absolute data isolation
    const q = query(
      collection(db, collectionName),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
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

        // Safe client-side sorting chronologically by timestamp (most recent first)
        const sorted = list.sort((a, b) => {
          const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
          const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
          return timeB - timeA;
        });

        setRequests(sorted);
        addLog(`Successfully synchronized ${sorted.length} chronological execution entries from Firestore.`, "info");
      },
      (error) => {
        addLog(`Telemetry DB synchronization failed: ${error.message}`, "error");
        handleFirestoreError(error, OperationType.LIST, collectionName);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time terminal logs tracking helper
  const addLog = (text: string, type: "info" | "success" | "warn" | "error" | "routing" = "info") => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        text,
        type,
      },
    ]);
  };

  // Google Authentication popup triggers
  const handleLogin = async () => {
    setErrorMessage(null);
    try {
      addLog("Initializing secure Google OAuth onboarding...", "info");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setCurrentPage(2); // Redirect to Playground upon successful sign-in
      }
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setErrorMessage(err.message || "Google Authentication rejected by client.");
      addLog(`OAuth validation failed: ${err.message}`, "error");
    }
  };

  // Sign out user session
  const handleLogout = async () => {
    try {
      addLog("Signing out active developer session...", "info");
      await signOut(auth);
      setCurrentPage(1); // Force redirection back to Security Gate landing page
    } catch (err: any) {
      addLog(`Sign out aborted: ${err.message}`, "error");
    }
  };

  // Intercept, evaluate and proxy route queries through Node.js server route
  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !user) return;

    setRoutingLoading(true);
    setErrorMessage(null);
    const evaluationPrompt = prompt;

    addLog(`Evaluating payload volume (length: ${evaluationPrompt.length} chars)`, "info");
    addLog(`Transmitting prompt to server API with threshold: ${threshold}`, "routing");

    try {
      const response = await fetch("/api/v1/route-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: evaluationPrompt,
          threshold: threshold 
        }),
      });

      if (!response.ok) {
        throw new Error(`Upstream server responded with status code ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        addLog(`Proxy evaluation resolved in ${result.executionLatencyMs}ms.`, "success");
        addLog(`Complexity rating: ${result.semanticComplexityScore}/100 | Target model: ${result.targetModelRouted}`, "routing");
        
        if (result.reasons && result.reasons.length > 0) {
          result.reasons.forEach((reason: string) => {
            addLog(`Analysis indicator: ${reason}`, "info");
          });
        }

        if (result.costSavedUSD > 0) {
          addLog(`Financial Delta Saved: $${result.costSavedUSD.toFixed(6)} USD against Pro base rate.`, "success");
        } else {
          addLog("Request compiled on Pro baseline. Full operational cost parameters applied.", "warn");
        }

        // Commit execution telemetry results to the isolated 'requests' collection in Firestore
        addLog("Saving final evaluation properties to Firestore 'requests'...", "info");
        
        const pathForWrite = "requests";
        try {
          const requestsRef = collection(db, pathForWrite);
          const newDocRef = doc(requestsRef);
          
          await setDoc(newDocRef, {
            userId: user.uid,
            timestamp: serverTimestamp(),
            originalPrompt: result.originalPrompt,
            estimatedTokens: result.estimatedTokens,
            semanticComplexityScore: result.semanticComplexityScore,
            targetModelRouted: result.targetModelRouted,
            executionLatencyMs: result.executionLatencyMs,
            costSavedUSD: result.costSavedUSD
          });

          addLog(`Telemetry securely committed inside doc: ${newDocRef.id}`, "success");
        } catch (dbErr) {
          addLog(`Firestore transactional write failed: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`, "error");
          handleFirestoreError(dbErr, OperationType.CREATE, pathForWrite);
        }

        // Output complete response lines
        addLog(`[Model Output Resolution Outputting]`, "success");
        const responseLines = result.responseText.split("\n");
        responseLines.forEach((line: string) => {
          if (line.trim()) {
            addLog(`  ${line}`, "info");
          }
        });

        // Flush text box
        setPrompt("");
      } else {
        throw new Error(result.error || "Analysis layer failed.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to analyze or store request.");
      addLog(`Execution sequence halted: ${err.message}`, "error");
    } finally {
      setRoutingLoading(false);
    }
  };

  // Render the appropriate active page component
  const renderActivePageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <PageSecurityGate 
            user={user} 
            onLogin={handleLogin} 
            errorMessage={errorMessage} 
            routingLoading={routingLoading} 
          />
        );
      case 2:
        return (
          <PageExecutionGate 
            prompt={prompt}
            setPrompt={setPrompt}
            routingLoading={routingLoading}
            onSubmit={handleEvaluate}
            logs={logs}
            addLog={addLog}
            threshold={threshold}
          />
        );
      case 3:
        return (
          <PageAnalyticsCore 
            requests={requests} 
            threshold={threshold} 
          />
        );
      case 4:
        return (
          <PageAuditLedger 
            requests={requests} 
          />
        );
      case 5:
        return (
          <PageThresholdConfigurator 
            threshold={threshold} 
            setThreshold={setThreshold} 
          />
        );
      default:
        return (
          <div className="p-8 text-center text-zinc-500 font-mono">
            Page Index {currentPage} not defined.
          </div>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-100 animate-fade-in" id="auth-loading-state">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Initializing Aegis Routing Engine...</p>
      </div>
    );
  }

  // Standalone Screen layout for unauthenticated guests (PAGE 1 login state)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <PageSecurityGate 
          user={null} 
          onLogin={handleLogin} 
          errorMessage={errorMessage} 
        />
      </div>
    );
  }

  // Elite Dev-Ops Full-Screen layout with Permanent Navigation Sidebar
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Permanent Navigation Sidebar */}
      <Sidebar 
        user={user} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout}
        threshold={threshold}
      />

      {/* Main Multi-Page content area with high-performance scrolling */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#09090b] p-6 sm:p-8" id="aegis-main-viewport">
        {/* Run-time Error alert notifications */}
        {errorMessage && currentPage !== 1 && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl flex items-start gap-2.5 animate-bounce-short" id="runtime-error-alert">
            <div className="mt-0.5 font-bold">[!]</div>
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider font-mono">Engine Pipeline Alert:</p>
              <p className="text-xs text-rose-300 font-mono mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Transition animations between pages using motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-view-${currentPage}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-6xl mx-auto h-full"
          >
            {renderActivePageContent()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
