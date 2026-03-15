import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Falha no cadastro. Tente novamente.");
        return;
      }

      // Cadastro ok: redireciona para login
      navigate("/login");
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
        <label className="form-label" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="form-input"
          placeholder="Ash Ketchum"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-input"
          placeholder="ash@pokeweb.com"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="form-input"
          value={form.password}
          onChange={handleChange}
        />
        <span className="form-helper">Mínimo de 8 caracteres</span>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="confirmPassword">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="form-input"
          value={form.confirmPassword}
          onChange={handleChange}
        />
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}

export default RegisterPage;
