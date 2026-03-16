import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Falha no login. Verifique suas credenciais.");
        return;
      }

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data));
      }

      if (data.role === "ADMIN") {
        navigate("/cadastrar-pokemon");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-field">
        <div className="form-label-row">
          <label className="form-label" htmlFor="email">
            E-mail
          </label>
        </div>
        <input
          id="email"
          name="email"
          type="email"
          className="form-input"
          placeholder="treinador@gmail.com"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <div className="form-label-row">
          <label className="form-label" htmlFor="password">
            Senha
          </label>
          <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            Esqueceu a senha?
          </span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          className="form-input"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Entrando..." : "Entrar na plataforma"}
      </button>
    </form>
  );
}

export default LoginPage;

