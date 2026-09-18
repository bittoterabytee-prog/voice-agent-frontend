import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/utils/constants";
import { useUiStore } from "@/store/useUiStore";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop${sidebarOpen ? " is-open" : ""}`}
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar${sidebarOpen ? " is-open" : ""}`} data-testid="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__mark" aria-hidden="true" />
          <div>
            <p className="sidebar__eyebrow">Voice Agent AI</p>
            <p className="sidebar__title">Operations</p>
          </div>
        </div>
        <nav className="sidebar__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
