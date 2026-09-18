import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useUiStore } from "@/store/useUiStore";

export function DashboardLayout() {
  const { toggleSidebar } = useUiStore();

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell__main">
        <header className="topbar">
          <button
            type="button"
            className="button button--ghost topbar__menu"
            onClick={toggleSidebar}
            aria-label="Open navigation"
          >
            Menu
          </button>
          <div>
            <p className="topbar__eyebrow">AI Voice Agent</p>
            <h1 className="topbar__title">Dashboard</h1>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
