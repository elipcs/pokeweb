import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [boxPokemons, setBoxPokemons] = useState({});
  const [teamPokemons, setTeamPokemons] = useState({});
  const [sprites, setSprites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBoxForAdd, setSelectedBoxForAdd] = useState(null);
  const [availablePokemons, setAvailablePokemons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateBoxModal, setShowCreateBoxModal] = useState(false);
  const [showEditBoxModal, setShowEditBoxModal] = useState(false);
  const [newBoxName, setNewBoxName] = useState("");
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [editingBoxName, setEditingBoxName] = useState("");
  const [pokemonSearch, setPokemonSearch] = useState("");

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
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!boxesRes.ok) throw new Error("Erro ao carregar boxes");
        const boxesData = await boxesRes.json();
        setBoxes(boxesData.rows || []);

        // Load teams
        const teamsRes = await fetch(`/api/equipes/treinador/${user.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!teamsRes.ok) throw new Error("Erro ao carregar equipes");
        const teamsData = await teamsRes.json();
        setTeams(teamsData.rows || []);

        // Load available pokemons (not in any box or team)
        const allPokemonsRes = await fetch("/api/pokemons?limit=1000", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (allPokemonsRes.ok) {
          const allPokemons = await allPokemonsRes.json();
          // Remove duplicates by name so we only see 'species' templates
          const availableList = [];
          const seenNames = new Set();
          (allPokemons.rows || []).filter(p => !p.boxId && !p.teamId).forEach(p => {
             if (!seenNames.has(p.name)) {
               seenNames.add(p.name);
               availableList.push(p);
             }
          });
          setAvailablePokemons(availableList);
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

      // Load sprites for all pokemons
      await loadSprites(Array.from(allPokemonsMap.values()));
    }

    loadBoxPokemons();
  }, [boxes]);

  // Load pokemons for each team
  useEffect(() => {
    async function loadTeamPokemons() {
      if (teams.length === 0) return;

      const newTeamPokemons = {};
      const allPokemonsMap = new Map();

      const token = localStorage.getItem("token");
      for (const team of teams) {
        try {
          const res = await fetch(`/api/pokemons/team/${team.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            newTeamPokemons[team.id] = data.rows || [];
            (data.rows || []).forEach(p => allPokemonsMap.set(p.id, p));
          }
        } catch (err) {
          console.error(`Erro ao carregar pokémons da equipe ${team.id}:`, err);
        }
      }

      setTeamPokemons(newTeamPokemons);

      // Load sprites for all pokemons
      await loadSprites(Array.from(allPokemonsMap.values()));
    }

    loadTeamPokemons();
  }, [teams]);

  // Load sprites from PokéAPI
  async function loadSprites(pokemons) {
    if (pokemons.length === 0) return;

    const newMap = {};
    const promises = pokemons.map(async (p) => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
        if (res.ok) {
          const data = await res.json();
          newMap[p.id] = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;
        }
      } catch (err) {
        // Silent fail
      }
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

      if (!res.ok) throw new Error("Erro ao adicionar pokémon à box");

      // Reload box pokemons
      const boxRes = await fetch(`/api/pokemons/box/${boxId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (boxRes.ok) {
        const data = await boxRes.json();
        setBoxPokemons(prev => ({
          ...prev,
          [boxId]: data.rows || []
        }));
      }

      // Não removemos o pokémon da lista de disponíveis pois ele atua como um 'template' global.
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
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
        body: JSON.stringify({
          pokemonId: pokemon.id,
          targetType: "team",
          targetId: teamId
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao transferir pokémon");
      }

      // Reload data
      if (pokemon.boxId) {
        const boxRes = await fetch(`/api/pokemons/box/${pokemon.boxId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (boxRes.ok) {
          const data = await boxRes.json();
          setBoxPokemons(prev => ({
            ...prev,
            [pokemon.boxId]: data.rows || []
          }));
        }
      }

      const teamRes = await fetch(`/api/pokemons/team/${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (teamRes.ok) {
        const data = await teamRes.json();
        setTeamPokemons(prev => ({
          ...prev,
          [teamId]: data.rows || []
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  async function handleCreateBox() {
    try {
      if (!newBoxName.trim()) {
        setError("O nome da box não pode estar vazio");
        return;
      }

      const token = localStorage.getItem("token");
      console.log("Token enviado:", token ? "Sim" : "Não");
      console.log("Dados da requisição:", { name: newBoxName, treinadorId: user.id });

      const res = await fetch("/api/boxes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newBoxName, treinadorId: user.id })
      });

      console.log("Status da resposta:", res.status);

      if (!res.ok) {
        const data = await res.json();
        console.error("Erro da API:", data);
        throw new Error(data.message || "Erro ao criar box");
      }

      const newBox = await res.json();
      console.log("Box criada:", newBox);
      
      // Recarregar boxes do servidor para garantir sincronização
      const boxesRes = await fetch(`/api/boxes/treinador/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (boxesRes.ok) {
        const boxesData = await boxesRes.json();
        setBoxes(boxesData.rows || []);
      }
      
      setNewBoxName("");
      setShowCreateBoxModal(false);
      setError("");
    } catch (err) {
      console.error("Erro ao criar box:", err);
      setError(err.message);
    }
  }

  async function handleEditBoxName() {
    try {
      if (!editingBoxName.trim()) {
        setError("O nome da box não pode estar vazio");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`/api/boxes/${editingBoxId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingBoxName })
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Erro da API:", data);
        throw new Error(data.message || "Erro ao editar box");
      }

      // Recarregar boxes do servidor para garantir sincronização
      const boxesRes = await fetch(`/api/boxes/treinador/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (boxesRes.ok) {
        const boxesData = await boxesRes.json();
        setBoxes(boxesData.rows || []);
      }
      
      setEditingBoxName("");
      setEditingBoxId(null);
      setShowEditBoxModal(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  function openEditBoxModal(box) {
    setEditingBoxId(box.id);
    setEditingBoxName(box.name);
    setShowEditBoxModal(true);
  }

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>;
  }

  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* Hero Header Area */}
      <div style={{
        position: "relative",
        height: "220px",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "2rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 2rem",
        background: "linear-gradient(to bottom, rgba(30, 30, 15, 0) 0%, rgba(20, 25, 10, 0.95) 100%), radial-gradient(circle at center top, rgba(230, 230, 0, 0.25) 0%, rgba(0,0,0,0) 70%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}>
        <h1 style={{ 
          fontSize: "2.2rem", 
          fontWeight: 800, 
          color: "#fff", 
          margin: "0 0 0.5rem 0",
          textShadow: "0 2px 10px rgba(0,0,0,0.8)"
        }}>
          Trainer Dashboard
        </h1>
        <p style={{ 
          fontSize: "1rem", 
          color: "rgba(255,255,255,0.7)", 
          margin: 0,
          textShadow: "0 1px 5px rgba(0,0,0,0.8)"
        }}>
          Bem-vindo de volta, Treinador. Sua jornada continua.
        </p>
      </div>

      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid var(--danger)",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
          marginBottom: "1.5rem",
          color: "var(--danger)"
        }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2.5rem",
        alignItems: "start"
      }}>
        
        {/* Teams Column */}
        <div>
          <h2 style={{ 
            fontSize: "1.2rem", 
            fontWeight: 700, 
            marginBottom: "1rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            color: "#fff" 
          }}>
            👥 Equipe atual
          </h2>

          {teams.length > 0 ? (
            <div>
              {teams.map(team => (
                <div key={team.id} style={{ marginBottom: "2rem" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem"
                  }}>
                    {(teamPokemons[team.id] || []).length === 0 ? (
                      <div style={{ padding: "1rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic", gridColumn: "1 / -1" }}>
                        Equipe vazia
                      </div>
                    ) : (
                      (teamPokemons[team.id] || []).map(pokemon => (
                        <div
                          key={pokemon.id}
                          style={{
                            background: "rgba(25, 30, 20, 0.8)",
                            border: "1px solid rgba(80, 100, 50, 0.3)",
                            borderRadius: "12px",
                            padding: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            cursor: "pointer",
                            transition: "transform 0.2s, borderColor 0.2s",
                          }}
                          onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.borderColor = "rgba(120, 150, 70, 0.6)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "rgba(80, 100, 50, 0.3)";
                          }}
                        >
                          <div style={{
                            width: "60px",
                            height: "60px",
                            background: "rgba(10, 15, 5, 0.6)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.05)"
                          }}>
                            {sprites[pokemon.id] && (
                              <img
                                src={sprites[pokemon.id]}
                                alt={pokemon.name}
                                style={{ width: "80%", height: "80%", objectFit: "contain" }}
                              />
                            )}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                              <span style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{pokemon.name}</span>
                              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: "bold" }}>Lv.{pokemon.level}</span>
                            </div>
                            
                            <div style={{
                              height: "4px",
                              borderRadius: "4px",
                              background: "rgba(0,0,0,0.5)",
                              marginBottom: "0.5rem",
                              overflow: "hidden"
                            }}>
                              <div style={{
                                height: "100%",
                                width: `${getHpPercent(pokemon)}%`,
                                background: getHpColor(getHpPercent(pokemon)),
                                borderRadius: "4px"
                              }} />
                            </div>

                            <div style={{ display: "flex", gap: "0.25rem" }}>
                              {pokemon.type.split("/").map(t => {
                                const typeStr = t.trim().toUpperCase();
                                return (
                                  <span key={typeStr} style={{ 
                                    padding: "0.15rem 0.4rem", 
                                    borderRadius: "4px", 
                                    fontSize: "0.6rem", 
                                    fontWeight: "800",
                                    backgroundColor: typeStr === "FIRE" ? "#ff4a4a" : typeStr === "FLYING" ? "#6d5e9b" : typeStr === "WATER" ? "#3865a3" : typeStr === "GRASS" ? "#4a924a" : typeStr === "ELECTRIC" ? "#baba2a" : typeStr === "NORMAL" ? "#666" : typeStr === "POISON" ? "#8a428a" : typeStr === "GHOST" ? "#5a328a" : "rgba(255,255,255,0.2)",
                                    color: "#fff",
                                    letterSpacing: "0.05em"
                                  }}>
                                    {typeStr}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.5)" }}>Nenhuma equipe configurada. Acesse "/team".</div>
          )}
        </div>

        {/* Boxes Column */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ 
              fontSize: "1.2rem", 
              fontWeight: 700, 
              color: "#fff" 
            }}>
              Boxes
            </h2>
            <button
              onClick={() => navigate("/boxes")}
              style={{
                background: "transparent",
                border: "none",
                color: "#eab308",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Gerenciar
            </button>
          </div>

          {boxes.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem"
            }}>
              {boxes.map(box => (
                <div 
                  key={box.id}
                  style={{
                    background: "rgba(25, 30, 20, 0.4)",
                    border: "1px solid rgba(80, 100, 50, 0.3)",
                    borderRadius: "12px",
                    padding: "1.5rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(40, 50, 30, 0.6)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(25, 30, 20, 0.4)"}
                  onClick={() => navigate("/boxes")}
                >
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#eab308",
                    marginBottom: "0.5rem"
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{box.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                    {(boxPokemons[box.id] || []).length} pokémons
                  </span>

                  {(boxPokemons[box.id] || []).length > 0 && (
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "1rem" }}>
                      {(boxPokemons[box.id] || []).slice(0, 4).map(p => (
                         <div key={p.id} style={{ width: "36px", height: "36px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                           {sprites[p.id] && <img src={sprites[p.id]} alt="" style={{ width: "80%", height: "80%", objectFit: "contain" }} />}
                         </div>
                      ))}
                      {(boxPokemons[box.id] || []).length > 4 && (
                         <div style={{ width: "36px", height: "36px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.05)" }}>
                           +{(boxPokemons[box.id] || []).length - 4}
                         </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.5)" }}>Nenhuma box criada.</div>
          )}
        </div>
      </div>


    </div>
  );
}

export default DashboardPage;
