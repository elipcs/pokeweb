import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function AppLayout() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserName(user.name || "Treinador");
      } catch (error) {
        setUserName("Treinador");
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav-left">
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginRight: "2rem"
            }}
          >
            <div className="auth-logo">PokeWeb</div>
          </button>
          <nav className="top-nav-links">
            <NavLink
              to="/team"
              className={({ isActive }) =>
                "top-nav-link" + (isActive ? " top-nav-link-active" : "")
              }
            >
              Equipe
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                "top-nav-link" + (isActive ? " top-nav-link-active" : "")
              }
            >
              Boxes
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
            <span style={{ fontSize: "0.85rem" }}>{userName}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

