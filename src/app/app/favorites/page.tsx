"use client";

import { useState, useEffect } from "react";
import { getFavorites, removeFavorite, clearAllFavorites, type Favorite } from "@/lib/favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filter, setFilter] = useState<"all" | "analysis" | "runbook">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = () => setFavorites(getFavorites());

  useEffect(() => {
    refresh();
    window.addEventListener("favorites-updated", refresh);
    return () => window.removeEventListener("favorites-updated", refresh);
  }, []);

  const filtered = favorites
    .filter((f) => filter === "all" || f.type === filter)
    .filter(
      (f) =>
        !searchQuery.trim() ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.input.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleRemove = (id: string) => {
    removeFavorite(id);
    refresh();
  };

  const handleClearAll = () => {
    if (confirm("Remove all favorites? This cannot be undone.")) {
      clearAllFavorites();
      refresh();
    }
  };

  const copyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // fallback
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Favorites
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {favorites.length} saved {favorites.length === 1 ? "item" : "items"}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border-subtle)",
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters + Search */}
      {favorites.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--surface)" }}>
            {(["all", "analysis", "runbook"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-indigo-500/20 text-indigo-400 shadow-sm"
                    : ""
                }`}
                style={filter !== f ? { color: "var(--text-muted)" } : {}}
              >
                {f === "all" ? "All" : f === "analysis" ? "Analyses" : "Runbooks"}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorites..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
              }}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {favorites.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No favorites yet
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Star any analysis or runbook result to save it here for quick reference.
          </p>
        </div>
      )}

      {/* No results for filter */}
      {favorites.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No favorites match your filter.
          </p>
        </div>
      )}

      {/* Favorites list */}
      <div className="space-y-3">
        {filtered.map((fav) => {
          const isExpanded = expandedId === fav.id;
          return (
            <div
              key={fav.id}
              className="rounded-xl p-4 transition-all animate-fade-in"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        fav.type === "analysis"
                          ? "bg-indigo-500/15 text-indigo-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {fav.type}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {formatDate(fav.timestamp)}
                    </span>
                  </div>
                  <h3
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {fav.title}
                  </h3>
                  <p
                    className="text-xs mt-1 line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {fav.content.slice(0, 200)}...
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : fav.id)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-zinc-800/50"
                    style={{ color: "var(--text-muted)" }}
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => copyContent(fav.content)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-zinc-800/50"
                    style={{ color: "var(--text-muted)" }}
                    title="Copy content"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemove(fav.id)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 text-zinc-500 hover:text-red-400"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div
                  className="mt-4 pt-4 text-sm whitespace-pre-wrap font-mono max-h-96 overflow-auto rounded-lg p-4"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    background: "var(--input-bg)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {fav.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
