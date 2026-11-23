"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-join if code is in URL
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode && urlCode.length >= 4) {
      setCode(urlCode);
    }
  }, [searchParams]);

  async function handleJoin() {
    if (!code.trim()) return;
    setJoining(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Joined "${data.name}"!`);
        setTimeout(() => router.push(`/groups/${data.groupId}`), 1500);
      } else {
        setError(data.error ?? "Failed to join");
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-center">
      <Users className="mx-auto mb-4 h-10 w-10 text-primary" />
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Join Study Group</h1>
      <p className="mb-8 text-sm text-muted-foreground">Enter the invite code shared with you</p>

      <div className="space-y-3">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code"
          className="text-center font-mono text-lg uppercase tracking-widest"
          maxLength={20}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="flex items-center justify-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </p>
        )}

        <Button className="w-full" onClick={handleJoin} disabled={joining || !code.trim()}>
          {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Join Group
        </Button>
      </div>
    </div>
  );
}
