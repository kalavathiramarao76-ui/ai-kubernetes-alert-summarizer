// Realistic mock performance data generator for monitoring dashboard

export interface MonitoringData {
  responseTimes: number[];       // last 20 response times in ms
  throughput: number;            // requests per minute
  maxThroughput: number;         // max RPM capacity
  errorRate: number;             // percentage
  uptime: number;                // percentage e.g. 99.97
  activeConnections: number;
  p50: number;
  p95: number;
  p99: number;
  rateLimitUsage: number;        // current requests in window
  rateLimitMax: number;          // max requests per minute
  rateLimitCooldown: number;     // seconds until reset (0 if not near limit)
  historicalRates: number[];     // last 10 minutes RPM
  timestamp: number;
}

const STORAGE_KEY = "k8s-monitoring-data";

// Sine-based realistic data with noise
function sineWithNoise(base: number, amplitude: number, frequency: number, phase: number, noise: number): number {
  const t = Date.now() / 1000;
  const sine = Math.sin(t * frequency + phase) * amplitude;
  const n = (Math.random() - 0.5) * 2 * noise;
  return Math.max(0, base + sine + n);
}

function generateResponseTime(): number {
  // Base ~120ms, sine wave gives daily pattern feel, noise for realism
  return Math.round(sineWithNoise(120, 40, 0.3, 0, 25));
}

function generateHistoricalRates(current: number): number[] {
  const rates: number[] = [];
  for (let i = 9; i >= 0; i--) {
    const t = Date.now() / 1000 - i * 60;
    const base = 35;
    const sine = Math.sin(t * 0.05) * 12;
    const noise = (Math.random() - 0.5) * 10;
    rates.push(Math.max(5, Math.round(base + sine + noise)));
  }
  rates[rates.length - 1] = current;
  return rates;
}

export function generateMonitoringData(previous?: MonitoringData | null): MonitoringData {
  // Carry forward response times, adding new one
  const prevTimes = previous?.responseTimes || [];
  const newTime = generateResponseTime();
  const responseTimes = [...prevTimes.slice(-19), newTime];

  const throughput = Math.round(sineWithNoise(42, 15, 0.2, 1.5, 8));
  const maxThroughput = 120;

  // Error rate: mostly low, occasional spikes
  const errorSpike = Math.random() > 0.92 ? Math.random() * 8 : 0;
  const errorRate = Math.round((sineWithNoise(0.8, 0.5, 0.1, 2, 0.3) + errorSpike) * 100) / 100;

  // Uptime: slowly varies around 99.95-99.99
  const uptime = Math.round((99.90 + Math.sin(Date.now() / 50000) * 0.05 + Math.random() * 0.08) * 100) / 100;

  // Active connections: fluctuates
  const activeConnections = Math.round(sineWithNoise(24, 8, 0.15, 3, 5));

  // Latency percentiles (related to response times)
  const sorted = [...responseTimes].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 95;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 180;
  const p99 = Math.round(p95 * (1.2 + Math.random() * 0.5));

  // Rate limiting
  const rateLimitMax = 60;
  const rateLimitUsage = Math.min(rateLimitMax, Math.round(sineWithNoise(15, 12, 0.25, 0, 6)));
  const rateLimitRatio = rateLimitUsage / rateLimitMax;
  const rateLimitCooldown = rateLimitRatio > 0.8 ? Math.round((1 - rateLimitRatio) * 60) : 0;

  const historicalRates = generateHistoricalRates(throughput);

  const data: MonitoringData = {
    responseTimes,
    throughput,
    maxThroughput,
    errorRate: Math.max(0, errorRate),
    uptime: Math.min(100, Math.max(99.5, uptime)),
    activeConnections: Math.max(1, activeConnections),
    p50,
    p95,
    p99,
    rateLimitUsage: Math.max(0, rateLimitUsage),
    rateLimitMax,
    rateLimitCooldown: Math.max(0, rateLimitCooldown),
    historicalRates,
    timestamp: Date.now(),
  };

  // Persist
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return data;
}

export function loadMonitoringData(): MonitoringData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MonitoringData;
  } catch {
    return null;
  }
}
