"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void;
  category: "navigation" | "action" | "sample";
}

const RECENT_KEY = "k8s-cmd-palette-recent";
const MAX_RECENT = 5;

function getRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(id: string) {
  const recent = getRecentIds().filter((r) => r !== id);
  recent.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function cycleTheme() {
  const current = localStorage.getItem("k8s-theme") || "dark";
  const order = ["dark", "light", "system"];
  const next = order[(order.indexOf(current) + 1) % order.length];
  localStorage.setItem("k8s-theme", next);
  const resolved = next === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : next;
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(resolved);
  document.documentElement.setAttribute("data-theme", resolved);
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: next, resolved } }));
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    {
      id: "analyze",
      label: "Analyze Alert",
      description: "Open the alert analyzer dashboard",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      action: () => router.push("/app"),
      category: "navigation",
    },
    {
      id: "runbook",
      label: "Generate Runbook",
      description: "Create step-by-step runbooks for K8s alerts",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      action: () => router.push("/app/runbooks"),
      category: "navigation",
    },
    {
      id: "correlate",
      label: "Correlate Alerts",
      description: "Find relationships between multiple alerts",
      icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      action: () => router.push("/app/correlate"),
      category: "navigation",
    },
    {
      id: "dashboard",
      label: "View Dashboard",
      description: "Go to the main application dashboard",
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      action: () => router.push("/app"),
      category: "navigation",
    },
    {
      id: "webhooks",
      label: "Manage Webhooks",
      description: "Configure incoming webhook endpoints",
      icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      action: () => router.push("/app/webhooks"),
      category: "navigation",
    },
    {
      id: "integrations",
      label: "Slack Integration",
      description: "Configure Slack notifications and message format",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      action: () => router.push("/app/integrations"),
      category: "navigation",
    },
    {
      id: "monitoring",
      label: "Performance Monitoring",
      description: "View real-time API metrics, latency percentiles, and rate limits",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      action: () => router.push("/app/monitoring"),
      category: "navigation",
    },
    {
      id: "home",
      label: "Go to Home",
      description: "Return to the landing page",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z",
      action: () => router.push("/"),
      category: "navigation",
    },
    // Theme commands
    {
      id: "toggle-theme",
      label: "Toggle Theme",
      description: "Switch between dark, light, and system themes",
      icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
      action: () => cycleTheme(),
      category: "action",
    },
    {
      id: "theme-dark",
      label: "Dark Theme",
      description: "Switch to dark mode",
      icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
      action: () => {
        localStorage.setItem("k8s-theme", "dark");
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: "dark", resolved: "dark" } }));
      },
      category: "action",
    },
    {
      id: "theme-light",
      label: "Light Theme",
      description: "Switch to light mode",
      icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
      action: () => {
        localStorage.setItem("k8s-theme", "light");
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add("light");
        document.documentElement.setAttribute("data-theme", "light");
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: "light", resolved: "light" } }));
      },
      category: "action",
    },
    // Export commands
    {
      id: "export-print",
      label: "Print Report as PDF",
      description: "Print the current analysis or runbook as a formatted PDF",
      icon: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z",
      action: () => window.print(),
      category: "action",
    },
    {
      id: "sample-prometheus",
      label: "Load Sample Prometheus Alert",
      description: "Load a CrashLoopBackOff sample alert",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
      action: () => {
        router.push("/app");
        window.dispatchEvent(new CustomEvent("load-sample", { detail: "prometheus" }));
      },
      category: "sample",
    },
    {
      id: "sample-pagerduty",
      label: "Load Sample PagerDuty Alert",
      description: "Load a high memory usage PagerDuty alert",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      action: () => {
        router.push("/app");
        window.dispatchEvent(new CustomEvent("load-sample", { detail: "pagerduty" }));
      },
      category: "sample",
    },
  ];

  const recentIds = getRecentIds();

  const filtered = query.trim()
    ? commands.filter(
        (c) => fuzzyMatch(query, c.label) || fuzzyMatch(query, c.description)
      )
    : commands;

  // Sort: recent first, then by category
  const sorted = [...filtered].sort((a, b) => {
    const aRecent = recentIds.indexOf(a.id);
    const bRecent = recentIds.indexOf(b.id);
    if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
    if (aRecent !== -1) return -1;
    if (bRecent !== -1) return 1;
    return 0;
  });

  const execute = useCallback(
    (cmd: Command) => {
      saveRecent(cmd.id);
      setOpen(false);
      setQuery("");
      cmd.action();
    },
    []
  );

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard nav inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, sorted.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && sorted[selectedIndex]) {
      e.preventDefault();
      execute(sorted[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-cmd-item]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    action: "Actions",
    sample: "Sample Data",
  };

  // Group by category for display
  let lastCategory = "";

  return (
    <div className="cmd-palette-overlay" onClick={() => setOpen(false)}>
      <div
        className="cmd-palette-container"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="cmd-palette-input-wrap">
          <svg
            className="w-5 h-5"
            style={{ color: "var(--text-muted)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="cmd-palette-input"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cmd-palette-kbd">ESC</kbd>
        </div>

        {/* Results */}
        <div className="cmd-palette-list" ref={listRef}>
          {sorted.length === 0 && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              No commands found for &ldquo;{query}&rdquo;
            </div>
          )}
          {sorted.map((cmd, idx) => {
            const showCategory = cmd.category !== lastCategory;
            lastCategory = cmd.category;
            const isRecent = recentIds.includes(cmd.id) && !query.trim();
            return (
              <div key={cmd.id}>
                {showCategory && (
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {isRecent ? "Recent" : categoryLabels[cmd.category] || cmd.category}
                  </div>
                )}
                <button
                  data-cmd-item
                  className={`cmd-palette-item ${
                    idx === selectedIndex ? "cmd-palette-item-active" : ""
                  }`}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-palette-item-icon">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={cmd.icon}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {cmd.label}
                    </div>
                    <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {cmd.description}
                    </div>
                  </div>
                  {isRecent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--surface-hover)", color: "var(--text-muted)" }}>
                      recent
                    </span>
                  )}
                  {idx === selectedIndex && (
                    <svg
                      className="w-4 h-4"
                      style={{ color: "var(--text-muted)" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="cmd-palette-footer">
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <kbd className="cmd-palette-kbd-sm">&uarr;&darr;</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="cmd-palette-kbd-sm">&crarr;</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="cmd-palette-kbd-sm">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
