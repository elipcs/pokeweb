import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PokemonDetailPage() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [sprite, setSprite] = useState(null);

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const numericId = Number(id) || 6;
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${numericId}`
        );
        if (!response.ok) return;
        const data = await response.json();

        const base = {
          id: data.id,
          name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
          types: data.types.map((entry) => entry.type.name.toUpperCase()),
          number: `#${String(data.id).padStart(3, "0")}`,
          level: 36,
          xp: data.base_experience * 100,
          nextLevelXp: 4500,
          stats: {
            hp: data.stats[0]?.base_stat ?? 0,
            attack: data.stats[1]?.base_stat ?? 0,
            defense: data.stats[2]?.base_stat ?? 0,
            spAtk: data.stats[3]?.base_stat ?? 0,
            spDef: data.stats[4]?.base_stat ?? 0,
            speed: data.stats[5]?.base_stat ?? 0
          },
          availableLevelUp: true,
          availableEvolution: false
        };

        setPokemon(base);
        setSprite(
          data.sprites.other["official-artwork"].front_default ||
            data.sprites.front_default
        );
      } catch {
        // falha silenciosa, mantemos sem imagem/dados
      }
    }

    fetchPokemon();
  }, [id]);

  if (!pokemon) {
    return (
      <section className="card">
        <p style={{ fontSize: "0.9rem", color: "#a3a3a3" }}>
          Carregando informações do Pokémon...
        </p>
      </section>
    );
  }

  const maxStat = Math.max(
    pokemon.stats.hp,
    pokemon.stats.attack,
    pokemon.stats.defense,
    pokemon.stats.spAtk,
    pokemon.stats.spDef,
    pokemon.stats.speed,
    1
  );

  function percent(value) {
    return `${Math.round((value / maxStat) * 100)}%`;
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{pokemon.name}</h1>
        <p className="page-subtitle">
          Detalhes completos do seu Pokémon.
        </p>
      </header>

      <section className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) 160px",
            alignItems: "flex-start",
            marginBottom: "1.2rem",
            gap: "1.4rem"
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.3rem"
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600
                }}
              >
                {pokemon.name}
              </h2>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#9ca3af"
                }}
              >
                {pokemon.number}
              </span>
            </div>
            <div className="pokemon-types">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`type-pill type-${type.toLowerCase()}`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: "0.6rem"
            }}
          >
            <div
              style={{
                width: "100%",
                height: 140,
                borderRadius: 24,
                background:
                  "radial-gradient(circle at top, #1f2937, #020617)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: "1px solid rgba(63,63,70,0.9)"
              }}
            >
              {sprite ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img
                  src={sprite}
                  alt={`Imagem do Pokémon ${pokemon.name}`}
                  style={{ width: "80%", height: "80%", objectFit: "contain" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280"
                  }}
                >
                  Sem imagem
                </span>
              )}
            </div>

            <div className="pill-available">
              Level Up{" "}
              {pokemon.availableLevelUp ? "disponível" : "indisponível"}
            </div>
            <div
              className={
                pokemon.availableEvolution
                  ? "pill-available"
                  : "pill-unavailable"
              }
            >
              Evoluir{" "}
              {pokemon.availableEvolution ? "disponível" : "indisponível"}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            marginBottom: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem"
          }}
        >
          <span>Level {pokemon.level}</span>
          <span>
            {pokemon.xp.toLocaleString("pt-BR")} XP · Próximo nível:{" "}
            {pokemon.nextLevelXp.toLocaleString("pt-BR")} XP
          </span>
        </div>

        <div className="stats-grid">
          <div className="stat-row">
            <div className="stat-label">HP</div>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: percent(pokemon.stats.hp),
                  background:
                    "linear-gradient(90deg, #f97373, #fb7185)"
                }}
              />
            </div>
            <div className="stat-value">{pokemon.stats.hp}</div>
          </div>

          <div className="stat-row">
            <div className="stat-label">Attack</div>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: percent(pokemon.stats.attack),
                  background:
                    "linear-gradient(90deg, #facc15, #f97316)"
                }}
              />
            </div>
            <div className="stat-value">{pokemon.stats.attack}</div>
          </div>

          <div className="stat-row">
            <div className="stat-label">Defense</div>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: percent(pokemon.stats.defense),
                  background:
                    "linear-gradient(90deg, #facc15, #22c55e)"
                }}
              />
            </div>
            <div className="stat-value">{pokemon.stats.defense}</div>
          </div>

          <div className="stat-row">
            <div className="stat-label">Sp. Atk</div>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: percent(pokemon.stats.spAtk),
                  background:
                    "linear-gradient(90deg, #38bdf8, #6366f1)"
                }}
              />
            </div>
            <div className="stat-value">{pokemon.stats.spAtk}</div>
          </div>

          <div className="stat-row">
            <div className="stat-label">Sp. Def</div>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: percent(pokemon.stats.spDef),
                  background:
                    "linear-gradient(90deg, #22c55e, #4ade80)"
                }}
              />
            </div>
            <div className="stat-value">{pokemon.stats.spDef}</div>
          </div>

          <div className="stat-row">
            <div className="stat-label">Speed</div>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: percent(pokemon.stats.speed),
                  background:
                    "linear-gradient(90deg, #f472b6, #ec4899)"
                }}
              />
            </div>
            <div className="stat-value">{pokemon.stats.speed}</div>
          </div>
        </div>
      </section>
    </>
  );
}

export default PokemonDetailPage;

