"use client";

import { useState, useEffect, useCallback } from "react";
import WebhookCard from "@/components/WebhookCard";
import type { WebhookConfig } from "@/components/WebhookCard";

const STORAGE_KEY = "k8s-webhooks";

const SOURCES: { value: WebhookConfig["source"]; label: string }[] = [
  { value: "pagerduty", label: "PagerDuty" },
  { value: "datadog", label: "Datadog" },
  { value: "cloudwatch", label: "CloudWatch" },
  { value: "opsgenie", label: "OpsGenie" },
  { value: "custom", label: "Custom" },
];

function generateId(): string {
  return "wh_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadWebhooks(): WebhookConfig[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveWebhooks(webhooks: WebhookConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
  window.dispatchEvent(new CustomEvent("webhooks-updated"));
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [source, setSource] = useState<WebhookConfig["source"]>("pagerduty");

  useEffect(() => {
    setWebhooks(loadWebhooks());
  }, []);

  const handleAdd = useCallback(() => {
    if (!name.trim()) return;
    const newWebhook: WebhookConfig = {
      id: generateId(),
      name: name.trim(),
      source,
      active: true,
      createdAt: new Date().toISOString(),
      lastReceived: null,
    };
    const updated = [newWebhook, ...webhooks];
    setWebhooks(updated);
    saveWebhooks(updated);
    setName("");
    setSource("pagerduty");
    setShowForm(false);
  }, [name, source, webhooks]);

  const handleToggle = useCallback(
    (id: string) => {
      const updated = webhooks.map((w) =>
        w.id === id ? { ...w, active: !w.active } : w
      );
      setWebhooks(updated);
      saveWebhooks(updated);
    },
    [webhooks]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = webhooks.filter((w) => w.id !== id);
      setWebhooks(updated);
      saveWebhooks(updated);
    },
    [webhooks]
  );

  const handleTest = useCallback(
    (id: string) => {
      const updated = webhooks.map((w) =>
        w.id === id ? { ...w, lastReceived: new Date().toISOString() } : w
      );
      setWebhooks(updated);
      saveWebhooks(updated);
    },
    [webhooks]
  );

  const activeCount = webhooks.filter((w) => w.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            Webhooks
          </h1>
          <p className="text-sm text-zinc-500 mt-1 ml-12">
            Configure incoming webhook endpoints to receive alerts from your monitoring tools.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Webhook
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 px-5 py-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Total</span>
          <span className="text-sm font-bold text-zinc-200 font-mono">{webhooks.length}</span>
        </div>
        <div className="w-px h-4 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-green" style={{ width: 6, height: 6 }} />
          <span className="text-xs text-zinc-500">Active</span>
          <span className="text-sm font-bold text-green-400 font-mono">{activeCount}</span>
        </div>
        <div className="w-px h-4 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-red" style={{ width: 6, height: 6 }} />
          <span className="text-xs text-zinc-500">Inactive</span>
          <span className="text-sm font-bold text-zinc-500 font-mono">{webhooks.length - activeCount}</span>
        </div>
      </div>

      {/* Add webhook form */}
      {showForm && (
        <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Webhook
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Webhook Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production PagerDuty"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>

            {/* Source */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                Alert Source
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {SOURCES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSource(s.value)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                      source === s.value
                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                        : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview URL */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
              Generated Endpoint
            </label>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-xs text-zinc-500">
              https://your-domain.com/api/webhook?source={source}&id=wh_xxxxxxxx
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowForm(false);
                setName("");
              }}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Create Webhook
            </button>
          </div>
        </div>
      )}

      {/* Webhook cards */}
      {webhooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {webhooks.map((wh) => (
            <WebhookCard
              key={wh.id}
              webhook={wh}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onTest={handleTest}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No webhooks configured</h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-6">
            Set up incoming webhooks to automatically receive and analyze alerts from PagerDuty, Datadog, CloudWatch, OpsGenie, or any custom source.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Webhook
          </button>

          {/* Source logos */}
          <div className="flex items-center gap-6 mt-10">
            {[
              { name: "PagerDuty", color: "text-green-500/40" },
              { name: "Datadog", color: "text-purple-500/40" },
              { name: "CloudWatch", color: "text-orange-500/40" },
              { name: "OpsGenie", color: "text-blue-500/40" },
            ].map((s) => (
              <div key={s.name} className={`text-xs font-medium ${s.color}`}>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
