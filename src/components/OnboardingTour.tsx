"use client";

import { useState, useEffect } from "react";

const ONBOARDING_KEY = "k8s_onboarding_done";

const steps = [
  {
    title: "Welcome to K8s Alert Summarizer",
    description:
      "Your AI-powered Kubernetes incident assistant. Paste any alert from Prometheus, PagerDuty, Datadog, or OpsGenie and get instant root cause analysis, severity classification, and actionable runbooks.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    highlight: null,
  },
  {
    title: "Paste an Alert",
    description:
      "Drop in raw JSON, plain text, or structured alert data. We support all major monitoring platforms. The AI will parse and understand any format automatically.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    highlight: "alert-input",
  },
  {
    title: "Get AI Analysis",
    description:
      "Receive severity classification (P0-P4), root cause detection, step-by-step runbooks, alert correlation, and Slack-ready summaries. Save your favorite analyses for quick reference.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    highlight: null,
  },
];

function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#818cf8", "#f59e0b", "#22c55e", "#ef4444", "#a855f7", "#06b6d4"];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 1.5 + Math.random();
  const rotation = Math.random() * 360;
  const size = 6 + Math.random() * 6;

  return (
    <div
      className="confetti-piece"
      style={{
        left: `${left}%`,
        backgroundColor: color,
        width: `${size}px`,
        height: `${size * 0.4}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setTimeout(() => setVisible(true), 500);
    }
  }, []);

  const finish = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setVisible(false);
        setShowConfetti(false);
        setExiting(false);
      }, 400);
    }, 1800);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const skip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 300);
  };

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className={`onboarding-overlay ${exiting ? "onboarding-exit" : ""}`}>
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 60 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <div className={`onboarding-card ${exiting ? "onboarding-card-exit" : ""}`}>
        {/* Glassmorphism glow */}
        <div className="onboarding-glow" />

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`onboarding-dot ${
                  i === step
                    ? "onboarding-dot-active"
                    : i < step
                    ? "onboarding-dot-done"
                    : "onboarding-dot-pending"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {step + 1}/{steps.length}
          </span>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={current.icon} />
          </svg>
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          {current.title}
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
          {current.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={skip}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Skip tour
          </button>
          <button
            onClick={next}
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
          >
            {step === steps.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
