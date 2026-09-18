import type { NavItem, PlaceholderPanel } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Calls", path: "/calls" },
  { label: "Call History", path: "/history" },
  { label: "Settings", path: "/settings" },
];

export const DASHBOARD_PANELS: PlaceholderPanel[] = [
  {
    id: "active-calls",
    title: "Active Calls",
    description: "Live call monitoring will appear here in a later sprint.",
  },
  {
    id: "recent-calls",
    title: "Recent Calls",
    description: "Recent conversation summaries will appear here.",
  },
  {
    id: "system-status",
    title: "System Status",
    description: "Backend connectivity and operational health.",
  },
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
