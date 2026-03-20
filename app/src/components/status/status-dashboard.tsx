"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latency?: number;
  message?: string;
}

interface HealthResponse {
  status: "operational" | "degraded" | "down";
  timestamp: string;
  responseTime: number;
  services: ServiceStatus[];
  version: string;
  environment: string;
}

const STATUS_CONFIG = {
  operational: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Operational",
    dot: "bg-emerald-500",
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Degraded",
    dot: "bg-amber-500",
  },
  down: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    label: "Down",
    dot: "bg-destructive",
  },
};

export function StatusDashboard() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastChecked(new Date());
    } catch {
      setError("Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border bg-card" />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <XCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <p className="font-medium text-destructive">Unable to reach status API</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchStatus}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const overallConfig = STATUS_CONFIG[data.status];
  const OverallIcon = overallConfig.icon;

  return (
    <div className="space-y-6">
      {/* Overall status banner */}
      <div className={`rounded-xl border ${overallConfig.border} ${overallConfig.bg} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OverallIcon className={`h-6 w-6 ${overallConfig.color}`} />
            <div>
              <h2 className="font-semibold">{overallConfig.label}</h2>
              <p className="text-sm text-muted-foreground">
                All systems {data.status === "operational" ? "are" : "may not be"} functioning
                normally
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Service status cards */}
      <div className="space-y-3">
        {data.services.map((service) => {
          const config = STATUS_CONFIG[service.status];
          const Icon = config.icon;
          return (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                <div>
                  <h3 className="text-sm font-medium">{service.name}</h3>
                  {service.message && (
                    <p className="text-xs text-muted-foreground">{service.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {service.latency !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {service.latency}ms
                  </div>
                )}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Response time:{" "}
            <strong className="font-medium text-foreground">{data.responseTime}ms</strong>
          </span>
          <span>
            Version: <strong className="font-medium text-foreground">{data.version}</strong>
          </span>
          <span>
            Environment: <strong className="font-medium text-foreground">{data.environment}</strong>
          </span>
        </div>
        {lastChecked && <span>Last checked: {lastChecked.toLocaleTimeString()}</span>}
      </div>

      {/* Auto-refresh note */}
      <p className="text-center text-xs text-muted-foreground">
        This page auto-refreshes every 30 seconds.
      </p>
    </div>
  );
}
