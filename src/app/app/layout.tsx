import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import StatusDashboard from "@/components/StatusDashboard";
import OnboardingTour from "@/components/OnboardingTour";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
        {/* Noise texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />
        {/* Skip to content link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="skip-to-content sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-[#326CE5] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#326CE5]/60"
        >
          Skip to main content
        </a>
        <Navbar />
        <CommandPalette />
        <OnboardingTour />
        <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full relative z-10" role="main" aria-label="Main content">
          <div className="mb-8 flex justify-center sm:justify-end">
            <StatusDashboard />
          </div>
          {children}
        </main>
        {/* Footer */}
        <footer className="border-t py-6 px-4 sm:px-6 lg:px-8 relative z-10" style={{ borderColor: "var(--border-subtle)" }} role="contentinfo" aria-label="Site footer">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-xs font-mono tracking-wide" style={{ color: "var(--text-muted)" }}>
              Autensa AI &middot; K8s Alert Summarizer
            </span>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                aria-label="WCAG 2.1 AA compliant"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                WCAG 2.1 AA
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Accessible &middot; Keyboard navigable
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
