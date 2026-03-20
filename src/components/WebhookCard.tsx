"use client";

import { useState } from "react";

export interface WebhookConfig {
  id: string;
  name: string;
  source: "pagerduty" | "datadog" | "cloudwatch" | "opsgenie" | "custom";
  active: boolean;
  createdAt: string;
  lastReceived: string | null;
}

const SOURCE_META: Record<
  WebhookConfig["source"],
  { label: string; color: string; bg: string; border: string; iconBg: string }
> = {
  pagerduty: {
    label: "PagerDuty",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    iconBg: "bg-green-500/20",
  },
  datadog: {
    label: "Datadog",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    iconBg: "bg-purple-500/20",
  },
  cloudwatch: {
    label: "CloudWatch",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    iconBg: "bg-orange-500/20",
  },
  opsgenie: {
    label: "OpsGenie",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/20",
  },
  custom: {
    label: "Custom",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
    iconBg: "bg-zinc-500/20",
  },
};

function SourceIcon({ source }: { source: WebhookConfig["source"] }) {
  const paths: Record<WebhookConfig["source"], React.ReactNode> = {
    pagerduty: (
      <path
        fill="currentColor"
        d="M16.965 1.18C15.085.164 13.769 0 10.683 0H3.73v14.55h6.926c2.743 0 4.8-.164 6.61-1.37 1.975-1.303 3.004-3.47 3.004-6.074 0-2.878-1.166-4.963-3.305-5.926zM11.07 10.63H7.623V3.636h3.235c3.263 0 4.97 1.11 4.97 3.387 0 2.57-1.775 3.607-4.758 3.607zM3.73 17.78V24h3.893v-6.22H3.73z"
      />
    ),
    datadog: (
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 13v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V5h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      />
    ),
    cloudwatch: (
      <path
        fill="currentColor"
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        strokeWidth={1.5}
        stroke="currentColor"
        fillOpacity={0}
      />
    ),
    opsgenie: (
      <path
        fill="currentColor"
        d="M12 2a5 5 0 100 10 5 5 0 000-10zm0 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"
      />
    ),
    custom: (
      <path
        fill="currentColor"
        d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6-1.6 1.6a1 1 0 101.4 1.4l2.3-2.3a1 1 0 000-1.4l-2.3-2.3a1 1 0 00-1.4 0zm-5.4 0a1 1 0 00-1.4 0L5.6 8.6a1 1 0 000 1.4l2.3 2.3a1 1 0 001.4-1.4L7.7 9.3l1.6-1.6a1 1 0 000-1.4zM12 2a10 10 0 100 20 10 10 0 000-20z"
      />
    ),
  };

  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      {paths[source]}
    </svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface WebhookCardProps {
  webhook: WebhookConfig;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}

export default function WebhookCard({ webhook, onToggle, onDelete, onTest }: WebhookCardProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "idle">("idle");

  const meta = SOURCE_META[webhook.source];
  const webhookUrl = `https://your-domain.com/api/webhook?source=${webhook.source}&id=${webhook.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult("idle");
    setTimeout(() => {
      setTesting(false);
      setTestResult("success");
      onTest(webhook.id);
      setTimeout(() => setTestResult("idle"), 3000);
    }, 1500);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(webhook.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
    }
  };

  return (
    <div
      className={`group relative bg-zinc-900/50 border rounded-xl p-5 transition-all duration-200 hover:bg-zinc-900/80 ${
        webhook.active ? meta.border : "border-zinc-800/50"
      }`}
    >
      {/* Source-specific accent line */}
      <div
        className={`absolute top-0 left-6 right-6 h-[2px] rounded-b ${
          webhook.active ? meta.bg.replace("/10", "/40") : "bg-zinc-700/30"
        } transition-colors`}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.iconBg} ${meta.color}`}>
            <SourceIcon source={webhook.source} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{webhook.name}</h3>
            <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
          </div>
        </div>

        {/* Active toggle */}
        <button
          onClick={() => onToggle(webhook.id)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            webhook.active ? "bg-indigo-600" : "bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              webhook.active ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* URL */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-1 block">
          Webhook URL
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-zinc-400 truncate">
            {webhookUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold block mb-0.5">
            Created
          </span>
          <span className="text-xs text-zinc-400">{formatDate(webhook.createdAt)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold block mb-0.5">
            Last Received
          </span>
          <span className="text-xs text-zinc-400">
            {webhook.lastReceived ? timeAgo(webhook.lastReceived) : "Never"}
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`status-dot ${
            webhook.active ? "status-dot-green" : "status-dot-red"
          }`}
          style={{ width: 6, height: 6 }}
        />
        <span className={`text-xs font-medium ${webhook.active ? "text-green-400" : "text-zinc-500"}`}>
          {webhook.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/50">
        <button
          onClick={handleTest}
          disabled={testing || !webhook.active}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 rounded-lg text-xs font-medium transition-colors"
        >
          {testing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Testing...
            </>
          ) : testResult === "success" ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Sent!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Test
            </>
          )}
        </button>

        <div className="flex-1" />

        <button
          onClick={handleDelete}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            confirmDelete
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {confirmDelete ? "Confirm Delete" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export { SOURCE_META, SourceIcon };
