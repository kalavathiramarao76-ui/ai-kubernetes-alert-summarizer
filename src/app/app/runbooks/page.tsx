"use client";

import { useState } from "react";
import AlertInput from "@/components/AlertInput";
import StreamingOutput from "@/components/StreamingOutput";
import StatusIndicator from "@/components/StatusIndicator";

const commonAlerts = [
  { name: "CrashLoopBackOff", description: "Pod repeatedly crashing and restarting" },
  { name: "OOMKilled", description: "Container killed due to memory limit exceeded" },
  { name: "ImagePullBackOff", description: "Failed to pull container image" },
  { name: "NodeNotReady", description: "Kubernetes node is not ready" },
  { name: "PersistentVolumeClaim Pending", description: "PVC stuck in pending state" },
  { name: "High CPU Throttling", description: "Container CPU throttled above threshold" },
  { name: "Certificate Expiry", description: "TLS certificate nearing expiration" },
  { name: "Disk Pressure", description: "Node disk space running low" },
  { name: "Pod Eviction", description: "Pods being evicted from node" },
  { name: "HPA Max Replicas", description: "HPA has reached maximum replica count" },
  { name: "Deployment Rollback", description: "Deployment has been rolled back" },
  { name: "DNS Resolution Failure", description: "DNS resolution failing for services" },
];

export default function RunbooksPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (alert: string) => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await fetch("/api/runbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert }),
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
      setError(err instanceof Error ? err.message : "Failed to generate runbook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Runbook Generator</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Generate step-by-step resolution runbooks for any Kubernetes alert or issue.
          </p>
        </div>
        <StatusIndicator />
      </div>

      {/* Quick-select common alerts */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Quick Generate: Common Alert Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {commonAlerts.map((alert) => (
            <button
              key={alert.name}
              onClick={() => handleGenerate(alert.name + ": " + alert.description)}
              disabled={loading}
              className="text-left p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-lg transition-all group disabled:opacity-50"
            >
              <div className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">
                {alert.name}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{alert.description}</div>
            </button>
          ))}
        </div>
      </div>

      <AlertInput
        onSubmit={handleGenerate}
        loading={loading}
        title="Custom Alert / Issue"
        description="Paste an alert or describe a Kubernetes issue to generate a detailed runbook."
        placeholder="Paste alert JSON, describe a K8s issue, or enter an alert name like 'CrashLoopBackOff on payment-service'..."
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-400">Generation Failed</p>
            <p className="text-xs text-red-400/70 mt-1">{error}</p>
          </div>
        </div>
      )}

      <StreamingOutput
        content={result}
        loading={loading}
        title="Generated Runbook"
      />

      {!result && !loading && (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Production-Ready Runbooks</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Each runbook includes triage steps, kubectl commands, diagnosis procedures,
            resolution steps, verification, and escalation paths.
          </p>
        </div>
      )}
    </div>
  );
}
