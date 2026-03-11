import { Outlet, Link, useLocation } from "react-router-dom";

function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  return (
    <div className="auth-wrapper">
      <section className="auth-form-container">
        <div className="auth-card">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1rem"
            }}
          >
            <span className="auth-logo">PokeWeb</span>
          </div>
          <div className="auth-card-header">
            <h2 className="auth-card-title">
              {isRegister ? "Criar conta" : "Entrar na plataforma"}
            </h2>
            <p className="auth-card-subtitle">
              {isRegister
                ? "Se registre como um treinador!"
                : "Use seu e-mail e senha para continuar."}
            </p>
          </div>

          <Outlet />

          <div className="auth-footer">
            {isRegister ? (
              <>
                Já possui uma conta?{" "}
                <Link to="/login">Faça login aqui</Link>
              </>
            ) : (
              <>
                Não tem uma conta?{" "}
                <Link to="/register">Faça seu cadastro</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AuthLayout;

