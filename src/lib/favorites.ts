export interface Favorite {
  id: string;
  type: "analysis" | "runbook";
  title: string;
  content: string;
  input: string;
  timestamp: number;
}

const STORAGE_KEY = "k8s-favorites";

function getAll(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(favorites: Favorite[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent("favorites-updated"));
}

export function getFavorites(): Favorite[] {
  return getAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function getFavoriteCount(): number {
  return getAll().length;
}

export function isFavorited(id: string): boolean {
  return getAll().some((f) => f.id === id);
}

export function addFavorite(fav: Omit<Favorite, "id" | "timestamp">): Favorite {
  const all = getAll();
  const newFav: Favorite = {
    ...fav,
    id: `fav_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  all.push(newFav);
  save(all);
  return newFav;
}

export function removeFavorite(id: string): void {
  const all = getAll().filter((f) => f.id !== id);
  save(all);
}

export function removeFavoriteByContent(content: string): void {
  const all = getAll().filter((f) => f.content !== content);
  save(all);
}

export function findFavoriteByContent(content: string): Favorite | undefined {
  return getAll().find((f) => f.content === content);
}

export function clearAllFavorites(): void {
  save([]);
}
