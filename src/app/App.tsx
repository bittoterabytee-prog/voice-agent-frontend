import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { UiStoreProvider } from "@/store/uiStore";

export function App() {
  return (
    <UiStoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UiStoreProvider>
  );
}
