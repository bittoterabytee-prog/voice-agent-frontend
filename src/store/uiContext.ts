import { createContext } from "react";

export interface UiStoreValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const UiStoreContext = createContext<UiStoreValue | null>(null);
