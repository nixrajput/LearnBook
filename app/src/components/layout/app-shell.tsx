"use client";

import { useState } from "react";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { AppSidebar } from "./app-sidebar";
import { SearchDialog } from "@/components/search/search-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { useLocaleSync } from "@/hooks/use-locale-sync";

interface AppShellProps {
  children: React.ReactNode;
  /** Hide sidebar (e.g. on public pages) */
  hideSidebar?: boolean;
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

export function AppShell({ children, user, hideSidebar }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  useLocaleSync(user?.locale ?? null, user?.primaryLanguage ?? null);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only, hidden on public pages */}
      {!hideSidebar && <AppSidebar isAdmin={isAdmin} />}

      {/* Main column — top bar + content + footer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onMenuClick={() => setMobileNavOpen(true)} user={user} showLogo={hideSidebar} />
        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>

      <SearchDialog />
    </div>
  );
}
