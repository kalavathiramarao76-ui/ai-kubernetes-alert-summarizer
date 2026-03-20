"use client";

import { Severity } from "@/lib/types";

const severityConfig: Record<Severity, { color: string; bg: string; border: string; label: string; description: string }> = {
  P0: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Critical", description: "Complete outage" },
  P1: { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", label: "High", description: "Major degradation" },
  P2: { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Medium", description: "Partial issue" },
  P3: { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", label: "Low", description: "Minor issue" },
  P4: { color: "text-gray-400", bg: "bg-gray-500/20", border: "border-gray-500/30", label: "Info", description: "Informational" },
};

export default function SeverityBadge({ severity, size = "md" }: { severity: Severity; size?: "sm" | "md" | "lg" }) {
  const config = severityConfig[severity];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bg} ${config.color} border ${config.border} rounded-full font-bold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace("text-", "bg-")} ${severity === "P0" ? "animate-pulse" : ""}`} />
      {severity} - {config.label}
    </span>
  );
}

export function SeverityLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(severityConfig) as Severity[]).map((sev) => (
        <SeverityBadge key={sev} severity={sev} size="sm" />
      ))}
    </div>
  );
}
