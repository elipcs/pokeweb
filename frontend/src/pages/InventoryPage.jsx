import { useState } from "react";

const MOCK_ITEMS = [
  {
    id: 1,
    name: "Hyper Potion",
    description: "Restores 200 HP",
    quantity: 12,
    category: "Medicine"
  },
  {
    id: 2,
    name: "Poké Ball",
    description: "Capture",
    quantity: 24,
    category: "Pokéballs"
  },
  {
    id: 3,
    name: "Paralyze Heal",
    description: "Status",
    quantity: 6,
    category: "Medicine"
  },
  {
    id: 4,
    name: "Rare Candy",
    description: "Level Up",
    quantity: 3,
    category: "Berries"
  },
  {
    id: 5,
    name: "Great Ball",
    description: "Capture",
    quantity: 10,
    category: "Pokéballs"
  }
];

const CATEGORIES = ["All Items", "Medicine", "Pokéballs", "Berries"];

function getItemVisualType(category) {
  if (category === "Medicine") return "medicine";
  if (category === "Pokéballs") return "pokeball";
  if (category === "Berries") return "berry";
  return "default";
}

function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [query, setQuery] = useState("");
  const [selectedItem] = useState(MOCK_ITEMS[0]);

  const filteredItems = MOCK_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "All Items" || item.category === activeCategory;
    const matchesQuery = item.name
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Inventário</h1>
        <p className="page-subtitle">
          Gerencie seus itens e recursos.
        </p>
      </header>

      <section className="card">
        <div className="items-header-row">
          <div className="tabs">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  "tab" +
                  (activeCategory === category ? " tab-active" : "")
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Buscar itens..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="items-list">
          <div className="items-scroll">
            {filteredItems.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-icon-wrapper">
                  <div
                    className={`item-icon item-icon-${getItemVisualType(
                      item.category
                    )}`}
                  />
                  <span className="item-quantity-pill">x{item.quantity}</span>
                </div>
                <div className="item-main">
                  <div className="item-name">{item.name}</div>
                  <div className="item-subtitle">{item.description}</div>
                  <span className="item-tag item-tag-soft">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="item-detail">
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.4rem"
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600
                    }}
                  >
                    {selectedItem.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af"
                    }}
                  >
                    {selectedItem.description}
                  </div>
                </div>
                <span className="item-tag">{selectedItem.category}</span>
              </div>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  lineHeight: 1.5
                }}
              >
                Um medicamento de spray. Restaura o HP de um Pokémon em
                200 pontos.
              </p>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.4rem"
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af"
                  }}
                >
                  Usar no Pokémon
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af"
                  }}
                >
                  x{selectedItem.quantity} disponíveis
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "0.4rem"
                }}
              >
                <button type="button" className="muted-button">
                  Charizard · Lv. 78
                </button>
                <button type="button" className="muted-button">
                  Pikachu · Lv. 45
                </button>
                <button type="button" className="muted-button">
                  Blastoise · Lv. 82
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default InventoryPage;

