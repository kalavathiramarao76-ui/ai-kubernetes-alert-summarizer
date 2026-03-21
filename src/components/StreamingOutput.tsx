"use client";

import { useState, useCallback } from "react";
import ExportReport from "@/components/ExportReport";
import FavoriteButton from "@/components/FavoriteButton";

interface StreamingOutputProps {
  content: string;
  loading: boolean;
  title?: string;
  icon?: string;
  inputText?: string;
  favoriteType?: "analysis" | "runbook";
}

export default function StreamingOutput({
  content,
  loading,
  title = "Analysis Result",
  inputText = "",
  favoriteType = "analysis",
}: StreamingOutputProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const extractSlackSummary = (text: string): string | null => {
    const slackMatch = text.match(/(?:slack\s*summary|slack[\s-]*ready)[:\s]*\n*([\s\S]*?)(?:\n\n(?:#{1,3}\s)|\n*$)/i);
    return slackMatch ? slackMatch[1].trim() : null;
  };

  if (!content && !loading) return null;

  const slackSummary = extractSlackSummary(content);

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 animate-slide-up"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: loading ? "#eab308" : "#22c55e",
              boxShadow: loading ? "0 0 8px rgba(234, 179, 8, 0.4)" : "0 0 8px rgba(34, 197, 94, 0.4)",
            }}
          />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          {loading && (
            <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              streaming...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {slackSummary && !loading && (
            <button
              onClick={() => copyToClipboard(slackSummary)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:-translate-y-[1px]"
              style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Copy for Slack
            </button>
          )}
          {!loading && content && (
            <FavoriteButton
              content={content}
              title={title}
              input={inputText}
              type={favoriteType}
            />
          )}
          {!loading && content && (
            <ExportReport content={content} title={title} />
          )}
          <button
            onClick={() => copyToClipboard(content)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:-translate-y-[1px]"
            style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        className="rounded-xl p-6 min-h-[200px] font-mono text-sm leading-relaxed"
        style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}
      >
        <div className="ai-output prose prose-invert max-w-none">
          <MarkdownRenderer content={content} />
          {loading && <span className="inline-block w-2 h-5 bg-[#326CE5] ml-0.5 cursor-blink" />}
        </div>
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="rounded-xl p-5 mb-4 overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
            <code className="text-sm font-mono leading-relaxed" style={{ color: "var(--text-secondary)" }}>{codeContent}</code>
          </pre>
        );
        codeContent = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + line;
      return;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-semibold mt-4 mb-2" style={{ color: "var(--text-secondary)" }}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-semibold mt-6 mb-3" style={{ color: "var(--text-primary)" }}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-6 mb-3" style={{ color: "var(--text-primary)" }}>{renderInline(line.slice(2))}</h1>);
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="my-6" style={{ borderColor: "var(--border-subtle)" }} />);
    }
    // Bullet lists
    else if (line.match(/^\s*[-*]\s/)) {
      const indent = line.match(/^(\s*)/)?.[1].length || 0;
      const text = line.replace(/^\s*[-*]\s/, "");
      elements.push(
        <div key={i} className="flex items-start gap-2.5 mb-1.5" style={{ marginLeft: `${indent * 8}px`, color: "var(--text-secondary)" }}>
          <span className="text-[#326CE5] mt-1.5 text-xs">&#9679;</span>
          <span>{renderInline(text)}</span>
        </div>
      );
    }
    // Numbered lists
    else if (line.match(/^\s*\d+\.\s/)) {
      const num = line.match(/^\s*(\d+)\./)?.[1];
      const text = line.replace(/^\s*\d+\.\s/, "");
      elements.push(
        <div key={i} className="flex items-start gap-2.5 mb-1.5" style={{ color: "var(--text-secondary)" }}>
          <span className="text-[#326CE5] font-mono text-sm min-w-[1.5rem]">{num}.</span>
          <span>{renderInline(text)}</span>
        </div>
      );
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-[#326CE5]/40 pl-4 italic my-2" style={{ color: "var(--text-tertiary)" }}>
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />);
    }
    // Paragraph
    else {
      elements.push(<p key={i} className="mb-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{renderInline(line)}</p>);
    }
  });

  // Close any unclosed code block
  if (inCodeBlock && codeContent) {
    elements.push(
      <pre key="code-final" className="rounded-xl p-5 mb-4 overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
        <code className="text-sm font-mono leading-relaxed" style={{ color: "var(--text-secondary)" }}>{codeContent}</code>
      </pre>
    );
  }

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Process inline formatting: bold, italic, code, severity badges
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded-md text-sm font-mono" style={{ background: "var(--code-bg)", color: "#326CE5" }}>
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-semibold" style={{ color: "var(--text-primary)" }}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(<em key={key++} style={{ color: "var(--text-tertiary)" }}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // P0-P4 severity badges — clean rounded pills
    const severityMatch = remaining.match(/^(P[0-4])/);
    if (severityMatch) {
      const sev = severityMatch[1];
      const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        P0: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", border: "rgba(239, 68, 68, 0.2)" },
        P1: { bg: "rgba(249, 115, 22, 0.1)", text: "#f97316", border: "rgba(249, 115, 22, 0.2)" },
        P2: { bg: "rgba(234, 179, 8, 0.1)", text: "#eab308", border: "rgba(234, 179, 8, 0.2)" },
        P3: { bg: "rgba(50, 108, 229, 0.1)", text: "#326CE5", border: "rgba(50, 108, 229, 0.2)" },
        P4: { bg: "rgba(113, 113, 122, 0.1)", text: "#71717a", border: "rgba(113, 113, 122, 0.2)" },
      };
      const c = colorMap[sev];
      parts.push(
        <span
          key={key++}
          className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wide"
          style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
        >
          {sev}
        </span>
      );
      remaining = remaining.slice(sev.length);
      continue;
    }

    // Regular text - consume until next special char
    const nextSpecial = remaining.search(/[`*]|P[0-4]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return <>{parts}</>;
}
