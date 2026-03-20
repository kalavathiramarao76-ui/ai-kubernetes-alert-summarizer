"use client";

import { useState } from "react";
import AlertInput from "@/components/AlertInput";
import StreamingOutput from "@/components/StreamingOutput";
import StatusIndicator from "@/components/StatusIndicator";

export default function CorrelatePage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCorrelate = async (alerts: string) => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await fetch("/api/correlate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alerts }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(accumulated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to correlate alerts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Alert Correlator</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Paste multiple alerts to find relationships, identify cascading failures, and get a unified response plan.
          </p>
        </div>
        <StatusIndicator />
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { step: "1", title: "Paste Alerts", desc: "Multiple alerts from your monitoring stack", color: "text-indigo-400" },
          { step: "2", title: "AI Analysis", desc: "Pattern detection and timing correlation", color: "text-purple-400" },
          { step: "3", title: "Group & Link", desc: "Related alerts grouped by root cause", color: "text-amber-400" },
          { step: "4", title: "Unified Plan", desc: "Single coordinated response strategy", color: "text-terminal-green" },
        ].map((item) => (
          <div key={item.step} className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 relative">
            <div className={`text-2xl font-bold ${item.color} opacity-30 absolute top-3 right-3`}>{item.step}</div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">{item.title}</h3>
            <p className="text-xs text-zinc-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <AlertInput
        onSubmit={handleCorrelate}
        loading={loading}
        title="Paste Multiple Alerts"
        description="Paste multiple alerts separated by newlines. Supports any format: JSON, text, logs."
        placeholder={`Paste multiple alerts here. Examples:\n\nAlert 1: [14:20] Node k8s-worker-03 memory at 95%\nAlert 2: [14:22] Pod api-server-7d4f8b OOM killed\nAlert 3: [14:23] Pod api-server-7d4f8b CrashLoopBackOff\nAlert 4: [14:25] Service endpoint count dropped to 1/3\nAlert 5: [14:26] HTTP 5xx error rate exceeded 10%`}
        multiAlert
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-400">Correlation Failed</p>
            <p className="text-xs text-red-400/70 mt-1">{error}</p>
          </div>
        </div>
      )}

      <StreamingOutput
        content={result}
        loading={loading}
        title="Correlation Analysis"
      />

      {!result && !loading && (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Multi-Alert Intelligence</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            The correlator identifies cause-and-effect chains, shared root causes, and cascading failures
            across your alerts. It then generates a unified incident timeline and response plan.
          </p>
        </div>
      )}
    </div>
  );
}
