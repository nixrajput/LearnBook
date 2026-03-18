"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete account");
        return;
      }

      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        Delete my account
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">This action is permanent</span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Type <span className="font-mono font-medium text-foreground">delete</span> to confirm.
      </p>
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Type delete to confirm"
        className="mb-3"
      />
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={confirmText !== "delete" || deleting}
        >
          {deleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Permanently delete account"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setConfirming(false);
            setConfirmText("");
            setError(null);
          }}
          disabled={deleting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
