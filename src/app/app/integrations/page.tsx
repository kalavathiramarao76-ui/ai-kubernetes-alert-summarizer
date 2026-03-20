"use client";

import { useState, useEffect, useCallback } from "react";
import SlackPreview from "@/components/SlackPreview";
import type { SlackConfig } from "@/components/SlackPreview";
import { getDefaultConfig } from "@/components/SlackPreview";

const STORAGE_KEY = "k8s-slack-config";
const SEVERITIES = ["P0", "P1", "P2", "P3", "P4"] as const;
const SEVERITY_META: Record<string, { label: string; color: string; bg: string }> = {
  P0: { label: "Critical", color: "text-red-400", bg: "bg-red-500/20" },
  P1: { label: "High", color: "text-orange-400", bg: "bg-orange-500/20" },
  P2: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  P3: { label: "Low", color: "text-blue-400", bg: "bg-blue-500/20" },
  P4: { label: "Info", color: "text-gray-400", bg: "bg-gray-500/20" },
};

function saveConfig(config: SlackConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent("slack-config-updated"));
}

export default function IntegrationsPage() {
  const [config, setConfig] = useState<SlackConfig>(getDefaultConfig);
  const [previewSeverity, setPreviewSeverity] = useState("P1");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success">("idle");
  const [saved, setSaved] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const stored = getDefaultConfig();
    setConfig(stored);
    // Check if we have a saved config (means "connected")
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
      setConnected(true);
    }
  }, []);

  const updateConfig = useCallback((partial: Partial<SlackConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...partial };
      return updated;
    });
    setSaved(false);
  }, []);

  const toggleSeverity = useCallback((sev: string) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        severities: { ...prev.severities, [sev]: !prev.severities[sev] },
      };
      return updated;
    });
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    saveConfig(config);
    setConnected(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [config]);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConnected(false);
    setConfig(getDefaultConfig());
    window.dispatchEvent(new CustomEvent("slack-config-updated"));
  }, []);

  const handleTest = useCallback(() => {
    setTesting(true);
    setTestResult("idle");
    setTimeout(() => {
      setTesting(false);
      setTestResult("success");
      setTimeout(() => setTestResult("idle"), 3000);
    }, 2000);
  }, []);

  const enabledCount = Object.values(config.severities).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#4A154B] to-[#611f69] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
              </svg>
            </div>
            Integrations
          </h1>
          <p className="text-sm text-zinc-500 mt-1 ml-12">
            Connect Slack to receive real-time alert summaries in your incident channels.
          </p>
        </div>
        {connected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="status-dot status-dot-green" style={{ width: 6, height: 6 }} />
            <span className="text-xs font-medium text-green-400">Connected</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Configuration */}
        <div className="space-y-5">
          {/* Slack channel */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Slack Channel
            </h2>
            <input
              type="text"
              value={config.channel}
              onChange={(e) => updateConfig({ channel: e.target.value })}
              placeholder="#incidents"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
            />
            <p className="text-xs text-zinc-600 mt-2">
              Enter the channel where alert summaries will be posted.
            </p>
          </div>

          {/* Bot name */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Bot Display Name
            </h2>
            <input
              type="text"
              value={config.botName}
              onChange={(e) => updateConfig({ botName: e.target.value })}
              placeholder="K8s Alert AI"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Severity filters */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-200 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Severity Filters
            </h2>
            <p className="text-xs text-zinc-600 mb-4">
              Choose which severity levels trigger Slack notifications. {enabledCount} of {SEVERITIES.length} enabled.
            </p>

            <div className="space-y-2">
              {SEVERITIES.map((sev) => {
                const meta = SEVERITY_META[sev];
                const enabled = config.severities[sev];
                return (
                  <button
                    key={sev}
                    onClick={() => toggleSeverity(sev)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                      enabled
                        ? `${meta.bg} border-current/20 ${meta.color}`
                        : "bg-zinc-950 border-zinc-800 text-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          enabled ? "border-current bg-current/20" : "border-zinc-700"
                        }`}
                      >
                        {enabled && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-bold">{sev}</span>
                      <span className={`text-xs ${enabled ? "opacity-80" : "text-zinc-600"}`}>
                        {meta.label}
                      </span>
                    </div>
                    <span className={`text-xs font-mono ${enabled ? "opacity-60" : "text-zinc-700"}`}>
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message options */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Message Options
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Include runbook link</span>
                </div>
                <button
                  onClick={() => updateConfig({ includeRunbook: !config.includeRunbook })}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    config.includeRunbook ? "bg-indigo-600" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      config.includeRunbook ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Include graph snapshot</span>
                </div>
                <button
                  onClick={() => updateConfig({ includeGraph: !config.includeGraph })}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    config.includeGraph ? "bg-indigo-600" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      config.includeGraph ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saved ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Configuration
                </>
              )}
            </button>

            <button
              onClick={handleTest}
              disabled={testing || !connected}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 rounded-lg text-sm font-medium transition-colors"
            >
              {testing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : testResult === "success" ? (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400">Test Sent!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Send Test Notification
                </>
              )}
            </button>

            {connected && (
              <button
                onClick={handleDisconnect}
                className="ml-auto text-xs text-zinc-600 hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Right column - Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Message Preview
            </h2>
            <div className="flex items-center gap-1">
              {SEVERITIES.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setPreviewSeverity(sev)}
                  className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                    previewSeverity === sev
                      ? `${SEVERITY_META[sev].bg} ${SEVERITY_META[sev].color}`
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <SlackPreview config={config} severity={previewSeverity} />

          <p className="text-xs text-zinc-600 text-center">
            This is a preview of how alerts will appear in {config.channel || "#channel"}
          </p>
        </div>
      </div>
    </div>
  );
}
