import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "pokemon"); // "pokemon" or "item"
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

  const [itemForm, setItemForm] = useState({
    name: "",
    category: "",
    description: "",
  });

  const [seedLoading, setSeedLoading] = useState(false);

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

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "item" || tabParam === "pokemon") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handlePokemonChange = (e) => {
    const { name, value, type } = e.target;
    setPokemonForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitPokemon = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch("/api/pokemons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...pokemonForm,
          trainerId: user.id || 1, // Fallback if id is missing
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao criar Pokémon");
      }

      setMessage({ type: "success", text: "Pokémon criado com sucesso!" });
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
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const submitItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...itemForm,
          treinadorId: user.id || 1, // Fallback se id estiver faltando
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao criar Item");
      }

      setMessage({ type: "success", text: "Item criado com sucesso!" });
      setItemForm({
        name: "",
        category: "",
        description: "",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const seedGen1 = async () => {
    setSeedLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/pokemons/seed-gen1", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSeedLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", color: "white", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Painel de Administração</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          className={activeTab === "pokemon" ? "primary-button" : "secondary-button"}
          style={{ padding: "0.5rem 1rem" }}
          onClick={() => handleTabChange("pokemon")}
        >
          Cadastrar Pokémon
        </button>
        <button
          className={activeTab === "item" ? "primary-button" : "secondary-button"}
          style={{ padding: "0.5rem 1rem", backgroundColor: activeTab !== "item" ? "#374151" : undefined }}
          onClick={() => handleTabChange("item")}
        >
          Cadastrar Item
        </button>
      </div>

      {message.text && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: message.type === "success" ? "#065f46" : "#7f1d1d",
            color: "white",
          }}
        >
          {message.text}
        </div>
      )}

      {activeTab === "pokemon" && (
        <>
          <div style={{ padding: "1.2rem", backgroundColor: "#1f2937", borderRadius: "0.5rem", marginBottom: "2rem", border: "1px solid #374151" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Importar Pela PokéAPI</h3>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "1rem" }}>
              Esta ação importará de forma automatizada todos os 151 Pokémons da Primeira Geração. Os atributos base deles já serão mapeados e configurados corretamente para o seu inventário. 
            </p>
            <button type="button" onClick={seedGen1} className="secondary-button" disabled={seedLoading} style={{ padding: "0.75rem", borderRadius: "0.5rem" }}>
              {seedLoading ? "Baixando 151 Pokémons... Isso pode demorar" : "⚡ Importar 1ª Geração (1-151)"}
            </button>
          </div>

          <h3 style={{ marginBottom: "1rem", marginTop: "1rem" }}>Ou cadastre manualmente</h3>
          <form onSubmit={submitPokemon} className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-field">
            <label className="form-label">Nome</label>
            <input required type="text" name="name" className="form-input" value={pokemonForm.name} onChange={handlePokemonChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Tipo</label>
            <input required type="text" name="type" className="form-input" value={pokemonForm.type} onChange={handlePokemonChange} placeholder="Ex: Elétrico" />
          </div>
          <div className="form-field">
            <label className="form-label">Nível</label>
            <input required type="number" name="level" min="1" className="form-input" value={pokemonForm.level} onChange={handlePokemonChange} />
          </div>
          <div className="form-field">
            <label className="form-label">HP Base</label>
            <input required type="number" name="hp" min="1" className="form-input" value={pokemonForm.hp} onChange={handlePokemonChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Ataque Base</label>
            <input required type="number" name="attack" min="1" className="form-input" value={pokemonForm.attack} onChange={handlePokemonChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Defesa Base</label>
            <input required type="number" name="defense" min="1" className="form-input" value={pokemonForm.defense} onChange={handlePokemonChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Ataque SP Base</label>
            <input required type="number" name="spAtk" min="1" className="form-input" value={pokemonForm.spAtk} onChange={handlePokemonChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Defesa SP Base</label>
            <input required type="number" name="spDef" min="1" className="form-input" value={pokemonForm.spDef} onChange={handlePokemonChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Velocidade Base</label>
            <input required type="number" name="speed" min="1" className="form-input" value={pokemonForm.speed} onChange={handlePokemonChange} />
          </div>
          
          <div style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Pokémon"}
            </button>
          </div>
        </form>
        </>
      )}

      {activeTab === "item" && (
        <form onSubmit={submitItem} className="form-grid" style={{ gap: "1rem" }}>
          <div className="form-field">
            <label className="form-label">Nome do Item</label>
            <input required type="text" name="name" className="form-input" value={itemForm.name} onChange={handleItemChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Categoria</label>
            <input required type="text" name="category" className="form-input" value={itemForm.category} onChange={handleItemChange} placeholder="Ex: Cura, Captura" />
          </div>
          <div className="form-field">
            <label className="form-label">Descrição (opcional)</label>
            <textarea
              name="description"
              className="form-input"
              value={itemForm.description}
              onChange={handleItemChange}
              style={{ minHeight: "100px", resize: "vertical" }}
            />
          </div>
          
          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Item"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminPage;
