"use client";

import { useState } from "react";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { SearchDialog } from "@/components/search/search-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { useLocaleSync } from "@/hooks/use-locale-sync";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    displayName?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    plan?: string;
    locale?: string | null;
    primaryLanguage?: string | null;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useLocaleSync(user?.locale ?? null, user?.primaryLanguage ?? null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav onMenuClick={() => setMobileNavOpen(true)} user={user} />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SearchDialog />
    </div>
  );
}
