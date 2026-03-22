"use client";

import { useState } from "react";
import AlertInput from "@/components/AlertInput";
import StreamingOutput from "@/components/StreamingOutput";
import StatusIndicator from "@/components/StatusIndicator";
import ApiErrorFallback from "@/components/ApiErrorFallback";

export default function AnalyzePage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastInput, setLastInput] = useState("");

  const handleAnalyze = async (alert: string) => {
    setLoading(true);
    setResult("");
    setError("");
    setLastInput(alert);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.error === "FREE_LIMIT_REACHED") {
          window.dispatchEvent(new CustomEvent("usage-changed", { detail: errorData.count }));
          return;
        }
      }

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
      setError(err instanceof Error ? err.message : "Failed to analyze alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero header */}
      <div className="pt-4 pb-2">
        <div className="flex items-center gap-4 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#326CE5]/10 text-[#326CE5] border border-[#326CE5]/20 font-mono">
            Workspace
          </span>
          <StatusIndicator />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Alert Analysis
        </h1>
        <p className="text-base mt-3 max-w-2xl leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Paste a Kubernetes alert to get AI-powered analysis, severity classification, and root cause detection.
        </p>
      </div>

      <AlertInput
        onSubmit={handleAnalyze}
        loading={loading}
        title="Paste Alert Data"
        description="Supports JSON, plain text, or structured alerts from Prometheus, PagerDuty, OpsGenie, Grafana, Datadog, and more."
      />

      {error && (
        <ApiErrorFallback
          error={error}
          onRetry={() => {
            if (lastInput) handleAnalyze(lastInput);
          }}
        />
      )}

      <StreamingOutput
        content={result}
        loading={loading}
        title="AI Analysis"
        inputText={lastInput}
        favoriteType="analysis"
      />

      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <FeatureCard
            title="Root Cause Analysis"
            description="Identifies the most likely root cause from alert patterns and K8s resource states."
            icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <FeatureCard
            title="Severity Classification"
            description="P0-P4 severity rating with detailed justification based on blast radius and impact."
            icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
          <FeatureCard
            title="Slack Summary"
            description="One-click copy a concise incident summary formatted for your Slack incident channel."
            icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </div>
      )}
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div
      className="rounded-2xl p-6 animate-fade-in transition-transform duration-200 hover:-translate-y-[1px]"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(50, 108, 229, 0.1)", border: "1px solid rgba(50, 108, 229, 0.15)" }}
      >
        <svg className="w-5 h-5 text-[#326CE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{description}</p>
    </div>
  );
}
