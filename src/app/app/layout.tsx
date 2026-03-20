import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import StatusDashboard from "@/components/StatusDashboard";
import OnboardingTour from "@/components/OnboardingTour";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-grid-pattern" style={{ background: "var(--background)" }}>
        <Navbar />
        <CommandPalette />
        <OnboardingTour />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-center sm:justify-end">
            <StatusDashboard />
          </div>
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
}
