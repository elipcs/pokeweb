import { useState } from "react";

function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // TODO: integrar com backend de login
    // eslint-disable-next-line no-console
    console.log("Login", form);
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

      <button type="submit" className="primary-button">
        Entrar na plataforma
      </button>
    </form>
  );
}

export default LoginPage;

