import { useState, useEffect } from "react";

const CATEGORIES = ["All Items", "Medicine", "Pokéballs", "Berries"];

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuantityChange, setShowQuantityChange] = useState(false);
  const [newQuantity, setNewQuantity] = useState(1);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  // Carregar itens do banco
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");
        
        if (!userData.id) {
          setLoading(false);
          return;
        }

        // Carregar itens do usuário
        const response = await fetch(`/api/itens/treinador/${userData.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const itemsList = Array.isArray(data.rows) ? data.rows : data;
          console.log("Itens do usuário:", itemsList);
          setItems(itemsList);
          if (itemsList.length > 0) {
            setSelectedItem(itemsList[0]);
          }
        } else {
          console.error("Erro ao carregar itens do usuário:", response.status);
        }

        // Carregar todos os itens disponíveis
        const allItemsResponse = await fetch("/api/itens");
        if (allItemsResponse.ok) {
          const allData = await allItemsResponse.json();
          const allItemsList = Array.isArray(allData.rows) ? allData.rows : allData;
          console.log("Itens disponíveis:", allItemsList);
          setAvailableItems(allItemsList);
        }
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Adicionar item ao inventário
  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!selectedItemToAdd || quantityToAdd <= 0) {
      alert("Selecione um item e uma quantidade válida");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.id) {
      alert("Erro: Usuário não identificado");
      return;
    }

    try {
      const response = await fetch("/api/itens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: selectedItemToAdd.name,
          description: selectedItemToAdd.description,
          category: selectedItemToAdd.category,
          quantity: quantityToAdd,
          treinadorId: userData.id
        })
      });

      if (response.ok) {
        // Recarregar itens do usuário após adicionar com sucesso
        const itemsResponse = await fetch(`/api/itens/treinador/${userData.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (itemsResponse.ok) {
          const data = await itemsResponse.json();
          const itemsList = Array.isArray(data.rows) ? data.rows : data;
          setItems(itemsList);
          if (itemsList.length > 0) {
            setSelectedItem(itemsList[itemsList.length - 1]); // Seleciona o último item adicionado
          }
        }
        
        setSelectedItemToAdd(null);
        setQuantityToAdd(1);
        setShowAddModal(false);
        alert("Item adicionado ao inventário!");
      } else {
        alert("Erro ao adicionar item");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao adicionar item");
    }
  };

  // Remover item
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Tem certeza que quer remover este item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/itens/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
        if (selectedItem?.id === itemId) {
          setSelectedItem(items.find(item => item.id !== itemId) || null);
        }
        alert("Item removido com sucesso!");
      } else {
        alert("Erro ao remover item");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao remover item");
    }
  };

  // Atualizar quantidade do item
  const handleUpdateQuantity = async () => {
    if (newQuantity < 0) {
      alert("Quantidade não pode ser negativa");
      return;
    }

    try {
      const response = await fetch(`/api/itens/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItems(items.map(item => item.id === selectedItem.id ? updatedItem : item));
        setSelectedItem(updatedItem);
        setShowQuantityChange(false);
        alert("Quantidade atualizada com sucesso!");
      } else {
        alert("Erro ao atualizar quantidade");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao atualizar quantidade");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "All Items" || item.category === activeCategory;
    const matchesQuery = item.name
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p>Carregando inventário...</p>
      </div>
    );
  }

  return (
    <>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Nenhum item no inventário.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="primary-button"
            style={{ marginTop: "1rem" }}
          >
            Adicionar Item
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", paddingBottom: "2rem" }}>
      {/* Painel Esquerdo - Lista de Itens */}
      <div>
        <header className="page-header" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">Inventário</h1>
            <p className="page-subtitle">Gerencie seus itens e recursos</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="primary-button"
            style={{ whiteSpace: "nowrap" }}
          >
            + Adicionar Item
          </button>
        </header>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  border: "none",
                  background: activeCategory === category ? "var(--primary)" : "rgba(255,255,255,0.1)",
                  color: activeCategory === category ? "#000" : "var(--text)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  transition: "all 0.2s"
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "var(--text-soft)" }}>
              <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M13 13l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "var(--text)",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              style={{
                padding: "1rem",
                borderRadius: "12px",
                border: selectedItem.id === item.id ? "2px solid var(--primary)" : "1px solid rgba(255,255,255,0.1)",
                background: "rgba(20,20,20,0.8)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, rgba(100,150,80,0.3) 0%, rgba(60,80,40,0.3) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)"
                  }}
                >
                  <span style={{ fontSize: "28px" }}>💊</span>
                </div>
                <span style={{ position: "absolute", bottom: 0, right: 0, background: "var(--primary)", color: "#000", padding: "0.25rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                  x{item.quantity}
                </span>
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                {item.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-soft)" }}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel Direito - Detalhes do Item */}
      {selectedItem && (
        <div style={{ background: "rgba(30,40,20,0.5)", borderRadius: "16px", padding: "2rem", border: "1px solid rgba(80,100,50,0.3)" }}>
          {/* Ícone e Nome */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(100,150,80,0.3) 0%, rgba(60,80,40,0.3) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "60px"
              }}
            >
              💊
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              {selectedItem.name}
            </h2>
            <p style={{ color: "var(--text-soft)", fontSize: "0.9rem" }}>
              {selectedItem.description}
            </p>
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: "2rem", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--primary)" }}>
              DESCRIÇÃO
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
              {selectedItem.description}
            </p>
          </div>

          {/* Quantidade */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--primary)" }}>
              QUANTIDADE
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>x{selectedItem.quantity}</div>
              <button
                onClick={() => {
                  setNewQuantity(selectedItem.quantity);
                  setShowQuantityChange(true);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--primary)",
                  background: "transparent",
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                Alterar
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => handleRemoveItem(selectedItem.id)}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #ef4444",
                background: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Remover Item
            </button>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Modal - Adicionar Item */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "var(--bg)",
            borderRadius: "16px",
            padding: "2rem",
            maxWidth: "600px",
            width: "90%",
            border: "1px solid rgba(255,255,255,0.1)",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              Adicionar Item ao Inventário
            </h2>

            {!selectedItemToAdd ? (
              <>
                <div style={{ marginBottom: "1.5rem", maxHeight: "400px", overflow: "auto" }}>
                  {availableItems.length === 0 ? (
                    <p style={{ color: "var(--text-soft)" }}>Nenhum item disponível</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                      {availableItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItemToAdd(item)}
                          style={{
                            padding: "1rem",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(20,20,20,0.8)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            hover: {
                              borderColor: "var(--primary)"
                            }
                          }}
                        >
                          <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-soft)", marginBottom: "0.5rem" }}>
                            {item.category}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>
                            {item.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedItemToAdd(null);
                      setQuantityToAdd(1);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "var(--text)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: 600
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    {selectedItemToAdd.name}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: "1rem" }}>
                    {selectedItemToAdd.description}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text)",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItemToAdd(null);
                      setQuantityToAdd(1);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "var(--text)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: 600
                    }}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    style={{ flex: 1, padding: "0.75rem" }}
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal - Alterar Quantidade */}
      {showQuantityChange && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "var(--bg)",
            borderRadius: "16px",
            padding: "2rem",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              Alterar Quantidade
            </h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Quantidade de {selectedItem?.name}
              </label>
              <input
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text)",
                  fontSize: "0.9rem"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowQuantityChange(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateQuantity}
                className="primary-button"
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InventoryPage;

