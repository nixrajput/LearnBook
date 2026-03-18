import { LayoutDashboard, BookOpen, BookMarked, StickyNote, Settings, User } from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Bookmarks", href: "/bookmarks", icon: BookMarked },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const keyboardShortcuts = {
  search: ["Meta+k", "Control+k"],
  nextChapter: ["j"],
  prevChapter: ["k"],
  toggleNotes: ["n"],
  toggleBookmark: ["b"],
  toggleSidebar: ["["],
  toggleTOC: ["]"],
};
