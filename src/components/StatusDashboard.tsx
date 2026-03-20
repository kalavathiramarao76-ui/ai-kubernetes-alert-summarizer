"use client";

import { useEffect, useState, useRef } from "react";

const STATS_KEY = "k8s-alert-stats";

interface Stats {
  alertsToday: number;
  totalResponseTime: number;
  responseCount: number;
  lastAnalysis: string | null;
  date: string;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStats(): Stats {
  if (typeof window === "undefined")
    return { alertsToday: 0, totalResponseTime: 0, responseCount: 0, lastAnalysis: null, date: getToday() };
  try {
    const stored = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
    if (stored.date !== getToday()) {
      return { alertsToday: 0, totalResponseTime: 0, responseCount: 0, lastAnalysis: null, date: getToday() };
    }
    return stored;
  } catch {
    return { alertsToday: 0, totalResponseTime: 0, responseCount: 0, lastAnalysis: null, date: getToday() };
  }
}

// Exported so other components can call this after API calls
export function recordAnalysis(responseTimeMs: number) {
  const stats = getStats();
  stats.alertsToday += 1;
  stats.totalResponseTime += responseTimeMs;
  stats.responseCount += 1;
  stats.lastAnalysis = new Date().toISOString();
  stats.date = getToday();
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent("stats-updated"));
}

function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}

export default function StatusDashboard() {
  const [aiStatus, setAiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [stats, setStats] = useState<Stats>(getStats);
  const [latency, setLatency] = useState<number | null>(null);

  // Check AI health
  useEffect(() => {
    const check = async () => {
      try {
        const t0 = performance.now();
        const res = await fetch("https://sai.sharedllm.com/v1/models", {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        const t1 = performance.now();
        setLatency(Math.round(t1 - t0));
        setAiStatus(res.ok ? "online" : "offline");
      } catch {
        setAiStatus("offline");
        setLatency(null);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for stats updates
  useEffect(() => {
    const refresh = () => setStats(getStats());
    window.addEventListener("stats-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("stats-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const avgResponse =
    stats.responseCount > 0
      ? (stats.totalResponseTime / stats.responseCount / 1000).toFixed(1)
      : null;

  const lastTime = stats.lastAnalysis
    ? new Date(stats.lastAnalysis).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="status-dashboard">
      {/* AI Status */}
      <div className="status-dashboard-item">
        <div className="flex items-center gap-1.5">
          <span
            className={`status-dot ${
              aiStatus === "online"
                ? "status-dot-green"
                : aiStatus === "offline"
                ? "status-dot-red"
                : "status-dot-yellow"
            }`}
          />
          <span className="text-xs font-medium text-zinc-400">
            AI {aiStatus === "online" ? "Healthy" : aiStatus === "offline" ? "Down" : "Checking"}
          </span>
        </div>
        {latency !== null && (
          <span className="text-[10px] text-zinc-600 font-mono">{latency}ms</span>
        )}
      </div>

      <div className="status-dashboard-divider" />

      {/* Alerts Analyzed */}
      <div className="status-dashboard-item">
        <span className="text-xs text-zinc-500">Analyzed today</span>
        <span className="text-sm font-bold text-zinc-200 font-mono tabular-nums">
          <AnimatedNumber value={stats.alertsToday} />
        </span>
      </div>

      <div className="status-dashboard-divider" />

      {/* Avg Response */}
      <div className="status-dashboard-item">
        <span className="text-xs text-zinc-500">Avg response</span>
        <span className="text-sm font-bold text-zinc-200 font-mono tabular-nums">
          {avgResponse ? `${avgResponse}s` : "--"}
        </span>
      </div>

      <div className="status-dashboard-divider" />

      {/* Last Analysis */}
      <div className="status-dashboard-item">
        <span className="text-xs text-zinc-500">Last analysis</span>
        <span className="text-sm font-medium text-zinc-300 font-mono">
          {lastTime || "--:--"}
        </span>
      </div>
    </div>
  );
}
