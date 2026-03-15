import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_TEAM = [
  { id: 25, name: "Pikachu", level: 88, types: ["electric"], hpPercent: 72 },
  { id: 6, name: "Charizard", level: 85, types: ["fire", "flying"], hpPercent: 90 },
  { id: 9, name: "Blastoise", level: 84, types: ["water"], hpPercent: 40 },
  { id: 3, name: "Venusaur", level: 84, types: ["grass", "poison"], hpPercent: 96 },
  { id: 143, name: "Snorlax", level: 82, types: ["normal"], hpPercent: 18 },
  { id: 94, name: "Gengar", level: 85, types: ["ghost", "poison"], hpPercent: 88 }
];

const MOCK_BOXES = [
  { id: 1, name: "Box 1" },
  { id: 2, name: "Box 2" },
  { id: 3, name: "Box 3" }
];

const BOX_POKEMON = {
  1: [MOCK_TEAM[0], MOCK_TEAM[1]],
  2: [MOCK_TEAM[2], MOCK_TEAM[3]],
  3: [MOCK_TEAM[4], MOCK_TEAM[5]]
};

function getHpColor(percent) {
  if (percent < 33) return "var(--danger)";
  if (percent < 66) return "#facc15";
  return "var(--accent)";
}

function DashboardPage() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(MOCK_TEAM);
  const [sprites, setSprites] = useState({});
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);

  useEffect(() => {
    async function loadSprites() {
      try {
        const allFromBoxes = Object.values(BOX_POKEMON).flat();
        const allPokemonMap = new Map();

        [...MOCK_TEAM, ...allFromBoxes].forEach((pokemon) => {
          if (!allPokemonMap.has(pokemon.id)) {
            allPokemonMap.set(pokemon.id, pokemon);
          }
        });

        const allPokemon = Array.from(allPokemonMap.values());

        const promises = allPokemon.map(async (pokemon) => {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
          );
          if (!response.ok) return { id: pokemon.id, sprite: null };
          const data = await response.json();
          return {
            id: pokemon.id,
            sprite:
              data.sprites.other["official-artwork"].front_default ||
              data.sprites.front_default
          };
        });

        const result = await Promise.all(promises);
        const spriteMap = {};
        result.forEach(({ id, sprite }) => {
          if (sprite) {
            spriteMap[id] = sprite;
          }
        });
        setSprites(spriteMap);
      } catch {
        // falha silenciosa, apenas não mostra imagens
      }
    }

    loadSprites();
  }, []);

  function getIsInTeam(pokemonId) {
    return team.some((member) => member.id === pokemonId);
  }

  function handleAddToTeam(pokemon) {
    if (getIsInTeam(pokemon.id) || team.length >= 6) return;
    setTeam((prev) => [...prev, pokemon]);
  }

  function handleRemoveFromTeam(pokemonId) {
    setTeam((prev) => prev.filter((pokemon) => pokemon.id !== pokemonId));
  }

  function openBoxModal(box) {
    setSelectedBox(box);
    setIsBoxModalOpen(true);
  }

  function closeBoxModal() {
    setIsBoxModalOpen(false);
    setSelectedBox(null);
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Trainer Dashboard</h1>
        <p className="page-subtitle">
          Bem-vindo de volta, Treinador. Sua jornada continua.
        </p>
      </header>

      <div className="grid-2">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Equipe atual</h2>
            <span className="pill-muted">
              {team.length} Pokémon na equipe
            </span>
          </div>
          <div className="team-grid">
            {team.map((pokemon) => (
              <button
                key={pokemon.id}
                type="button"
                className="pokemon-card"
                onClick={() => navigate(`/pokemon/${pokemon.id}`)}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px minmax(0, 1fr)",
                    gap: "0.8rem",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background: "#111827",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      border: "1px solid rgba(63,63,70,0.8)"
                    }}
                  >
                    {sprites[pokemon.id] ? (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img
                        src={sprites[pokemon.id]}
                        alt={`Imagem do Pokémon ${pokemon.name}`}
                        style={{ width: "88%", height: "88%", objectFit: "contain" }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#6b7280"
                        }}
                      >
                        ...
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="pokemon-name-row">
                      <span className="pokemon-name">{pokemon.name}</span>
                      <span className="pokemon-level">Lv.{pokemon.level}</span>
                    </div>
                    <div className="pokemon-types">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className={`type-pill type-${type.toLowerCase()}`}
                        >
                          {type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div className="hp-bar-track" style={{ marginTop: "0.45rem" }}>
                      <div
                        className="hp-bar-fill"
                        style={{
                          width: `${pokemon.hpPercent}%`,
                          background: getHpColor(pokemon.hpPercent)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Boxes</h2>
          </div>
          <div className="boxes-grid">
            {MOCK_BOXES.map((box) => (
              <button
                key={box.id}
                type="button"
                className="box-card"
                onClick={() => openBoxModal(box)}
              >
                <div className="box-card-header">
                  <span className="box-name">{box.name}</span>
                  <span className="box-count">
                    {(BOX_POKEMON[box.id] || []).length} Pokémon
                  </span>
                </div>

                <div className="box-card-body">
                  {(BOX_POKEMON[box.id] || []).map((pokemon) => (
                    <div key={pokemon.id} className="box-pokemon-row">
                      <div className="box-pokemon-avatar">
                        {sprites[pokemon.id] ? (
                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                          <img
                            src={sprites[pokemon.id]}
                            alt={`Imagem do Pokémon ${pokemon.name}`}
                          />
                        ) : (
                          <span className="box-pokemon-placeholder">...</span>
                        )}
                      </div>
                      <div className="box-pokemon-info">
                        <div className="box-pokemon-name-row">
                          <span className="box-pokemon-name">{pokemon.name}</span>
                          <span className="box-pokemon-level">
                            Lv.{pokemon.level}
                          </span>
                        </div>
                        <div className="hp-bar-track box-hp-track">
                          <div
                            className="hp-bar-fill"
                            style={{
                              width: `${pokemon.hpPercent}%`,
                              background: getHpColor(pokemon.hpPercent)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {isBoxModalOpen && selectedBox && (
        <div className="modal-backdrop" onClick={closeBoxModal}>
          <div
            className="modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedBox.name}</h2>
                <p className="modal-subtitle">
                  Gerencie os Pokémon desta box e da sua equipe.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeBoxModal}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {(BOX_POKEMON[selectedBox.id] || []).map((pokemon) => {
                const inTeam = getIsInTeam(pokemon.id);
                const teamFull = team.length >= 6 && !inTeam;

                return (
                  <div key={pokemon.id} className="modal-pokemon-row">
                    <div className="modal-pokemon-main">
                      <div className="box-pokemon-avatar">
                        {sprites[pokemon.id] ? (
                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                          <img
                            src={sprites[pokemon.id]}
                            alt={`Imagem do Pokémon ${pokemon.name}`}
                          />
                        ) : (
                          <span className="box-pokemon-placeholder">...</span>
                        )}
                      </div>
                      <div className="modal-pokemon-info">
                        <div className="box-pokemon-name-row">
                          <span className="box-pokemon-name">
                            {pokemon.name}
                          </span>
                          <span className="box-pokemon-level">
                            Lv.{pokemon.level}
                          </span>
                        </div>
                        <div className="hp-bar-track box-hp-track">
                          <div
                            className="hp-bar-fill"
                            style={{
                              width: `${pokemon.hpPercent}%`,
                              background: getHpColor(pokemon.hpPercent)
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="modal-action-button"
                      disabled={teamFull}
                      onClick={() =>
                        inTeam
                          ? handleRemoveFromTeam(pokemon.id)
                          : handleAddToTeam(pokemon)
                      }
                    >
                      {inTeam && "Remover da equipe"}
                      {!inTeam && !teamFull && "Adicionar à equipe"}
                      {teamFull && "Equipe cheia"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardPage;

