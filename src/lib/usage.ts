const USAGE_KEY = 'aisurgent_usage_count';
const MAX_FREE = 5;

export function getUsageCount(): number {
  return parseInt(localStorage.getItem(USAGE_KEY) || '0', 10);
}

export function incrementUsage(): number {
  const count = getUsageCount() + 1;
  localStorage.setItem(USAGE_KEY, String(count));
  return count;
}

export function needsAuth(): boolean {
  return getUsageCount() >= MAX_FREE;
}

export function resetUsage(): void {
  localStorage.setItem(USAGE_KEY, '0');
}
