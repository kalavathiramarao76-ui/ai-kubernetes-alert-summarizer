"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/app", label: "Analyze", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", badge: null },
  { href: "/app/runbooks", label: "Runbooks", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", badge: null },
  { href: "/app/correlate", label: "Correlate", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", badge: null },
  { href: "/app/webhooks", label: "Webhooks", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", badge: "webhooks" },
  { href: "/app/integrations", label: "Slack", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", badge: "slack" },
  { href: "/app/monitoring", label: "Monitoring", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", badge: null },
];

function useWebhookCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const refresh = () => {
      try {
        const data = JSON.parse(localStorage.getItem("k8s-webhooks") || "[]");
        setCount(data.filter((w: { active: boolean }) => w.active).length);
      } catch {
        setCount(0);
      }
    };
    refresh();
    window.addEventListener("webhooks-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("webhooks-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return count;
}

function useSlackConnected(): boolean {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const refresh = () => {
      setConnected(!!localStorage.getItem("k8s-slack-config"));
    };
    refresh();
    window.addEventListener("slack-config-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("slack-config-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return connected;
}

export default function Navbar() {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<"checking" | "online" | "offline">("checking");
  const webhookCount = useWebhookCount();
  const slackConnected = useSlackConnected();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("https://sai.sharedllm.com/v1/models", {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        setAiStatus(res.ok ? "online" : "offline");
      } catch {
        setAiStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const getBadgeValue = (badge: string | null): number | null => {
    if (badge === "webhooks") return webhookCount > 0 ? webhookCount : null;
    if (badge === "slack") return slackConnected ? 1 : null;
    return null;
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center relative">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {/* Pulsing AI health dot */}
              <span
                className={`absolute -top-0.5 -right-0.5 status-dot ${
                  aiStatus === "online"
                    ? "status-dot-green"
                    : aiStatus === "offline"
                    ? "status-dot-red"
                    : "status-dot-yellow"
                }`}
                style={{ width: 7, height: 7 }}
              />
            </div>
            <div>
              <span className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                K8s Alert AI
              </span>
              <span className="hidden sm:inline text-xs text-zinc-500 ml-2 font-mono">v1.0</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {/* Cmd+K trigger */}
            <button
              onClick={() => {
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
                );
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 mr-2 bg-zinc-900 border border-zinc-700/60 hover:border-zinc-600 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-mono">Cmd+K</span>
            </button>

            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
              const isAnalyzeActive = item.href === "/app" && (pathname === "/app" || pathname === "/app/analyze");
              const badgeValue = getBadgeValue(item.badge);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive || isAnalyzeActive
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="hidden sm:inline">{item.label}</span>
                  {badgeValue !== null && (
                    <span className="nav-badge absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-lg shadow-indigo-500/30">
                      {item.badge === "slack" ? (
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        badgeValue
                      )}
                    </span>
                  )}
                </Link>
              );
            })}
            <a
              href="https://github.com/kalavathiramarao76-ui/ai-kubernetes-alert-summarizer"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
