"use client";

import { useState, useEffect, useRef } from "react";

type Theme = "dark" | "light" | "system";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("k8s-theme") as Theme) || "dark";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  html.classList.add(resolved);
  html.setAttribute("data-theme", resolved);
  localStorage.setItem("k8s-theme", theme);
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme, resolved } }));
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    const res = stored === "system" ? getSystemTheme() : stored;
    setResolved(res);
    applyTheme(stored);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = getStoredTheme();
      if (current === "system") {
        const newResolved = getSystemTheme();
        setResolved(newResolved);
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setAndApply = (newTheme: Theme) => {
    setTheme(newTheme);
    const res = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolved(res);
    applyTheme(newTheme);
  };

  return { theme, resolved, setTheme: setAndApply };
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cycleTheme = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 300);
    const order: Theme[] = ["dark", "light", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const selectTheme = (t: Theme) => {
    setRotating(true);
    setTimeout(() => setRotating(false), 300);
    setTheme(t);
    setOpen(false);
  };

  const options: { value: Theme; label: string; icon: JSX.Element }[] = [
    {
      value: "light",
      label: "Light",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: "dark",
      label: "Dark",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      value: "system",
      label: "System",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={cycleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        className="theme-toggle-btn p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 dark:hover:bg-zinc-800/50 light-mode:hover:bg-zinc-200 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
        title={`Theme: ${theme} (right-click for options)`}
        aria-label={`Current theme: ${theme}. Click to cycle, right-click for options`}
      >
        <div className={`theme-icon-wrapper ${rotating ? "theme-icon-rotate" : ""}`}>
          {theme === "light" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : theme === "dark" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 py-1 rounded-xl border border-zinc-700/50 bg-zinc-900/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl z-50 animate-fade-in theme-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectTheme(opt.value)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                theme === opt.value
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {theme === opt.value && (
                <svg className="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
