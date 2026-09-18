import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { UiStoreContext } from "@/store/uiContext";

export function UiStoreProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar: () => setSidebarOpen((open) => !open),
    }),
    [sidebarOpen],
  );

  return <UiStoreContext.Provider value={value}>{children}</UiStoreContext.Provider>;
}
