const USAGE_KEY = 'aisurgent_usage_count';
const MAX_FREE = 3;

export function getUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(USAGE_KEY) || '0', 10);
}

export function incrementUsage(): number {
  const count = getUsageCount() + 1;
  localStorage.setItem(USAGE_KEY, String(count));
  window.dispatchEvent(new CustomEvent('usage-changed', { detail: count }));
  return count;
}

export function needsAuth(): boolean {
  return getUsageCount() >= MAX_FREE;
}

export function resetUsage(): void {
  localStorage.setItem(USAGE_KEY, '0');
}
