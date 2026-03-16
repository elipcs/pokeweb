import { useState, useEffect } from "react";

function PokemonCreatePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [pokemonForm, setPokemonForm] = useState({
    name: "",
    type: "",
    level: 1,
    hp: 0,
    attack: 0,
    defense: 0,
    spAtk: 0,
    spDef: 0,
    speed: 0,
  });

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === "ADMIN") {
          setIsAdmin(true);
        }
      } catch (err) {
        // Handle error implicitly by keeping isAdmin false
      }
    }
  }, []);

  const handlePokemonChange = (e) => {
    const { name, value, type } = e.target;
    setPokemonForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmitPokemon = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setMessage({ type: "error", text: "Você não tem permissão para essa ação" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/pokemons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pokemonForm),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Erro ao criar pokémon",
        });
      } else {
        setMessage({
          type: "success",
          text: "Pokémon criado com sucesso!",
        });
        setPokemonForm({
          name: "",
          type: "",
          level: 1,
          hp: 0,
          attack: 0,
          defense: 0,
          spAtk: 0,
          spDef: 0,
          speed: 0,
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao criar pokémon" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", color: "white", maxWidth: "600px", margin: "0 auto" }}>
      <header className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Cadastrar Pokémon</h1>
        <p className="page-subtitle">Adicione um novo pokémon ao sistema</p>
      </header>

      {message.text && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            borderRadius: "var(--radius-md)",
            background:
              message.type === "success"
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
            border:
              message.type === "success"
                ? "1px solid #22c55e"
                : "1px solid var(--danger)",
            color: message.type === "success" ? "#22c55e" : "var(--danger)",
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmitPokemon} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Nome
          </label>
          <input
            type="text"
            name="name"
            value={pokemonForm.name}
            onChange={handlePokemonChange}
            placeholder="Ex: Charizard"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Tipo
          </label>
          <input
            type="text"
            name="type"
            value={pokemonForm.type}
            onChange={handlePokemonChange}
            placeholder="Ex: Fire"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Nível
          </label>
          <input
            type="number"
            name="level"
            value={pokemonForm.level}
            onChange={handlePokemonChange}
            min="1"
            max="100"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              HP
            </label>
            <input
              type="number"
              name="hp"
              value={pokemonForm.hp}
              onChange={handlePokemonChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              ATK
            </label>
            <input
              type="number"
              name="attack"
              value={pokemonForm.attack}
              onChange={handlePokemonChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              DEF
            </label>
            <input
              type="number"
              name="defense"
              value={pokemonForm.defense}
              onChange={handlePokemonChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              SPD
            </label>
            <input
              type="number"
              name="speed"
              value={pokemonForm.speed}
              onChange={handlePokemonChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="primary-button"
          style={{ marginTop: "1rem" }}
        >
          {loading ? "Criando..." : "Cadastrar Pokémon"}
        </button>
      </form>
    </div>
  );
}

export default PokemonCreatePage;
