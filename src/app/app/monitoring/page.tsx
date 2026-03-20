"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MonitoringData,
  generateMonitoringData,
  loadMonitoringData,
} from "@/lib/monitoring";

// ─── Animated Number Counter ─────────────────────────────────
function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 600,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ─── SVG Sparkline with gradient fill ────────────────────────
function Sparkline({ data, width = 320, height = 80 }: { data: number[]; width?: number; height?: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);

  const minVal = Math.min(...data) * 0.9;
  const maxVal = Math.max(...data) * 1.1 || 1;
  const range = maxVal - minVal || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - minVal) / range) * (height - 8) - 4,
  }));

  // Smooth curve through points
  let d = `M ${points[0]?.x ?? 0} ${points[0]?.y ?? height}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Area path for gradient fill
  const areaD =
    d +
    ` L ${points[points.length - 1]?.x ?? width} ${height} L ${points[0]?.x ?? 0} ${height} Z`;

  useEffect(() => {
    if (pathRef.current && !drawn) {
      const len = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${len}`;
      pathRef.current.style.strokeDashoffset = `${len}`;
      requestAnimationFrame(() => {
        if (pathRef.current) {
          pathRef.current.style.transition = "stroke-dashoffset 1s ease-out";
          pathRef.current.style.strokeDashoffset = "0";
        }
      });
      setDrawn(true);
    }
  }, [drawn]);

  // Reset animation when data changes significantly
  useEffect(() => {
    setDrawn(false);
  }, [data.length]);

  if (data.length < 2) return null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkGrad)" />
      <path ref={pathRef} d={d} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      {/* Current value dot */}
      <circle
        cx={points[points.length - 1]?.x}
        cy={points[points.length - 1]?.y}
        r="3"
        fill="#818cf8"
        className="monitoring-pulse-dot"
      />
    </svg>
  );
}

// ─── Circular Gauge (Speedometer) ────────────────────────────
function ThroughputGauge({ value, max }: { value: number; max: number }) {
  const ratio = Math.min(value / max, 1);
  const radius = 60;
  const stroke = 8;
  const center = 70;
  // Arc from 135deg to 405deg (270deg sweep)
  const startAngle = 135;
  const endAngle = 405;
  const sweepAngle = (endAngle - startAngle) * ratio;
  const currentAngle = startAngle + sweepAngle;

  const polarToCart = (angle: number, r: number) => ({
    x: center + r * Math.cos((angle * Math.PI) / 180),
    y: center + r * Math.sin((angle * Math.PI) / 180),
  });

  // Background arc
  const bgStart = polarToCart(startAngle, radius);
  const bgEnd = polarToCart(endAngle, radius);
  const bgArc = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  // Value arc
  const valStart = polarToCart(startAngle, radius);
  const valEnd = polarToCart(currentAngle, radius);
  const largeArc = sweepAngle > 180 ? 1 : 0;
  const valArc = `M ${valStart.x} ${valStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${valEnd.x} ${valEnd.y}`;

  // Needle
  const needleTip = polarToCart(currentAngle, radius - 15);
  const needleBase1 = polarToCart(currentAngle + 90, 3);
  const needleBase2 = polarToCart(currentAngle - 90, 3);

  // Color based on ratio
  const color = ratio < 0.5 ? "#22c55e" : ratio < 0.75 ? "#eab308" : "#ef4444";

  return (
    <svg viewBox="0 0 140 100" className="w-full max-w-[200px] mx-auto">
      <defs>
        <filter id="gaugeGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Background arc */}
      <path d={bgArc} fill="none" stroke="#27272a" strokeWidth={stroke} strokeLinecap="round" />
      {/* Value arc */}
      <path
        d={valArc}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        filter="url(#gaugeGlow)"
        className="monitoring-gauge-arc"
      />
      {/* Needle */}
      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${center},${center} ${needleBase2.x},${needleBase2.y}`}
        fill={color}
        opacity="0.8"
        className="monitoring-gauge-needle"
      />
      {/* Center dot */}
      <circle cx={center} cy={center} r="4" fill={color} />
      {/* Value text */}
      <text x={center} y={center + 20} textAnchor="middle" fill="#e4e4e7" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight="600">
        {value}
      </text>
      <text x={center} y={center + 30} textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="Inter, sans-serif">
        req/min
      </text>
    </svg>
  );
}

// ─── Rate Limit Bar ──────────────────────────────────────────
function RateLimitBar({
  usage,
  max,
  cooldown,
}: {
  usage: number;
  max: number;
  cooldown: number;
}) {
  const ratio = Math.min(usage / max, 1);
  const color = ratio < 0.5 ? "#22c55e" : ratio < 0.8 ? "#eab308" : "#ef4444";
  const glowColor =
    ratio < 0.5
      ? "rgba(34,197,94,0.2)"
      : ratio < 0.8
      ? "rgba(234,179,8,0.2)"
      : "rgba(239,68,68,0.3)";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 font-medium">Rate Limit Usage</span>
        <span className="text-xs font-mono text-zinc-300">
          {usage}/{max} <span className="text-zinc-500">req/min</span>
        </span>
      </div>
      <div className="h-3 bg-zinc-800/80 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full monitoring-rate-bar"
          style={{
            width: `${ratio * 100}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 12px ${glowColor}`,
          }}
        />
      </div>
      {cooldown > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="monitoring-pulse-dot inline-block w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-zinc-400">
            Approaching limit — resets in <span className="font-mono text-zinc-300">{cooldown}s</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Historical Rate Mini Bar Chart ──────────────────────────
function HistoricalRateChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 font-medium">Requests / Minute (last 10 min)</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {data.map((val, i) => {
          const h = (val / max) * 100;
          const ratio = val / 60;
          const color = ratio < 0.5 ? "#818cf8" : ratio < 0.8 ? "#eab308" : "#ef4444";
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm monitoring-bar-grow"
                style={{
                  height: `${h}%`,
                  background: color,
                  opacity: i === data.length - 1 ? 1 : 0.6,
                  animationDelay: `${i * 50}ms`,
                }}
              />
              {(i === 0 || i === data.length - 1) && (
                <span className="text-[9px] text-zinc-600 font-mono">
                  {i === 0 ? "-10m" : "now"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────
function MetricCard({
  title,
  children,
  glowColor,
  span = 1,
}: {
  title: string;
  children: React.ReactNode;
  glowColor?: string;
  span?: number;
}) {
  return (
    <div
      className={`monitoring-card ${span === 2 ? "md:col-span-2" : ""}`}
      style={{
        borderColor: glowColor ? `${glowColor}40` : undefined,
        boxShadow: glowColor ? `0 0 20px ${glowColor}15, inset 0 1px 0 ${glowColor}10` : undefined,
      }}
    >
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main Monitoring Page ────────────────────────────────────
export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [uptimeAnimated, setUptimeAnimated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    const prev = loadMonitoringData();
    const next = generateMonitoringData(prev);
    setData(next);
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 5000);
    // Trigger uptime count-up
    setTimeout(() => setUptimeAnimated(true), 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const errorColor =
    data.errorRate < 1 ? "#22c55e" : data.errorRate < 5 ? "#eab308" : "#ef4444";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance Monitoring
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time API performance metrics, latency percentiles, and rate limit tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="monitoring-pulse-dot inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-500 font-mono">LIVE</span>
          <span className="text-xs text-zinc-600">|</span>
          <span className="text-xs text-zinc-600 font-mono">5s refresh</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="monitoring-grid">
        {/* Response Time Sparkline */}
        <MetricCard title="Response Time" glowColor="#818cf8" span={2}>
          <div className="flex items-end justify-between mb-2">
            <div className="text-2xl font-bold text-zinc-100">
              <AnimatedNumber value={data.responseTimes[data.responseTimes.length - 1] || 0} suffix="ms" />
            </div>
            <span className="text-xs text-zinc-500 font-mono">last 20 calls</span>
          </div>
          <div className="h-20">
            <Sparkline data={data.responseTimes} />
          </div>
        </MetricCard>

        {/* Throughput Gauge */}
        <MetricCard title="Throughput" glowColor={data.throughput / data.maxThroughput < 0.5 ? "#22c55e" : data.throughput / data.maxThroughput < 0.75 ? "#eab308" : "#ef4444"}>
          <ThroughputGauge value={data.throughput} max={data.maxThroughput} />
        </MetricCard>

        {/* Error Rate */}
        <MetricCard title="Error Rate" glowColor={errorColor}>
          <div className="text-3xl font-bold" style={{ color: errorColor }}>
            <AnimatedNumber value={data.errorRate} decimals={2} suffix="%" />
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {data.errorRate < 1 ? "Healthy" : data.errorRate < 5 ? "Elevated" : "Critical"}
          </div>
        </MetricCard>

        {/* Uptime */}
        <MetricCard title="Uptime" glowColor="#22c55e">
          <div className="text-3xl font-bold text-emerald-400">
            {uptimeAnimated ? (
              <AnimatedNumber value={data.uptime} decimals={2} suffix="%" duration={1500} />
            ) : (
              <span className="font-mono">0.00%</span>
            )}
          </div>
          <div className="mt-2 text-xs text-zinc-500">30-day rolling average</div>
        </MetricCard>

        {/* Active Connections */}
        <MetricCard title="Active Connections" glowColor="#818cf8">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-indigo-400">
              <AnimatedNumber value={data.activeConnections} />
            </div>
            <span className="monitoring-pulse-dot inline-block w-3 h-3 rounded-full bg-indigo-500" />
          </div>
          <div className="mt-2 text-xs text-zinc-500">WebSocket + HTTP keep-alive</div>
        </MetricCard>

        {/* P50/P95/P99 Latency */}
        <MetricCard title="Latency Percentiles" glowColor="#a78bfa" span={2}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "P50", value: data.p50, color: "#22c55e" },
              { label: "P95", value: data.p95, color: "#eab308" },
              { label: "P99", value: data.p99, color: "#ef4444" },
            ].map((p) => (
              <div key={p.label} className="text-center">
                <div className="text-xs text-zinc-500 font-semibold mb-1">{p.label}</div>
                <div className="text-xl font-bold font-mono" style={{ color: p.color }}>
                  <AnimatedNumber value={p.value} suffix="ms" />
                </div>
              </div>
            ))}
          </div>
        </MetricCard>

        {/* Rate Limit Bar */}
        <MetricCard
          title="Rate Limiting"
          glowColor={
            data.rateLimitUsage / data.rateLimitMax < 0.5
              ? "#22c55e"
              : data.rateLimitUsage / data.rateLimitMax < 0.8
              ? "#eab308"
              : "#ef4444"
          }
          span={2}
        >
          <RateLimitBar
            usage={data.rateLimitUsage}
            max={data.rateLimitMax}
            cooldown={data.rateLimitCooldown}
          />
        </MetricCard>

        {/* Historical Rate Chart */}
        <MetricCard title="Request History" glowColor="#818cf8" span={2}>
          <HistoricalRateChart data={data.historicalRates} />
        </MetricCard>
      </div>
    </div>
  );
}
