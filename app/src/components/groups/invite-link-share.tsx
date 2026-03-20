"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InviteLinkShareProps {
  groupId: string;
  inviteCode: string;
  isOwner: boolean;
}

export function InviteLinkShare({ groupId, inviteCode, isOwner }: InviteLinkShareProps) {
  const [code, setCode] = useState(inviteCode);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${appUrl}/groups/join?code=${code}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCode(data.inviteCode);
      }
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={inviteUrl} readOnly className="h-9 font-mono text-xs" />
        <Button size="sm" variant="outline" className="h-9 shrink-0 gap-1.5" onClick={handleCopy}>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {isOwner && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          {regenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Regenerate code
        </Button>
      )}
    </div>
  );
}
