"use client";

import { useState, useEffect } from "react";
import { Monitor, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface SessionEntry {
  id: string;
  expires: string;
  isCurrent: boolean;
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  async function handleRevokeSession() {
    if (!confirmRevokeId) return;
    setRevoking(confirmRevokeId);
    try {
      const res = await fetch("/api/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: confirmRevokeId }),
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== confirmRevokeId));
      }
    } finally {
      setRevoking(null);
      setConfirmRevokeId(null);
    }
  }

  async function handleRevokeAll() {
    setRevoking("all");
    try {
      await fetch("/api/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } finally {
      setRevoking(null);
      setConfirmRevokeAll(false);
    }
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
        </p>
        {otherSessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmRevokeAll(true)}
            disabled={revoking !== null}
          >
            {revoking === "all" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Revoke other sessions
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No active sessions</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const expires = new Date(session.expires);
            const isExpired = expires < new Date();
            return (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Session</p>
                      {session.isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-600 dark:text-emerald-400"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isExpired ? "Expired" : `Expires ${expires.toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmRevokeId(session.id)}
                    disabled={revoking !== null}
                  >
                    {revoking === session.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmRevokeAll}
        onOpenChange={setConfirmRevokeAll}
        title="Revoke All Other Sessions"
        description="This will sign you out from all other devices. You will remain signed in on this device only."
        confirmLabel="Revoke All"
        variant="warning"
        onConfirm={handleRevokeAll}
        loading={revoking === "all"}
      />

      <ConfirmDialog
        open={!!confirmRevokeId}
        onOpenChange={(open) => !open && setConfirmRevokeId(null)}
        title="Revoke Session"
        description="This will sign out the device using this session. They will need to sign in again."
        confirmLabel="Revoke"
        variant="warning"
        onConfirm={handleRevokeSession}
        loading={revoking === confirmRevokeId}
      />
    </div>
  );
}
