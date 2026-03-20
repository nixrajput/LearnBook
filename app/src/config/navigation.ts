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
  Upload,
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

/** Main navigation groups */
export const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Courses", href: "/courses", icon: BookOpen },
      { label: "Library", href: "/library", icon: Library },
    ],
  },
  {
    label: "Study",
    items: [
      { label: "Notes", href: "/notes", icon: StickyNote },
      { label: "Bookmarks", href: "/bookmarks", icon: BookMarked },
      { label: "Flashcards", href: "/flashcards", icon: Layers },
    ],
  },
  {
    label: "Explore",
    items: [
      { label: "Groups", href: "/groups", icon: Users },
      { label: "Knowledge", href: "/knowledge", icon: Brain },
      { label: "AI Credits", href: "/credits", icon: Sparkles },
    ],
  },
];

/** Admin navigation groups */
export const adminNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: Shield },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Upload", href: "/admin/courses/upload", icon: Upload },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Plans", href: "/admin/plans", icon: CreditCard },
      { label: "Offers", href: "/admin/offers", icon: Tag },
    ],
  },
];

/** All flat nav items (used for mobile) */
export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

/** Bottom nav items (settings, etc.) */
export const bottomNavItems: NavItem[] = [{ label: "Settings", href: "/settings", icon: Settings }];

export const keyboardShortcuts = {
  search: ["Meta+k", "Control+k"],
  nextChapter: ["j"],
  prevChapter: ["k"],
  toggleNotes: ["n"],
  toggleBookmark: ["b"],
  toggleSidebar: ["["],
  toggleTOC: ["]"],
};
