"use client";

import Link from "next/link";
import StatusIndicator from "@/components/StatusIndicator";

const features = [
  {
    title: "Alert Analysis",
    description: "Paste any K8s alert and get instant plain-English summary with root cause analysis.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "from-indigo-500 to-purple-500",
    href: "/app",
  },
  {
    title: "Runbook Generator",
    description: "Auto-generate step-by-step runbooks with kubectl commands for any alert type.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "from-emerald-500 to-teal-500",
    href: "/app/runbooks",
  },
  {
    title: "Alert Correlator",
    description: "Paste multiple alerts to find relationships, cascading failures, and shared root causes.",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    color: "from-amber-500 to-orange-500",
    href: "/app/correlate",
  },
  {
    title: "Severity Classification",
    description: "AI-powered P0-P4 severity classification with detailed justification.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    color: "from-red-500 to-pink-500",
    href: "/app",
  },
  {
    title: "Incident Timeline",
    description: "Auto-generate chronological incident timelines from alert sequences.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-cyan-500 to-blue-500",
    href: "/app/correlate",
  },
  {
    title: "Slack-Ready Output",
    description: "One-click copy concise incident summaries formatted for Slack channels.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    color: "from-violet-500 to-purple-500",
    href: "/app",
  },
];

const integrations = [
  "Prometheus",
  "Grafana",
  "PagerDuty",
  "OpsGenie",
  "Datadog",
  "AlertManager",
  "CloudWatch",
  "New Relic",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-zinc-100">K8s Alert AI</span>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator />
            <Link
              href="/app"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-400 mb-6">
              <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
              AI-Powered Kubernetes Alert Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-100 tracking-tight">
              Stop reading alerts.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Start understanding them.
              </span>
            </h1>
            <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Paste your Kubernetes alerts from any monitoring system. Get instant plain-English
              summaries, root cause analysis, runbooks, and Slack-ready incident updates.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/app"
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Alerts Now
              </Link>
              <a
                href="https://github.com/kalavathiramarao76-ui/ai-kubernetes-alert-summarizer"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-base font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View Source
              </a>
            </div>
          </div>

          {/* Terminal preview */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border-b border-zinc-700">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-xs text-zinc-500 ml-2 font-mono">k8s-alert-ai ~ analysis</span>
              </div>
              <div className="p-5 font-mono text-sm">
                <div className="text-zinc-500 mb-1">$ kubectl get pods -n production</div>
                <div className="text-red-400 mb-3">api-server-7d4f8b6c9-x2k9p   0/1   CrashLoopBackOff   5   12m</div>
                <div className="text-zinc-500 mb-1">$ k8s-alert-ai analyze --alert prometheus-crash-loop</div>
                <div className="mt-2">
                  <span className="text-indigo-400">AI Analysis:</span>
                </div>
                <div className="mt-1 text-terminal-green">
                  <span className="text-zinc-300">Severity: </span>
                  <span className="text-red-400 font-bold">P1 - High</span>
                </div>
                <div className="text-terminal-green mt-1">
                  <span className="text-zinc-300">Root Cause: </span>
                  OOM Kill due to memory leak in api-server container
                </div>
                <div className="text-terminal-green mt-1">
                  <span className="text-zinc-300">Action: </span>
                  Increase memory limit from 512Mi to 1Gi, investigate leak
                </div>
                <div className="mt-2 text-zinc-600">
                  Analysis complete in 2.3s <span className="cursor-blink">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-100">Everything you need for K8s incident response</h2>
            <p className="mt-3 text-zinc-400 text-lg">From alert triage to incident resolution, all powered by AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all hover:bg-zinc-900/80"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-300 mb-8">Works with alerts from any monitoring system</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((name) => (
              <div
                key={name}
                className="px-5 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-400 font-medium"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">Ready to tame your K8s alerts?</h2>
          <p className="text-zinc-400 text-lg mb-8">No signup required. No API keys. Just paste and analyze.</p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start Analyzing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            K8s Alert AI
          </div>
          <div className="text-sm text-zinc-600">
            Built for SREs, by SREs
          </div>
        </div>
      </footer>
    </div>
  );
}
