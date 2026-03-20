"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useNavStore } from "@/stores/nav-store";
import { navGroups, adminNavGroups, bottomNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavGroup } from "@/config/navigation";

interface AppSidebarProps {
  isAdmin?: boolean;
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return (
    pathname === href ||
    (href !== "/" &&
      (pathname.startsWith(href) || (href === "/courses" && pathname.startsWith("/course/"))))
  );
}

export function AppSidebar({ isAdmin }: AppSidebarProps) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useNavStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isCollapsed = hydrated ? collapsed : false;
  const isOnAdminPage = pathname.startsWith("/admin");
  const groups = isOnAdminPage && isAdmin ? adminNavGroups : navGroups;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out md:flex",
          isCollapsed ? "w-16" : "w-56",
        )}
      >
        {/* Logo — aligned with TopNav h-14, matching border */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b px-4",
            isCollapsed && "justify-center px-2",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 font-semibold transition-colors hover:text-primary",
              isCollapsed && "justify-center",
            )}
          >
            <BookOpen className="h-5 w-5 shrink-0 text-primary" />
            {!isCollapsed && <span className="truncate text-sm">LearnBook</span>}
          </Link>
        </div>

        {/* Nav groups — independently scrollable */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {groups.map((group) => (
            <NavGroupSection
              key={group.label}
              group={group}
              collapsed={isCollapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Bottom: settings + toggle — always at bottom */}
        <div className="shrink-0 border-t px-2 py-2">
          {bottomNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<item.icon className="h-4 w-4 shrink-0" />}
                active={active}
                collapsed={isCollapsed}
              />
            );
          })}

          {/* Toggle — consistent position at bottom in both states */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-8 w-8 shrink-0"
                onClick={toggleCollapsed}
              >
                {isCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {isCollapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function NavGroupSection({
  group,
  collapsed,
  pathname,
}: {
  group: NavGroup;
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <div className="mb-3">
      {!collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {group.label}
        </p>
      )}
      {collapsed && <div className="mx-auto mb-1 h-px w-6 bg-border" />}
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon className="h-4 w-4 shrink-0" />}
              active={active}
              collapsed={collapsed}
            />
          );
        })}
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
        collapsed && "justify-center px-0",
        active
          ? "bg-accent font-medium text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
