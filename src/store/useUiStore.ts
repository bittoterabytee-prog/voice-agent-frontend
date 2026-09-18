import { useContext } from "react";
import { UiStoreContext, type UiStoreValue } from "@/store/uiContext";

export function useUiStore(): UiStoreValue {
  const context = useContext(UiStoreContext);
  if (!context) {
    throw new Error("useUiStore must be used within UiStoreProvider");
  }
  return context;
}
