"use client";

import { useEffect, useState } from "react";

export default function StatusIndicator() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("https://sai.sharedllm.com/v1/models", {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        setStatus(res.ok ? "online" : "offline");
      } catch {
        setStatus("offline");
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    checking: "bg-yellow-500",
    online: "bg-terminal-green",
    offline: "bg-red-500",
  };

  const labels = {
    checking: "Checking AI...",
    online: "AI Online",
    offline: "AI Offline",
  };

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
      <span className={`w-2 h-2 rounded-full ${colors[status]} ${status === "checking" ? "animate-pulse" : ""}`} />
      {labels[status]}
    </div>
  );
}
