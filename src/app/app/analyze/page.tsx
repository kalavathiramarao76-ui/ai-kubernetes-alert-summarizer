"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import StreamingOutput from "@/components/StreamingOutput";
import Link from "next/link";

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const alertData = searchParams.get("alert");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (alertData) {
      analyzeAlert(alertData);
    }
  }, [alertData]);

  const analyzeAlert = async (alert: string) => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await fetch("/api/analyze", {
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
      setError(err instanceof Error ? err.message : "Failed to analyze alert");
    } finally {
      setLoading(false);
    }
  };

  if (!alertData) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">No Alert Data</h2>
        <p className="text-zinc-500 mb-6">Go to the dashboard to paste and analyze an alert.</p>
        <Link
          href="/app"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Analysis Results</h1>
          <p className="text-sm text-zinc-500 mt-1">AI-powered alert analysis with root cause detection</p>
        </div>
        <Link
          href="/app"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
        >
          New Analysis
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <StreamingOutput content={result} loading={loading} title="AI Analysis" />
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-zinc-500">Loading...</div>}>
      <AnalyzeContent />
    </Suspense>
  );
}
