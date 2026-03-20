import type { Metadata } from "next";
import { StatusDashboard } from "@/components/status/status-dashboard";

export const metadata: Metadata = {
  title: "System Status",
  description: "Real-time status of LearnBook services and infrastructure.",
};

export const dynamic = "force-dynamic";

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">System Status</h1>
        <p className="text-muted-foreground">
          Real-time health of LearnBook services and infrastructure.
        </p>
      </div>
      <StatusDashboard />
    </div>
  );
}
