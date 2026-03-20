import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  StickyNote,
  Layers,
  Library,
  Users,
  Brain,
  Sparkles,
  BarChart3,
  Tag,
  CreditCard,
  Settings,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Main navigation groups — label values are i18n keys resolved in components via useTranslations("nav") */
export const navGroups: NavGroup[] = [
  {
    label: "main",
    items: [
      { label: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "courses", href: "/courses", icon: BookOpen },
      { label: "library", href: "/library", icon: Library },
    ],
  },
  {
    label: "study",
    items: [
      { label: "notes", href: "/notes", icon: StickyNote },
      { label: "bookmarks", href: "/bookmarks", icon: BookMarked },
      { label: "flashcards", href: "/flashcards", icon: Layers },
    ],
  },
  {
    label: "explore",
    items: [
      { label: "groups", href: "/groups", icon: Users },
      { label: "knowledge", href: "/knowledge", icon: Brain },
      { label: "aiCredits", href: "/credits", icon: Sparkles },
    ],
  },
];

/** Admin navigation groups — label values are i18n keys resolved via useTranslations("admin") */
export const adminNavGroups: NavGroup[] = [
  {
    label: "overview",
    items: [
      { label: "overview", href: "/admin", icon: Shield },
      { label: "analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "manage",
    items: [
      { label: "users", href: "/admin/users", icon: Users },
      { label: "courses", href: "/admin/courses", icon: BookOpen },
    ],
  },
  {
    label: "billing",
    items: [
      { label: "plans", href: "/admin/plans", icon: CreditCard },
      { label: "creditPacks", href: "/admin/credit-packs", icon: Sparkles },
      { label: "offers", href: "/admin/offers", icon: Tag },
    ],
  },
];

/** All flat nav items (used for mobile) */
export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

/** Bottom nav items (settings, etc.) */
export const bottomNavItems: NavItem[] = [{ label: "settings", href: "/settings", icon: Settings }];

export const keyboardShortcuts = {
  search: ["Meta+k", "Control+k"],
  nextChapter: ["j"],
  prevChapter: ["k"],
  toggleNotes: ["n"],
  toggleBookmark: ["b"],
  toggleSidebar: ["["],
  toggleTOC: ["]"],
};
