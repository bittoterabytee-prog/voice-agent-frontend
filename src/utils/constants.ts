import type { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Calls", path: "/calls" },
  { label: "Call History", path: "/history" },
  { label: "Settings", path: "/settings" },
];

export function formatTimestamp(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}
