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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? "bg-amber-500 animate-pulse" : "bg-terminal-green"}`} />
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          {loading && <span className="text-xs text-zinc-500 font-mono">streaming...</span>}
        </div>
        <div className="flex items-center gap-2">
          {slackSummary && !loading && (
            <button
              onClick={() => copyToClipboard(slackSummary)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-medium transition-colors"
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-terminal-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className="rounded-lg p-5 min-h-[200px]" style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}>
        <div className="ai-output prose prose-invert max-w-none">
          <MarkdownRenderer content={content} />
          {loading && <span className="inline-block w-2 h-5 bg-indigo-500 ml-0.5 cursor-blink" />}
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
          <pre key={`code-${i}`} className="rounded-lg p-4 mb-3 overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <code className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{codeContent}</code>
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
      elements.push(<h3 key={i} className="text-base font-semibold mt-3 mb-1" style={{ color: "var(--text-secondary)" }}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-semibold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-4 mb-2" style={{ color: "var(--text-primary)" }}>{renderInline(line.slice(2))}</h1>);
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="my-4" style={{ borderColor: "var(--border)" }} />);
    }
    // Bullet lists
    else if (line.match(/^\s*[-*]\s/)) {
      const indent = line.match(/^(\s*)/)?.[1].length || 0;
      const text = line.replace(/^\s*[-*]\s/, "");
      elements.push(
        <div key={i} className="flex items-start gap-2 mb-1" style={{ marginLeft: `${indent * 8}px`, color: "var(--text-secondary)" }}>
          <span className="text-indigo-400 mt-1.5 text-xs">&#9679;</span>
          <span>{renderInline(text)}</span>
        </div>
      );
    }
    // Numbered lists
    else if (line.match(/^\s*\d+\.\s/)) {
      const num = line.match(/^\s*(\d+)\./)?.[1];
      const text = line.replace(/^\s*\d+\.\s/, "");
      elements.push(
        <div key={i} className="flex items-start gap-2 mb-1" style={{ color: "var(--text-secondary)" }}>
          <span className="text-indigo-400 font-mono text-sm min-w-[1.5rem]">{num}.</span>
          <span>{renderInline(text)}</span>
        </div>
      );
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-indigo-500 pl-4 italic my-1" style={{ color: "var(--text-tertiary)" }}>
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    }
    // Paragraph
    else {
      elements.push(<p key={i} className="mb-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{renderInline(line)}</p>);
    }
  });

  // Close any unclosed code block
  if (inCodeBlock && codeContent) {
    elements.push(
      <pre key="code-final" className="rounded-lg p-4 mb-3 overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <code className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{codeContent}</code>
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
        <code key={key++} className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: "var(--code-bg)", color: "#818cf8" }}>
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

    // P0-P4 severity badges
    const severityMatch = remaining.match(/^(P[0-4])/);
    if (severityMatch) {
      const sev = severityMatch[1];
      const colorMap: Record<string, string> = {
        P0: "bg-red-500/20 text-red-400 border-red-500/30",
        P1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        P2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        P3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        P4: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      };
      parts.push(
        <span key={key++} className={`inline-flex px-1.5 py-0.5 rounded text-xs font-bold border ${colorMap[sev]}`}>
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
