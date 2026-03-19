"use client";

import { useState } from "react";

interface CardViewerProps {
  front: string;
  back: string;
}

export function CardViewer({ front, back }: CardViewerProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 cursor-pointer select-none"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative min-h-[200px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border bg-card p-8 [backface-visibility:hidden]">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Question
            </p>
            <p className="mt-3 text-lg font-medium leading-relaxed">{front}</p>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border bg-indigo-50 p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-indigo-950/30">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Answer
            </p>
            <p className="mt-3 text-lg leading-relaxed">{back}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {flipped ? "Click to see question" : "Click to reveal answer"}
      </p>
    </div>
  );
}
