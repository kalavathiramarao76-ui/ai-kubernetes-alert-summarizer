"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
          <div
            className="w-full max-w-md rounded-2xl p-8 text-center animate-fade-in"
            style={{
              background: "rgba(24, 24, 27, 0.75)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.08)",
            }}
          >
            {/* Glow accent */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)",
              }}
            />

            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-zinc-100 mb-2">Something went wrong</h2>
            <p className="text-sm text-zinc-400 mb-2">
              The application hit an unexpected error. This has been logged automatically.
            </p>

            {this.state.error && (
              <div
                className="rounded-lg p-3 mb-5 text-left"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
              >
                <p className="text-xs font-mono text-red-400/80 break-all line-clamp-2">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <p className="text-[11px] text-zinc-600 mt-4 font-mono">K8s Alert AI / Error Boundary</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
