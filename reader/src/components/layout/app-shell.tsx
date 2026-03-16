"use client";

import { useState } from "react";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <TopNav onMenuClick={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <main className="flex flex-1 animate-fade-in flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
