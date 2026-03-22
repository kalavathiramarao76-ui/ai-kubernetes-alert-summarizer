"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Reduced motion check ─────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ── Scroll fade-up via IntersectionObserver ──────────────────────────
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeUp({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useFadeUp();
  return (
    <div ref={ref} className={`fade-up-section ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ── Letter-by-letter hero reveal ─────────────────────────────────────
function LetterReveal({ text, className = "", stagger = 30, delay = 0 }: { text: string; className?: string; stagger?: number; delay?: number }) {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="letter-reveal-char"
          style={{
            transitionDelay: visible ? `${i * stagger}ms` : "0ms",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(0.3em)",
          }}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// ── Stats counter animation ──────────────────────────────────────────
function AnimatedCounter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || reduced) {
      if (started) setCount(value);
      return;
    }
    let frame: number;
    const duration = 800;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, reduced]);

  return (
    <span ref={ref}>
      {count}{suffix} {label}
    </span>
  );
}

// ── Terminal typing animation ────────────────────────────────────────
function TerminalTyping({ lines, typingSpeed = 18 }: { lines: { text: string; className?: string }[]; typingSpeed?: number }) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const totalChars = lines.reduce((sum, l) => sum + l.text.length, 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (reduced) { setVisibleChars(totalChars); return; }
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleChars(current);
      if (current >= totalChars) clearInterval(interval);
    }, typingSpeed);
    return () => clearInterval(interval);
  }, [started, totalChars, typingSpeed, reduced]);

  let charOffset = 0;
  return (
    <div ref={ref}>
      {lines.map((line, i) => {
        const lineStart = charOffset;
        charOffset += line.text.length;
        const charsToShow = Math.max(0, Math.min(visibleChars - lineStart, line.text.length));
        if (charsToShow === 0 && visibleChars <= lineStart) return null;
        return (
          <div key={i} className={line.className || ""}>
            {line.text.slice(0, charsToShow)}
            {charsToShow < line.text.length && charsToShow > 0 && (
              <span className="cursor-blink">_</span>
            )}
          </div>
        );
      })}
      {visibleChars >= totalChars && (
        <div className="mt-4 text-zinc-700">
          Done <span className="cursor-blink">_</span>
        </div>
      )}
    </div>
  );
}

// ── Terminal block component ─────────────────────────────────────────
function Terminal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[#0a0a0f] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      <div className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900/40 border-b border-zinc-800/40">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]/70" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]/70" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]/70" />
        <span className="text-[11px] text-zinc-600 ml-3 font-mono tracking-wide">{title}</span>
      </div>
      <div className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100 relative overflow-hidden">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }} />

      {/* K8s blue gradient wash — single, subtle */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_center,_rgba(50,108,229,0.08)_0%,_transparent_70%)]" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="relative z-10 border-b border-zinc-800/30">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#326CE5] rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-zinc-300 tracking-tight">AlertLens AI</span>
          </div>
          <Link
            href="/app"
            className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-medium transition-colors"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-32 pb-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-50 leading-[0.95]">
            <LetterReveal text="Understand" stagger={30} /><br />
            <LetterReveal text="every alert." stagger={30} delay={350} />
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-zinc-500 max-w-xl mx-auto leading-relaxed font-light hero-subtitle">
            Paste Kubernetes alerts from any monitoring system.<br className="hidden sm:block" />
            Get root cause analysis in seconds.
          </p>
          <div className="mt-12">
            <Link
              href="/app"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#326CE5] hover:bg-[#4080f0] text-white rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:shadow-[#326CE5]/20"
            >
              Analyze Alerts
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ribbon ────────────────────────────────────────── */}
      <FadeUp>
        <div className="relative z-10 border-y border-zinc-800/30 py-8">
          <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-mono text-zinc-500 tracking-wide">
            <span><AnimatedCounter value={12} label="Alert Types" /></span>
            <span className="text-zinc-700 hidden sm:inline" aria-hidden="true">&bull;</span>
            <span>P0&ndash;P4 <span className="severity-pulse-badge">Severity</span></span>
            <span className="text-zinc-700 hidden sm:inline" aria-hidden="true">&bull;</span>
            <span>Slack Integration</span>
            <span className="text-zinc-700 hidden sm:inline" aria-hidden="true">&bull;</span>
            <span>No API Keys Required</span>
          </div>
        </div>
      </FadeUp>

      {/* ── Section 1: Analyze ──────────────────────────────────── */}
      <FadeUp>
        <section className="relative z-10 py-32 px-6">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-mono text-[#326CE5] tracking-widest uppercase mb-4">Analyze</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 leading-tight">
                From noise<br />to signal.
              </h2>
              <p className="mt-6 text-zinc-500 text-lg leading-relaxed">
                Paste a raw Prometheus, Datadog, or CloudWatch alert. AlertLens reads the JSON, classifies severity,
                identifies the root cause, and returns a plain-English summary your entire team can act on.
              </p>
            </div>
            <Terminal title="alertlens ~ analyze">
              <TerminalTyping
                typingSpeed={18}
                lines={[
                  { text: "$ alertlens analyze --source prometheus", className: "text-zinc-600" },
                  { text: "Parsing alert payload...", className: "mt-3 text-zinc-600 text-[12px]" },
                  { text: "Alert: KubePodCrashLooping", className: "mt-4 text-zinc-300" },
                  { text: "Namespace: production", className: "mt-1.5 text-zinc-400" },
                  { text: "Pod: api-server-7d4f8b6c9-x2k9p", className: "mt-1.5 text-zinc-400" },
                  { text: "Severity: P1 — Critical", className: "mt-4 pt-3 border-t border-zinc-800/50 text-red-400 font-bold" },
                  { text: "Root Cause: OOM Kill — memory limit 512Mi exceeded", className: "mt-1.5 text-emerald-400" },
                  { text: "Action: Increase limit to 1Gi, profile heap allocation", className: "mt-1.5 text-zinc-300" },
                ]}
              />
            </Terminal>
          </div>
        </section>
      </FadeUp>

      {/* ── Section 2: Runbooks ─────────────────────────────────── */}
      <FadeUp>
        <section className="relative z-10 py-32 px-6 border-t border-zinc-800/20">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Terminal title="alertlens ~ runbook">
                <div className="text-zinc-600">$ alertlens runbook --alert CrashLoopBackOff</div>
                <div className="mt-4 text-zinc-400">
                  <span className="text-[#326CE5] font-semibold">Runbook: CrashLoopBackOff Recovery</span>
                </div>
                <div className="mt-3 text-zinc-500">Step 1 <span className="text-zinc-600">─</span> Check pod events</div>
                <div className="text-emerald-400/80 ml-4 mt-1">kubectl describe pod api-server-7d4f8b6c9-x2k9p -n production</div>
                <div className="mt-3 text-zinc-500">Step 2 <span className="text-zinc-600">─</span> Inspect container logs</div>
                <div className="text-emerald-400/80 ml-4 mt-1">kubectl logs api-server-7d4f8b6c9-x2k9p -n production --previous</div>
                <div className="mt-3 text-zinc-500">Step 3 <span className="text-zinc-600">─</span> Check resource limits</div>
                <div className="text-emerald-400/80 ml-4 mt-1">kubectl get pod api-server-7d4f8b6c9-x2k9p -n production -o jsonpath=&apos;&#123;.spec.containers[*].resources&#125;&apos;</div>
                <div className="mt-3 text-zinc-500">Step 4 <span className="text-zinc-600">─</span> Apply fix</div>
                <div className="text-emerald-400/80 ml-4 mt-1">kubectl set resources deploy/api-server -n production --limits=memory=1Gi</div>
                <div className="mt-4 text-zinc-700">
                  4 steps generated <span className="cursor-blink">_</span>
                </div>
              </Terminal>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-mono text-[#326CE5] tracking-widest uppercase mb-4">Runbooks</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 leading-tight">
                kubectl commands.<br />Ready to paste.
              </h2>
              <p className="mt-6 text-zinc-500 text-lg leading-relaxed">
                Every alert gets a step-by-step runbook with exact kubectl commands. No more digging through
                wikis at 3 AM. Copy, paste, resolve.
              </p>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ── Section 3: Correlate ────────────────────────────────── */}
      <FadeUp>
        <section className="relative z-10 py-32 px-6 border-t border-zinc-800/20">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-mono text-[#326CE5] tracking-widest uppercase mb-4">Correlate</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 leading-tight">
                See the<br />cascade.
              </h2>
              <p className="mt-6 text-zinc-500 text-lg leading-relaxed">
                Paste multiple alerts at once. AlertLens maps relationships between them, identifies cascading
                failures, and surfaces the single root cause behind the noise.
              </p>
            </div>
            <Terminal title="alertlens ~ correlate">
              <div className="text-zinc-600">$ alertlens correlate --alerts 4</div>
              <div className="mt-3 text-zinc-600 text-[12px]">Analyzing relationships...</div>
              <div className="mt-4">
                <span className="text-[#326CE5]">Correlation Graph:</span>
              </div>
              <div className="mt-2 text-zinc-500">
                <div className="text-red-400/80">HighMemoryUsage <span className="text-zinc-700">&rarr;</span> OOMKilled</div>
                <div className="text-zinc-700 ml-6">|</div>
                <div className="text-amber-400/80 ml-6">CrashLoopBackOff</div>
                <div className="text-zinc-700 ml-10">|</div>
                <div className="text-amber-400/80 ml-10">ServiceUnavailable</div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/50">
                <span className="text-zinc-500">Root Cause:</span>
                <span className="text-emerald-400 ml-2">Memory leak in api-server v2.4.1</span>
              </div>
              <div className="mt-1.5">
                <span className="text-zinc-500">Blast Radius:</span>
                <span className="text-zinc-300 ml-2">3 services, 12 pods affected</span>
              </div>
              <div className="mt-4 text-zinc-700">
                4 alerts &rarr; 1 root cause <span className="cursor-blink">_</span>
              </div>
            </Terminal>
          </div>
        </section>
      </FadeUp>

      {/* ── Bottom CTA ──────────────────────────────────────────── */}
      <FadeUp>
        <section className="relative z-10 py-40 px-6 border-t border-zinc-800/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-50 leading-[0.95]">
              Stop reading<br />raw JSON.
            </h2>
            <p className="mt-8 text-lg text-zinc-500 max-w-md mx-auto leading-relaxed font-light">
              No signup. No API keys. Paste an alert and get answers.
            </p>
            <div className="mt-12">
              <Link
                href="/app"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#326CE5] hover:bg-[#4080f0] text-white rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:shadow-[#326CE5]/20"
              >
                Start Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-800/30 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm text-zinc-600">
            <div className="w-5 h-5 bg-[#326CE5] rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            AlertLens AI
          </div>
          <a
            href="https://github.com/kalavathiramarao76-ui/ai-kubernetes-alert-summarizer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
