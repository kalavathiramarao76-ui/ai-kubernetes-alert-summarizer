"use client";

export interface SlackConfig {
  channel: string;
  severities: Record<string, boolean>;
  botName: string;
  includeRunbook: boolean;
  includeGraph: boolean;
}

const DEFAULT_CONFIG: SlackConfig = {
  channel: "#incidents",
  severities: { P0: true, P1: true, P2: true, P3: false, P4: false },
  botName: "K8s Alert AI",
  includeRunbook: true,
  includeGraph: true,
};

function getDefaultConfig(): SlackConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem("k8s-slack-config");
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export { DEFAULT_CONFIG, getDefaultConfig };

interface SlackPreviewProps {
  config: SlackConfig;
  severity?: string;
}

export default function SlackPreview({ config, severity = "P1" }: SlackPreviewProps) {
  const severityColors: Record<string, string> = {
    P0: "#e74c3c",
    P1: "#e67e22",
    P2: "#f1c40f",
    P3: "#3498db",
    P4: "#95a5a6",
  };

  const severityLabels: Record<string, string> = {
    P0: "Critical",
    P1: "High",
    P2: "Medium",
    P3: "Low",
    P4: "Info",
  };

  const accentColor = severityColors[severity] || severityColors.P1;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-lg">
      {/* Slack header bar */}
      <div className="bg-[#1a1d21] px-4 py-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
        <span className="text-xs text-zinc-400 font-medium">{config.channel}</span>
      </div>

      {/* Message body */}
      <div className="bg-[#1a1d21] px-4 pb-4">
        {/* Bot avatar + name */}
        <div className="flex items-start gap-2 pt-2">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-[#d1d2d3]">{config.botName}</span>
              <span className="text-[10px] px-1 py-0.5 bg-[#2e3136] text-[#9b9d9f] rounded font-medium">APP</span>
              <span className="text-[11px] text-[#616061]">{timeStr}</span>
            </div>

            {/* Attachment block with accent */}
            <div className="mt-1 flex">
              <div
                className="w-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <div className="pl-3 py-1 flex-1 min-w-0">
                {/* Title */}
                <div className="text-[15px] font-bold text-[#1d9bd1] mb-1">
                  {severity} - KubePodCrashLooping in production
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                  <div>
                    <div className="text-[12px] font-bold text-[#d1d2d3]">Severity</div>
                    <div className="text-[13px] text-[#ababad]">{severity} - {severityLabels[severity]}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#d1d2d3]">Namespace</div>
                    <div className="text-[13px] text-[#ababad]">production</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#d1d2d3]">Pod</div>
                    <div className="text-[13px] text-[#ababad] font-mono text-[12px]">api-server-7d4f8b6c9</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#d1d2d3]">Cluster</div>
                    <div className="text-[13px] text-[#ababad]">prod-us-east-1</div>
                  </div>
                </div>

                {/* Summary */}
                <div className="text-[13px] text-[#ababad] mb-2">
                  Pod api-server-7d4f8b6c9 is crash looping in the production namespace. Root cause: OOM killed due to memory leak in request handler. Immediate action required.
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] px-2 py-1 bg-[#007a5a] text-white rounded font-medium cursor-pointer hover:bg-[#006a4e]">
                    Acknowledge
                  </span>
                  {config.includeRunbook && (
                    <span className="text-[12px] px-2 py-1 border border-[#616061] text-[#d1d2d3] rounded font-medium cursor-pointer hover:bg-[#2e3136]">
                      View Runbook
                    </span>
                  )}
                  <span className="text-[12px] px-2 py-1 border border-[#616061] text-[#d1d2d3] rounded font-medium cursor-pointer hover:bg-[#2e3136]">
                    View in Dashboard
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#2e3136]">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#616061]">K8s Alert AI Summarizer</span>
                  <span className="text-[11px] text-[#616061]">|</span>
                  <span className="text-[11px] text-[#616061]">Today at {timeStr}</span>
                </div>
              </div>
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-1 mt-2">
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#1d4e7e] border border-[#1d6fcc] rounded-full text-xs cursor-pointer">
                <span>&#128064;</span> <span className="text-[11px] text-[#c8c8c8]">3</span>
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2e3136] border border-[#3e4146] rounded-full text-xs cursor-pointer hover:border-[#555]">
                <span>&#9989;</span> <span className="text-[11px] text-[#c8c8c8]">1</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
