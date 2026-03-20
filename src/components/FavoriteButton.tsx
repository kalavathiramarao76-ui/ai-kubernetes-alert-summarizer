"use client";

import { useState, useEffect } from "react";
import {
  addFavorite,
  removeFavoriteByContent,
  findFavoriteByContent,
} from "@/lib/favorites";

interface FavoriteButtonProps {
  content: string;
  title: string;
  input: string;
  type: "analysis" | "runbook";
}

export default function FavoriteButton({
  content,
  title,
  input,
  type,
}: FavoriteButtonProps) {
  const [starred, setStarred] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setStarred(!!findFavoriteByContent(content));
  }, [content]);

  const toggle = () => {
    if (starred) {
      removeFavoriteByContent(content);
      setStarred(false);
    } else {
      addFavorite({ type, title, content, input });
      setStarred(true);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        starred
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
      }`}
      title={starred ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-300 ${
          animating ? "favorite-star-pop" : ""
        }`}
        viewBox="0 0 24 24"
        fill={starred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      {starred ? "Saved" : "Save"}
      {animating && (
        <>
          <span className="favorite-spark favorite-spark-1" />
          <span className="favorite-spark favorite-spark-2" />
          <span className="favorite-spark favorite-spark-3" />
        </>
      )}
    </button>
  );
}
