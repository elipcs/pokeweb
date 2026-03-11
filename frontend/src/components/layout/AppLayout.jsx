import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav-left">
          <div className="auth-logo">PokeWeb</div>
          <nav className="top-nav-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                "top-nav-link" + (isActive ? " top-nav-link-active" : "")
              }
            >
              Equipe
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                "top-nav-link" + (isActive ? " top-nav-link-active" : "")
              }
            >
              Inventário
            </NavLink>
          </nav>
        </div>

        <div className="top-nav-right">
          <span style={{ color: "#9ca3af" }}>Treinador</span>
          <div className="avatar-pill">
            <div className="avatar-circle" />
            <span style={{ fontSize: "0.85rem" }}>Ash Ketchum</span>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

