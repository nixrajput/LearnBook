"use client";

import { useState } from "react";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    displayName?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    plan?: string;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <TopNav onMenuClick={() => setMobileNavOpen(true)} user={user} />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <main className="flex flex-1 animate-fade-in flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
