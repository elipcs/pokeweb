import { Treinador } from "./Treinador";
import { Pokemon } from "./Pokemon";
import { Item } from "./Item";
import { Box } from "./Box";
import { Equipe } from "./Equipe";

// Treinador 1:N Pokemon
Treinador.hasMany(Pokemon, { foreignKey: "trainerId", as: "pokemons" });
Pokemon.belongsTo(Treinador, { foreignKey: "trainerId", as: "treinador" });

// Treinador 1:N Box
Treinador.hasMany(Box, { foreignKey: "treinadorId", as: "boxes" });
Box.belongsTo(Treinador, { foreignKey: "treinadorId", as: "treinador" });

// Treinador 1:N Equipe
Treinador.hasMany(Equipe, { foreignKey: "treinadorId", as: "equipes" });
Equipe.belongsTo(Treinador, { foreignKey: "treinadorId", as: "treinador" });

// Treinador 1:N Item
Treinador.hasMany(Item, { foreignKey: "treinadorId", as: "itens" });
Item.belongsTo(Treinador, { foreignKey: "treinadorId", as: "treinador" });

// Box 1:N Pokemon
Box.hasMany(Pokemon, { foreignKey: "boxId", as: "pokemons" });
Pokemon.belongsTo(Box, { foreignKey: "boxId", as: "box" });

// Equipe 1:N Pokemon
Equipe.hasMany(Pokemon, { foreignKey: "teamId", as: "pokemons" });
Pokemon.belongsTo(Equipe, { foreignKey: "teamId", as: "equipe" });

