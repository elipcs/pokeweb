import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PokemonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [pokeApiData, setPokeApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evolving, setEvolving] = useState(false);
  const [levelingUp, setLevelingUp] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/pokemons/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Erro ao carregar Pokémon");
        const data = await res.json();
        setPokemon(data);

        // Fetch do PokeApi para imagens
        try {
          const apiRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${data.name.toLowerCase()}`);
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            setPokeApiData(apiData);
          }
        } catch (e) {
          console.warn("Não foi possível carregar dados extras do PokeAPI");
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleLevelUp = async () => {
    if (levelingUp) return;
    try {
      setLevelingUp(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/pokemons/${id}/level-up`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setPokemon(result.pokemon || result);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao subir de nível");
      }
    } catch (err) {
      alert("Erro ao subir de nível");
    } finally {
      setLevelingUp(false);
    }
  };

  const handleEvolve = async () => {
    if (evolving) return;
    try {
      setEvolving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/pokemons/${id}/evolve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setPokemon(result);
        // Tenta buscar a nova imagem do PokeApi
        const apiRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${result.name.toLowerCase()}`);
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          setPokeApiData(apiData);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao evoluir");
      }
    } catch (err) {
      alert("Erro ao evoluir");
    } finally {
      setEvolving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#eef" }}>Carregando dados...</div>;
  }

  if (error || !pokemon) {
    return <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>{error || "Pokémon não encontrado"}</div>;
  }

  const types = pokemon.type.split("/").map(t => t.trim().toUpperCase());
  const pokedexNumber = pokeApiData ? `#${String(pokeApiData.id).padStart(3, "0")}` : "#???";
  const spriteUrl = pokeApiData?.sprites?.other?.["official-artwork"]?.front_default || pokeApiData?.sprites?.front_default || null;

  // Barra de XP fictícia já que não guardamos XP do pokémon no banco (apenas level)
  const requiredLevelToEvolve = pokemon.evolutionLevel || 999;
  const canEvolve = pokemon.evolvesTo && pokemon.level >= requiredLevelToEvolve;
  const canLevelUp = pokemon.level < 100;
  
  // XP mock para parecer com o design
  const xpCurrent = pokemon.level * 1000 * (pokemon.level / 2); // Ex: level 36 -> ~648,000
  const xpNext = (pokemon.level + 1) * 1000 * ((pokemon.level + 1) / 2);
  const xpPercent = Math.min(100, Math.max(0, ((pokemon.level % 10) / 10) * 100)) + "%";

  const maxStat = 255;
  const hpPercent = `${(pokemon.hp / maxStat) * 100}%`;
  const atkPercent = `${(pokemon.attack / maxStat) * 100}%`;
  const defPercent = `${(pokemon.defense / maxStat) * 100}%`;
  const spAtkPercent = `${(pokemon.spAtk / maxStat) * 100}%`;
  const spDefPercent = `${(pokemon.spDef / maxStat) * 100}%`;
  const spdPercent = `${(pokemon.speed / maxStat) * 100}%`;

  return (
    <div style={{ backgroundColor: "#1e221b", minHeight: "100vh", position: "absolute", inset: 0, top: "60px", padding: "2rem", boxSizing: "border-box", color: "#fafafa" }}>
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        
        {/* LEFT COLUMN: POKEMON INFO */}
        <div style={{ flex: "1 1 400px", maxWidth: "450px", background: "linear-gradient(135deg, rgba(85,95,50,0.8) 0%, rgba(45,55,30,0.9) 100%)", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "800", margin: "0 0 0.5rem 0", letterSpacing: "-0.5px" }}>{pokemon.name}</h1>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {types.map(t => (
                  <span key={t} style={{ 
                    padding: "0.2rem 0.6rem", 
                    borderRadius: "4px", 
                    fontSize: "0.75rem", 
                    fontWeight: "bold",
                    backgroundColor: t === "FIRE" ? "#ff8c00" : t === "FLYING" ? "#a890f0" : t === "WATER" ? "#6890f0" : t === "GRASS" ? "#78c850" : t === "ELECTRIC" ? "#f8d030" : "rgba(255,255,255,0.2)",
                    color: t === "ELECTRIC" ? "#000" : "#fff"
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "rgba(255,255,255,0.4)" }}>
              {pokedexNumber}
            </div>
          </div>
          
          <div style={{ backgroundColor: "#000000", borderRadius: "12px", width: "100%", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 50px rgba(0,0,0,1)", padding: "2rem", boxSizing: "border-box" }}>
            {spriteUrl ? (
              <img src={spriteUrl} alt={pokemon.name} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.15))" }} />
            ) : (
              <div style={{ color: "rgba(255,255,255,0.3)" }}>Sem imagem</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STATS AND ACTIONS */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* STATS CARD */}
          <div style={{ background: "rgba(20,25,15,0.9)", border: "1px solid rgba(100,120,60,0.4)", borderRadius: "16px", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 1.5rem 0" }}>Status</h2>
            
            <div style={{ display: "table", width: "100%", borderSpacing: "0 1rem" }}>
              <div style={{ display: "table-row" }}>
                <div style={{ display: "table-cell", width: "80px", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", verticalAlign: "middle" }}>HP</div>
                <div style={{ display: "table-cell", verticalAlign: "middle", paddingRight: "1rem" }}>
                  <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "#ff4d4d", borderRadius: "5px", width: hpPercent }}></div>
                  </div>
                </div>
                <div style={{ display: "table-cell", width: "30px", textAlign: "right", fontWeight: "bold", color: "#fff", verticalAlign: "middle" }}>{pokemon.hp}</div>
              </div>
              
              <div style={{ display: "table-row" }}>
                <div style={{ display: "table-cell", width: "80px", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", verticalAlign: "middle" }}>Attack</div>
                <div style={{ display: "table-cell", verticalAlign: "middle", paddingRight: "1rem" }}>
                  <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "#ff9900", borderRadius: "5px", width: atkPercent }}></div>
                  </div>
                </div>
                <div style={{ display: "table-cell", width: "30px", textAlign: "right", fontWeight: "bold", color: "#fff", verticalAlign: "middle" }}>{pokemon.attack}</div>
              </div>

              <div style={{ display: "table-row" }}>
                <div style={{ display: "table-cell", width: "80px", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", verticalAlign: "middle" }}>Defense</div>
                <div style={{ display: "table-cell", verticalAlign: "middle", paddingRight: "1rem" }}>
                  <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "#ffd700", borderRadius: "5px", width: defPercent }}></div>
                  </div>
                </div>
                <div style={{ display: "table-cell", width: "30px", textAlign: "right", fontWeight: "bold", color: "#fff", verticalAlign: "middle" }}>{pokemon.defense}</div>
              </div>

              <div style={{ display: "table-row" }}>
                <div style={{ display: "table-cell", width: "80px", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", verticalAlign: "middle" }}>Sp. Atk</div>
                <div style={{ display: "table-cell", verticalAlign: "middle", paddingRight: "1rem" }}>
                  <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "#4d4dff", borderRadius: "5px", width: spAtkPercent }}></div>
                  </div>
                </div>
                <div style={{ display: "table-cell", width: "30px", textAlign: "right", fontWeight: "bold", color: "#fff", verticalAlign: "middle" }}>{pokemon.spAtk}</div>
              </div>

              <div style={{ display: "table-row" }}>
                <div style={{ display: "table-cell", width: "80px", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", verticalAlign: "middle" }}>Sp. Def</div>
                <div style={{ display: "table-cell", verticalAlign: "middle", paddingRight: "1rem" }}>
                  <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "#00cc99", borderRadius: "5px", width: spDefPercent }}></div>
                  </div>
                </div>
                <div style={{ display: "table-cell", width: "30px", textAlign: "right", fontWeight: "bold", color: "#fff", verticalAlign: "middle" }}>{pokemon.spDef}</div>
              </div>

              <div style={{ display: "table-row" }}>
                <div style={{ display: "table-cell", width: "80px", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", verticalAlign: "middle" }}>Speed</div>
                <div style={{ display: "table-cell", verticalAlign: "middle", paddingRight: "1rem" }}>
                  <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "#ff33cc", borderRadius: "5px", width: spdPercent }}></div>
                  </div>
                </div>
                <div style={{ display: "table-cell", width: "30px", textAlign: "right", fontWeight: "bold", color: "#fff", verticalAlign: "middle" }}>{pokemon.speed}</div>
              </div>
            </div>
          </div>

          {/* LEVEL XP CARD */}
          <div style={{ background: "rgba(20,25,15,0.9)", border: "1px solid rgba(100,120,60,0.4)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Level {pokemon.level}</span>
              <span style={{ fontSize: "0.9rem", color: "#eab308", fontWeight: "bold" }}>Próximo Lvl: {xpNext.toLocaleString("pt-BR")} XP</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>
              {xpCurrent.toLocaleString("pt-BR")} XP
            </div>
            <div style={{ width: "100%", height: "12px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", backgroundColor: "#ffff00", borderRadius: "6px", width: xpPercent }}></div>
            </div>
          </div>

          {/* ACTIONS CARD */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <button 
              onClick={handleLevelUp}
              disabled={!canLevelUp || levelingUp}
              style={{
                backgroundColor: canLevelUp ? "#ffff00" : "rgba(255,255,255,0.1)",
                color: canLevelUp ? "#000" : "rgba(255,255,255,0.4)",
                border: "none",
                borderRadius: "12px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                cursor: canLevelUp ? "pointer" : "not-allowed",
                transition: "opacity 0.2s"
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 7l-5-5-5 5"></path><path d="M4 22h16"></path></svg>
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.25rem" }}>Level Up</span>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>{canLevelUp ? "DISPONÍVEL" : "NÍVEL MÁXIMO"}</span>
            </button>

            <button 
              onClick={handleEvolve}
              disabled={!canEvolve || evolving}
              style={{
                backgroundColor: canEvolve ? "#ffff00" : "rgba(255,255,255,0.05)",
                color: canEvolve ? "#000" : "rgba(255,255,255,0.3)",
                border: canEvolve ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                cursor: canEvolve ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.25rem" }}>Evoluir</span>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>{canEvolve ? "DISPONÍVEL" : (pokemon.evolvesTo ? `LVL ${requiredLevelToEvolve} REQUERIDO` : "INDISPONÍVEL")}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PokemonDetailPage;
