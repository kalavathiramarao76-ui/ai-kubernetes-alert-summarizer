"use client";

import { useState, useEffect, useCallback } from "react";

interface ApiErrorFallbackProps {
  error: string;
  onRetry: () => void;
}

export default function ApiErrorFallback({ error, onRetry }: ApiErrorFallbackProps) {
  const [countdown, setCountdown] = useState(10);
  const [isPaused, setIsPaused] = useState(false);

  const handleRetry = useCallback(() => {
    setCountdown(10);
    setIsPaused(false);
    onRetry();
  }, [onRetry]);

  useEffect(() => {
    if (isPaused || countdown <= 0) {
      if (countdown <= 0) handleRetry();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, handleRetry]);

  const progress = ((10 - countdown) / 10) * 100;

  return (
    <div
      className="rounded-2xl p-6 animate-fade-in relative overflow-hidden"
      style={{
        background: "rgba(24, 24, 27, 0.75)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(245, 158, 11, 0.25)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(245, 158, 11, 0.06)",
      }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800 overflow-hidden rounded-t-2xl">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 9.9a9 9 0 01-4.928-2.364m2.829-2.829a5 5 0 01-1.414-3.535"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-amber-300">AI Service Unavailable</h3>
            {!isPaused && countdown > 0 && (
              <span className="text-xs font-mono text-zinc-500 tabular-nums">
                Retry in {countdown}s
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 mb-3">
            {error || "Could not reach the AI backend. This may be temporary."}
          </p>

          {/* Countdown ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  fill="none"
                  stroke="rgba(63, 63, 70, 0.5)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 13}`}
                  strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-amber-400 tabular-nums">
                {countdown}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-md shadow-indigo-500/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry Now
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-600 rounded-lg transition-all"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
