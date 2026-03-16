import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TeamPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [teamPokemons, setTeamPokemons] = useState({});
  const [sprites, setSprites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");

  function getHpColor(percent) {
    if (percent < 33) return "var(--danger)";
    if (percent < 66) return "#facc15";
    return "var(--accent)";
  }

  function getHpPercent(pokemon) {
    if (!pokemon.hp) return 100;
    return Math.min(100, (pokemon.hp / 100) * 100);
  }

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

  useEffect(() => {
    async function loadTeams() {
      if (!user) return;

      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await fetch(`/api/equipes/treinador/${user.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao carregar equipes");
        const data = await res.json();
        setTeams(data.rows || []);

        const boxesRes = await fetch(`/api/boxes/treinador/${user.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (boxesRes.ok) {
          const boxesData = await boxesRes.json();
          setBoxes(boxesData.rows || []);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, [user]);

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
      await loadSprites(Array.from(allPokemonsMap.values()));
    }

    loadTeamPokemons();
  }, [teams]);

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

  async function handleRemoveFromTeam(pokemon, teamId, targetBoxId = null) {
    try {
      const token = localStorage.getItem("token");
      
      // Se não houver boxId selecionado, tentamos usar a primeira box do usuário, se houver
      const fallbackBoxId = boxes.length > 0 ? boxes[0].id : null;
      const finalBoxId = targetBoxId || fallbackBoxId;

      const res = await fetch(`/api/pokemons/${pokemon.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ boxId: finalBoxId, teamId: null })
      });

      if (!res.ok) throw new Error("Erro ao remover pokémon da equipe");

      // Reload team pokemons
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

  async function handleEditTeamName() {
    try {
      if (!editingTeamName.trim()) {
        setError("O nome da equipe não pode estar vazio");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`/api/equipes/${editingTeamId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingTeamName })
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Erro da API:", data);
        throw new Error(data.message || "Erro ao editar equipe");
      }

      // Recarregar equipes do servidor para garantir sincronização
      const teamsRes = await fetch(`/api/equipes/treinador/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData.rows || []);
      }

      setEditingTeamName("");
      setEditingTeamId(null);
      setShowEditTeamModal(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  async function handleCreateTeam() {
    try {
      if (!newTeamName.trim()) {
        setError("O nome da equipe não pode estar vazio");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("/api/equipes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTeamName, treinadorId: user.id })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar equipe");
      }

      // Recarregar
      const teamsRes = await fetch(`/api/equipes/treinador/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData.rows || []);
      }

      setNewTeamName("");
      setShowCreateTeamModal(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  function openEditTeamModal(team) {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
    setShowEditTeamModal(true);
  }

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>;
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Minhas Equipes</h1>
        <p className="page-subtitle">
          Administre suas equipes de pokémons ativos.
        </p>
      </header>

      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid var(--danger)",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
          marginBottom: "1.5rem",
          color: "var(--danger)"
        }}>
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <section className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>
            Você ainda não formou uma equipe
          </h2>
          <p style={{ color: "var(--text-soft)", marginBottom: "2rem" }}>
            Crie sua primeira equipe para conseguir batalhar e usar seus pokémons
          </p>
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="primary-button"
            style={{ width: "auto", padding: "0.75rem 2rem", marginTop: 0 }}
          >
            + Formar Equipe Principal
          </button>
        </section>
      ) : (
        <>
          {teams.map(team => (
            <section key={team.id} className="card" style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                      {team.name}
                    </h2>
                    <button
                      onClick={() => openEditTeamModal(team)}
                      style={{
                        background: "rgba(59, 130, 246, 0.2)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        color: "#3b82f6",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        cursor: "pointer"
                      }}
                      title="Editar nome da equipe"
                    >
                      Editar
                    </button>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-soft)" }}>
                    {(teamPokemons[team.id] || []).length}/6 pokémons
                  </p>
                </div>
              </div>

            {(teamPokemons[team.id] || []).length === 0 ? (
              <p style={{ color: "var(--text-soft)", textAlign: "center", padding: "2rem 0" }}>
                Nenhum pokémon nesta equipe
              </p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1.5rem"
              }}>
                {(teamPokemons[team.id] || []).map(pokemon => (
                  <div
                    key={pokemon.id}
                    style={{
                      background: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid rgba(39, 39, 42, 0.95)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      textAlign: "center",
                      cursor: "pointer"
                    }}
                    onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                  >
                    {sprites[pokemon.id] && (
                      <img
                        src={sprites[pokemon.id]}
                        alt={pokemon.name}
                        style={{ height: "80px", width: "auto", marginBottom: "0.75rem" }}
                      />
                    )}
                    <p style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                      {pokemon.name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-soft)", marginBottom: "0.75rem" }}>
                      Nv. {pokemon.level}
                    </p>

                    <div style={{
                      background: "rgba(0,0,0,0.2)",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      marginBottom: "0.75rem",
                      fontSize: "0.75rem",
                      color: "var(--text-soft)"
                    }}>
                      <p>HP: {pokemon.hp}</p>
                      <p>ATK: {pokemon.attack}</p>
                      <p>DEF: {pokemon.defense}</p>
                    </div>

                    <div style={{
                      height: "8px",
                      borderRadius: "999px",
                      background: "rgba(0,0,0,0.3)",
                      marginBottom: "0.75rem",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${getHpPercent(pokemon)}%`,
                        background: getHpColor(getHpPercent(pokemon))
                      }} />
                    </div>

                    {boxes.length > 0 ? (
                      <select
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(39, 39, 42, 0.95)",
                          background: "rgba(12, 12, 12, 0.95)",
                          color: "var(--text)",
                          fontSize: "0.7rem",
                          cursor: "pointer"
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleRemoveFromTeam(pokemon, team.id, Number(e.target.value));
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">Retornar para a Box...</option>
                        {boxes.map(box => (
                          <option key={box.id} value={box.id}>
                            {box.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromTeam(pokemon, team.id);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          background: "transparent",
                          border: "1px solid var(--danger)",
                          color: "var(--danger)",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        Remover da Equipe
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
        }
        </>
      )}

      {/* Edit Team Name Modal */}
      {showEditTeamModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }} onClick={() => setShowEditTeamModal(false)}>
          <div style={{
            background: "rgba(20, 20, 20, 0.95)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            maxWidth: "400px",
            border: "1px solid rgba(39, 39, 42, 0.95)",
            width: "90%"
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>
              Editar Nome da Equipe
            </h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-soft)"
              }}>
                Novo Nome
              </label>
              <input
                type="text"
                value={editingTeamName}
                onChange={(e) => setEditingTeamName(e.target.value)}
                placeholder="Digite o novo nome da equipe"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(39, 39, 42, 0.95)",
                  background: "rgba(12, 12, 12, 0.9)",
                  color: "var(--text)",
                  fontSize: "0.95rem",
                  boxSizing: "border-box"
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleEditTeamName();
                  }
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={handleEditTeamName}
                className="primary-button"
                style={{ flex: 1, marginTop: 0 }}
              >
                Salvar
              </button>
              <button
                onClick={() => setShowEditTeamModal(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "rgba(39, 39, 42, 0.5)",
                  border: "1px solid rgba(39, 39, 42, 0.95)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: "0.95rem"
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }} onClick={() => setShowCreateTeamModal(false)}>
          <div style={{
            background: "rgba(20, 20, 20, 0.95)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            maxWidth: "400px",
            border: "1px solid rgba(39, 39, 42, 0.95)",
            width: "90%"
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>
              Nova Equipe
            </h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-soft)"
              }}>
                Nome da Equipe
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ex: Equipe de Fogo, Titulares..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(39, 39, 42, 0.95)",
                  background: "rgba(12, 12, 12, 0.9)",
                  color: "white",
                  fontSize: "0.95rem",
                  boxSizing: "border-box"
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTeam();
                  }
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={handleCreateTeam}
                className="primary-button"
                style={{ flex: 1, marginTop: 0 }}
              >
                Criar Equipe
              </button>
              <button
                onClick={() => setShowCreateTeamModal(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "rgba(39, 39, 42, 0.5)",
                  border: "1px solid rgba(39, 39, 42, 0.95)",
                  borderRadius: "var(--radius-md)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.95rem"
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TeamPage;
