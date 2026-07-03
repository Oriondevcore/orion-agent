import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/chat", label: "Chat", icon: "\u{1F4AC}" },
  { to: "/models", label: "Models", icon: "\u{1F9E0}" },
  { to: "/sops", label: "SOPs", icon: "\u{1F4CB}" },
  { to: "/kpis", label: "KPIs", icon: "\u{1F4CA}" },
  { to: "/docs", label: "Docs", icon: "\u{1F4D6}" },
  { to: "/controls", label: "Controls", icon: "\u2699\uFE0F" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="layout">
      <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        <span />
        <span />
        <span />
      </button>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <h1>Orion</h1>
        <nav>
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) => isActive ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="status">
          <span className="status-dot online" />
          Agent Online
        </div>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
