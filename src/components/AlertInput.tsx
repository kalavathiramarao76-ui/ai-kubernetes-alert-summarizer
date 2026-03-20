"use client";

import { useState } from "react";
import { SAMPLE_ALERTS } from "@/lib/types";

interface AlertInputProps {
  onSubmit: (alert: string) => void;
  loading: boolean;
  placeholder?: string;
  title?: string;
  description?: string;
  multiAlert?: boolean;
}

export default function AlertInput({
  onSubmit,
  loading,
  placeholder = "Paste your Kubernetes alert JSON or text here...",
  title = "Alert Input",
  description = "Paste alert data from Prometheus, PagerDuty, OpsGenie, Grafana, or any monitoring system.",
  multiAlert = false,
}: AlertInputProps) {
  const [input, setInput] = useState("");

  const loadSample = (type: "prometheus" | "pagerduty" | "multiAlert") => {
    setInput(SAMPLE_ALERTS[type]);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          <p className="text-sm text-zinc-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600">Try sample:</span>
          <button
            onClick={() => loadSample("prometheus")}
            className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
          >
            Prometheus
          </button>
          <button
            onClick={() => loadSample("pagerduty")}
            className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
          >
            PagerDuty
          </button>
          {multiAlert && (
            <button
              onClick={() => loadSample("multiAlert")}
              className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
            >
              Multi-Alert
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="text-xs text-zinc-600 ml-2 font-mono">alert-input</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 bg-zinc-950 border border-zinc-700 rounded-lg p-4 pt-10 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all"
          spellCheck={false}
        />
        {input && (
          <button
            onClick={() => setInput("")}
            className="absolute top-3 right-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-zinc-600 font-mono">
          {input.length > 0 ? `${input.length} chars` : "Waiting for input..."}
        </div>
        <button
          onClick={() => onSubmit(input)}
          disabled={!input.trim() || loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze Alert
            </>
          )}
        </button>
      </div>
    </div>
  );
}
