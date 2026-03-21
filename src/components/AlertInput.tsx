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
  placeholder = '{\n  "alertname": "KubePodCrashLooping",\n  "namespace": "production",\n  "severity": "critical"\n}',
  title = "Alert Input",
  description = "Paste alert data from Prometheus, PagerDuty, OpsGenie, Grafana, or any monitoring system.",
  multiAlert = false,
}: AlertInputProps) {
  const [input, setInput] = useState("");

  const loadSample = (type: "prometheus" | "pagerduty" | "multiAlert") => {
    setInput(SAMPLE_ALERTS[type]);
  };

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 animate-fade-in alert-input-glow transition-transform duration-200"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>{description}</p>
        </div>
        {/* Sample alert pills */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-mono uppercase tracking-wider mr-1" style={{ color: "var(--text-muted)" }}>Samples</span>
          <button
            onClick={() => loadSample("prometheus")}
            className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-[#326CE5]"
            style={{
              background: "rgba(50, 108, 229, 0.08)",
              color: "#326CE5",
              border: "1px solid rgba(50, 108, 229, 0.15)",
            }}
            aria-label="Load sample Prometheus alert"
          >
            Prometheus
          </button>
          <button
            onClick={() => loadSample("pagerduty")}
            className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-[#326CE5]"
            style={{
              background: "rgba(50, 108, 229, 0.08)",
              color: "#326CE5",
              border: "1px solid rgba(50, 108, 229, 0.15)",
            }}
            aria-label="Load sample PagerDuty alert"
          >
            PagerDuty
          </button>
          {multiAlert && (
            <button
              onClick={() => loadSample("multiAlert")}
              className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-[#326CE5]"
              style={{
                background: "rgba(50, 108, 229, 0.08)",
                color: "#326CE5",
                border: "1px solid rgba(50, 108, 229, 0.15)",
              }}
              aria-label="Load sample multi-alert"
            >
              Multi-Alert
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 rounded-xl p-5 text-sm font-mono leading-relaxed placeholder:opacity-30 focus:outline-none resize-none transition-all duration-200"
          style={{
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(50, 108, 229, 0.5)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(50, 108, 229, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
          spellCheck={false}
          aria-label={title}
        />
        {input && (
          <button
            onClick={() => setInput("")}
            className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#326CE5]"
            style={{ color: "var(--text-muted)" }}
            aria-label="Clear alert input"
          >
            Clear
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5">
        <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {input.length > 0 ? `${input.length} chars` : "Waiting for input..."}
        </div>
        <button
          onClick={() => onSubmit(input)}
          disabled={!input.trim() || loading}
          className="px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#326CE5] hover:-translate-y-[1px]"
          style={{
            background: !input.trim() || loading ? "var(--surface-hover)" : "#326CE5",
            color: !input.trim() || loading ? "var(--text-muted)" : "#ffffff",
          }}
          aria-label={loading ? "Analyzing alert" : "Analyze alert"}
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
