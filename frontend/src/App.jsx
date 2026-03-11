import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import PokemonDetailPage from "./pages/PokemonDetailPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

