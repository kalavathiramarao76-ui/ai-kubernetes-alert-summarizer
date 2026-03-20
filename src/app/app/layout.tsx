import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import StatusDashboard from "@/components/StatusDashboard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Navbar />
      <CommandPalette />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-center sm:justify-end">
          <StatusDashboard />
        </div>
        {children}
      </main>
    </div>
  );
}
