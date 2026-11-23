"use client";

import { useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Discussion {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  replies?: Discussion[];
}

interface DiscussionThreadProps {
  groupId: string;
  chapterId: string;
  discussions: Discussion[];
  onRefresh: () => void;
}

export function DiscussionThread({
  groupId,
  chapterId,
  discussions,
  onRefresh,
}: DiscussionThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost(parentId?: string) {
    const content = parentId ? replyText : newComment;
    if (!content.trim() || posting) return;
    setPosting(true);

    try {
      const res = await fetch(`/api/groups/${groupId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, content: content.trim(), parentId }),
      });
      if (res.ok) {
        if (parentId) {
          setReplyText("");
          setReplyTo(null);
        } else setNewComment("");
        onRefresh();
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* New comment */}
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Start a discussion..."
          rows={2}
          className="text-sm"
        />
        <Button
          size="sm"
          className="h-auto shrink-0"
          onClick={() => handlePost()}
          disabled={posting || !newComment.trim()}
        >
          {posting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {discussions.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 h-6 w-6 text-muted-foreground/30" />
          No discussions yet
        </div>
      )}

      {/* Threads */}
      {discussions.map((d) => (
        <div key={d.id} className="rounded-lg border bg-card p-4">
          <p className="text-sm">{d.content}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
            <button
              className="hover:text-foreground"
              onClick={() => setReplyTo(replyTo === d.id ? null : d.id)}
            >
              Reply
            </button>
          </div>

          {/* Replies */}
          {d.replies && d.replies.length > 0 && (
            <div className="mt-3 space-y-2 border-l-2 border-muted pl-3">
              {d.replies.map((r) => (
                <div key={r.id}>
                  <p className="text-sm">{r.content}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          {replyTo === d.id && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={1}
                placeholder="Write a reply..."
                className="text-sm"
              />
              <Button
                size="sm"
                className="h-auto shrink-0"
                onClick={() => handlePost(d.id)}
                disabled={posting || !replyText.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
