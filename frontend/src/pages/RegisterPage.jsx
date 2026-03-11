import { useState } from "react";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // TODO: integrar com backend de cadastro
    // por enquanto apenas loga no console
    // eslint-disable-next-line no-console
    console.log("Cadastro", form);
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

      <button type="submit" className="primary-button">
        Criar conta
      </button>
    </form>
  );
}

export default RegisterPage;

