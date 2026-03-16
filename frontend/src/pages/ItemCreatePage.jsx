import { useState, useEffect } from "react";

function ItemCreatePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [itemForm, setItemForm] = useState({
    name: "",
    category: "",
    description: "",
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

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setMessage({ type: "error", text: "Você não tem permissão para essa ação" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/itens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemForm),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Erro ao criar item",
        });
      } else {
        setMessage({
          type: "success",
          text: "Item criado com sucesso!",
        });
        setItemForm({
          name: "",
          category: "",
          description: "",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao criar item" });
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
        <h1 className="page-title">Cadastrar Item</h1>
        <p className="page-subtitle">Adicione um novo item ao sistema</p>
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

      <form onSubmit={handleSubmitItem} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Nome do Item
          </label>
          <input
            type="text"
            name="name"
            value={itemForm.name}
            onChange={handleItemChange}
            placeholder="Ex: Hyper Potion"
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
            Categoria
          </label>
          <select
            name="category"
            value={itemForm.category}
            onChange={handleItemChange}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
            }}
          >
            <option value="">Selecione uma categoria</option>
            <option value="Medicine">Medicamento</option>
            <option value="Pokéballs">Poké Balls</option>
            <option value="Berries">Berries</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Descrição
          </label>
          <textarea
            name="description"
            value={itemForm.description}
            onChange={handleItemChange}
            placeholder="Descreva o que faz o item"
            rows="4"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="primary-button"
          style={{ marginTop: "1rem" }}
        >
          {loading ? "Criando..." : "Cadastrar Item"}
        </button>
      </form>
    </div>
  );
}

export default ItemCreatePage;
