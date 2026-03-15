import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BoxesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [boxPokemons, setBoxPokemons] = useState({});
  const [sprites, setSprites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBoxForAdd, setSelectedBoxForAdd] = useState(null);
  const [availablePokemons, setAvailablePokemons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateBoxModal, setShowCreateBoxModal] = useState(false);
  const [showEditBoxModal, setShowEditBoxModal] = useState(false);
  const [newBoxName, setNewBoxName] = useState("");
  const [editingBoxName, setEditingBoxName] = useState("");
  const [pokemonSearch, setPokemonSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Get color for HP percentage
  function getHpColor(percent) {
    if (percent < 33) return "var(--danger)";
    if (percent < 66) return "#facc15";
    return "var(--accent)";
  }

  // Get HP percentage from actual HP values
  function getHpPercent(pokemon) {
    if (!pokemon.hp) return 100;
    return Math.min(100, (pokemon.hp / 100) * 100);
  }

  // Load user data from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    }
  }, []);

  // Load boxes and teams
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        // Load boxes
        const boxesRes = await fetch(`/api/boxes/treinador/${user.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!boxesRes.ok) throw new Error("Erro ao carregar boxes");
        const boxesData = await boxesRes.json();
        setBoxes(boxesData.rows || []);

        // Load teams (for moving pokemons to them)
        const teamsRes = await fetch(`/api/equipes/treinador/${user.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData.rows || []);
        }

        // Load available pokemons
        const allPokemonsRes = await fetch("/api/pokemons?limit=1000", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (allPokemonsRes.ok) {
          const allPokemons = await allPokemonsRes.json();
          const availableList = [];
          const seenNames = new Set();
          (allPokemons.rows || []).filter(p => !p.boxId && !p.teamId).forEach(p => {
             if (!seenNames.has(p.name)) {
               seenNames.add(p.name);
               availableList.push(p);
             }
          });
          setAvailablePokemons(availableList);
          loadSprites(availableList);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Load pokemons for each box
  useEffect(() => {
    async function loadBoxPokemons() {
      if (boxes.length === 0) return;
      const newBoxPokemons = {};
      const allPokemonsMap = new Map();
      const token = localStorage.getItem("token");

      for (const box of boxes) {
        try {
          const res = await fetch(`/api/pokemons/box/${box.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            newBoxPokemons[box.id] = data.rows || [];
            (data.rows || []).forEach(p => allPokemonsMap.set(p.id, p));
          }
        } catch (err) {
          console.error(`Erro ao carregar pokémons da box ${box.id}:`, err);
        }
      }
      setBoxPokemons(newBoxPokemons);
      await loadSprites(Array.from(allPokemonsMap.values()));
    }
    loadBoxPokemons();
  }, [boxes]);

  // Load sprites from PokéAPI
  async function loadSprites(pokemonsList) {
    if (pokemonsList.length === 0) return;

    const newMap = {};
    const promises = pokemonsList.map(async (p) => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
        if (res.ok) {
          const data = await res.json();
          newMap[p.id] = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;
        }
      } catch (err) {}
    });

    await Promise.all(promises);

    if (Object.keys(newMap).length > 0) {
      setSprites(prev => ({ ...prev, ...newMap }));
    }
  }

  async function handleAddPokemonToBox(pokemon, boxId) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/pokemons`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: pokemon.name,
          type: pokemon.type,
          level: pokemon.level,
          hp: pokemon.hp,
          attack: pokemon.attack,
          defense: pokemon.defense,
          spAtk: pokemon.spAtk,
          spDef: pokemon.spDef,
          speed: pokemon.speed,
          trainerId: user.id,
          boxId: boxId,
          teamId: null,
          evolvesTo: pokemon.evolvesTo,
          evolutionLevel: pokemon.evolutionLevel
        })
      });
      if (!res.ok) throw new Error("Erro ao adicionar");
      
      const boxRes = await fetch(`/api/pokemons/box/${boxId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (boxRes.ok) {
        const data = await boxRes.json();
        setBoxPokemons(prev => ({
          ...prev, [boxId]: data.rows || []
        }));
      }
      setShowAddModal(false);
    } catch (err) { setError(err.message); }
  }

  async function handleMovePokemonToTeam(pokemon, teamId) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/boxes/transfer", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pokemonId: pokemon.id, targetType: "team", targetId: teamId })
      });
      if (!res.ok) throw new Error("Erro ao transferir");
      
      if (pokemon.boxId) {
        const boxRes = await fetch(`/api/pokemons/box/${pokemon.boxId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (boxRes.ok) {
          const data = await boxRes.json();
          setBoxPokemons(prev => ({
            ...prev, [pokemon.boxId]: data.rows || []
          }));
        }
      }
    } catch (err) { setError(err.message); }
  }

  async function handleCreateBox() {
    try {
      if (!newBoxName.trim()) return setError("O nome não pode estar vazio");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/boxes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: newBoxName, treinadorId: user.id })
      });
      if (!res.ok) throw new Error("Erro ao criar");
      
      const boxesRes = await fetch(`/api/boxes/treinador/${user.id}`, { headers: { "Authorization": `Bearer ${token}` }});
      if (boxesRes.ok) {
        const boxesData = await boxesRes.json();
        setBoxes(boxesData.rows || []);
      }
      setNewBoxName("");
      setShowCreateBoxModal(false);
      setError("");
    } catch (err) { setError(err.message); }
  }

  async function handleEditBoxName() {
    try {
      if (!editingBoxName.trim()) return setError("O nome não pode estar vazio");
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/boxes/${editingBoxId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: editingBoxName })
      });
      if (!res.ok) throw new Error("Erro ao editar box");
      
      const boxesRes = await fetch(`/api/boxes/treinador/${user.id}`, { headers: { "Authorization": `Bearer ${token}` }});
      if (boxesRes.ok) {
        const boxesData = await boxesRes.json();
        setBoxes(boxesData.rows || []);
      }
      setEditingBoxName("");
      setEditingBoxId(null);
      setShowEditBoxModal(false);
      setError("");
    } catch (err) { setError(err.message); }
  }

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "#fff" }}>Carregando...</div>;

  return (
    <div style={{ paddingBottom: "3rem" }}>
      <header className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ fontSize: "2rem", color: "#fff" }}>Gerenciar Boxes</h1>
        <p className="page-subtitle" style={{ color: "rgba(255,255,255,0.6)" }}>
          Adicione, edite ou mova pokémons de suas boxes para a sua equipe.
        </p>
      </header>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.5rem", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Boxes Section */}
      {boxes.length > 0 ? (
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>Minhas Boxes</h2>
            <button
              onClick={() => setShowCreateBoxModal(true)}
              className="primary-button"
              style={{ width: "auto", padding: "0.5rem 1rem", marginTop: 0, fontSize: "0.85rem" }}
            >
              + Nova Box
            </button>
          </div>

          {boxes.map(box => (
            <div key={box.id} style={{ marginBottom: "2rem", background: "rgba(20, 25, 15, 0.8)", border: "1px solid rgba(80, 100, 50, 0.3)", borderRadius: "12px", overflow: "hidden" }}>
              <div 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "rgba(30, 40, 20, 0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(80, 100, 50, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <h3 style={{ fontSize: "1.2rem", color: "#fff", fontWeight: "bold", margin: 0 }}>
                    {box.name} <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", fontWeight: "normal" }}>({(boxPokemons[box.id] || []).length} pokémons)</span>
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBoxId(box.id);
                      setEditingBoxName(box.name);
                      setShowEditBoxModal(true);
                    }}
                    style={{ background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3b82f6", borderRadius: "6px", padding: "0.4rem 0.8rem", fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Editar Box
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedBoxForAdd(box.id); setShowAddModal(true); }}
                    className="primary-button"
                    style={{ width: "auto", padding: "0.5rem 1rem", marginTop: 0, fontSize: "0.85rem" }}
                  >
                    + Adicionar Pokémon
                  </button>
                </div>
              </div>

              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1.2rem" }}>
                {(boxPokemons[box.id] || []).length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", fontStyle: "italic" }}>
                    Nenhum pokémon nesta box
                  </p>
                ) : (
                  (boxPokemons[box.id] || []).map(pokemon => (
                    <div
                      key={pokemon.id}
                      style={{
                        background: "rgba(25, 30, 20, 0.8)", border: "1px solid rgba(80, 100, 50, 0.3)", borderRadius: "12px", padding: "1rem", textAlign: "center", cursor: "pointer", transition: "transform 0.2s, borderColor 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(120, 150, 70, 0.6)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(80, 100, 50, 0.3)"; }}
                      onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                    >
                      <div style={{ width: "80px", height: "80px", background: "rgba(10, 15, 5, 0.6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)", margin: "0 auto 0.5rem" }}>
                        {sprites[pokemon.id] && <img src={sprites[pokemon.id]} alt={pokemon.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />}
                      </div>
                      <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>{pokemon.name}</p>
                      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Nv. {pokemon.level}</p>
                      
                      {teams.length > 0 && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid rgba(80, 100, 50, 0.5)", background: "rgba(10, 15, 5, 0.9)", color: "var(--text)", fontSize: "0.75rem", cursor: "pointer", outline: "none" }}
                          onChange={(e) => { if (e.target.value) { handleMovePokemonToTeam(pokemon, Number(e.target.value)); e.target.value = ""; } }}
                        >
                          <option value="">Mover para equipe...</option>
                          {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                      )}
                    </div>
                  ))
                )}
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem", color: "#fff" }}>Você ainda não tem nenhuma box</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>Comece criando sua primeira box para organizar seus pokémons</p>
          <button onClick={() => setShowCreateBoxModal(true)} className="primary-button" style={{ width: "auto", padding: "0.75rem 2rem", marginTop: 0 }}>
            + Criar Primeira Box
          </button>
        </section>
      )}

      {/* Add Pokemon Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: "rgba(20, 20, 20, 0.95)", borderRadius: "var(--radius-lg)", padding: "2rem", maxWidth: "600px", maxHeight: "80vh", overflow: "auto", border: "1px solid rgba(80, 100, 50, 0.3)", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", color: "#fff" }}>Adicionar Pokémon à Box</h2>
            
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <input 
                type="text" 
                placeholder="Buscar pokémon por nome..."
                value={pokemonSearch}
                onChange={(e) => setPokemonSearch(e.target.value)}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(80, 100, 50, 0.5)", background: "rgba(12, 12, 12, 0.9)", color: "white", fontSize: "0.95rem" }} 
              />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ width: "150px", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(80, 100, 50, 0.5)", background: "rgba(12, 12, 12, 0.9)", color: "white", fontSize: "0.95rem" }}
              >
                <option value="">Todos os Tipos</option>
                <option value="normal">Normal</option>
                <option value="fire">Fire</option>
                <option value="water">Water</option>
                <option value="grass">Grass</option>
                <option value="electric">Electric</option>
                <option value="ice">Ice</option>
                <option value="fighting">Fighting</option>
                <option value="poison">Poison</option>
                <option value="ground">Ground</option>
                <option value="flying">Flying</option>
                <option value="psychic">Psychic</option>
                <option value="bug">Bug</option>
                <option value="rock">Rock</option>
                <option value="ghost">Ghost</option>
                <option value="dragon">Dragon</option>
                <option value="dark">Dark</option>
                <option value="steel">Steel</option>
                <option value="fairy">Fairy</option>
              </select>
            </div>

            {availablePokemons.filter(p => {
              const matchesName = p.name.toLowerCase().includes(pokemonSearch.toLowerCase());
              const matchesType = typeFilter === "" || p.type.toLowerCase().includes(typeFilter.toLowerCase());
              return matchesName && matchesType;
            }).length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.5)" }}>Nenhum pokémon disponível para este filtro.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem" }}>
                {availablePokemons.filter(p => {
                  const matchesName = p.name.toLowerCase().includes(pokemonSearch.toLowerCase());
                  const matchesType = typeFilter === "" || p.type.toLowerCase().includes(typeFilter.toLowerCase());
                  return matchesName && matchesType;
                }).map(pokemon => (
                  <div key={pokemon.id} style={{ background: "rgba(25, 30, 20, 0.8)", border: "1px solid rgba(80, 100, 50, 0.3)", borderRadius: "12px", padding: "0.75rem", textAlign: "center", cursor: "pointer" }} onClick={() => handleAddPokemonToBox(pokemon, selectedBoxForAdd)}>
                    {sprites[pokemon.id] && <img src={sprites[pokemon.id]} alt={pokemon.name} style={{ height: "60px", width: "auto", marginBottom: "0.5rem" }} />}
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>{pokemon.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Nv. {pokemon.level}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowAddModal(false)} className="primary-button" style={{ marginTop: "2rem" }}>Fechar</button>
          </div>
        </div>
      )}

      {/* Create Box Modal */}
      {showCreateBoxModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowCreateBoxModal(false)}>
          <div style={{ background: "rgba(20, 20, 20, 0.95)", borderRadius: "var(--radius-lg)", padding: "2rem", maxWidth: "400px", border: "1px solid rgba(80, 100, 50, 0.3)", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", color: "#fff" }}>Criar Nova Box</h2>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>Nome da Box</label>
              <input type="text" value={newBoxName} onChange={(e) => setNewBoxName(e.target.value)} placeholder="Ex: Favoritos" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(80, 100, 50, 0.5)", background: "rgba(12, 12, 12, 0.9)", color: "white", fontSize: "0.95rem" }} onKeyPress={(e) => { if (e.key === "Enter") handleCreateBox(); }} />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={handleCreateBox} className="primary-button" style={{ flex: 1, marginTop: 0 }}>Criar</button>
              <button onClick={() => setShowCreateBoxModal(false)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid rgba(80, 100, 50, 0.5)", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontSize: "0.95rem" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Box Modal */}
      {showEditBoxModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowEditBoxModal(false)}>
          <div style={{ background: "rgba(20, 20, 20, 0.95)", borderRadius: "var(--radius-lg)", padding: "2rem", maxWidth: "400px", border: "1px solid rgba(80, 100, 50, 0.3)", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", color: "#fff" }}>Editar Nome da Box</h2>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>Novo Nome</label>
              <input type="text" value={editingBoxName} onChange={(e) => setEditingBoxName(e.target.value)} placeholder="Digite o novo nome da box" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(80, 100, 50, 0.5)", background: "rgba(12, 12, 12, 0.9)", color: "white", fontSize: "0.95rem" }} onKeyPress={(e) => { if (e.key === "Enter") handleEditBoxName(); }} />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={handleEditBoxName} className="primary-button" style={{ flex: 1, marginTop: 0 }}>Salvar</button>
              <button onClick={() => setShowEditBoxModal(false)} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid rgba(80, 100, 50, 0.5)", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontSize: "0.95rem" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoxesPage;
