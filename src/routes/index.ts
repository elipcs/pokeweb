import { Express } from "express";
import pokemonController from "./PokemonController";
import treinadorController from "./TreinadorController";
import boxController from "./BoxController";
import equipeController from "./EquipeController";
import itemController from "./ItemController";

export const setupRoutes = (app: Express) => {
  app.use("/api/pokemons", pokemonController);
  app.use("/api/treinadores", treinadorController);
  app.use("/api/boxes", boxController);
  app.use("/api/equipes", equipeController);
  app.use("/api/items", itemController);
};
