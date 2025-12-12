import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import treinadorController from "./controllers/TreinadorController";
import pokemonController from "./controllers/PokemonController";
import itemController from "./controllers/ItemController";
import boxController from "./controllers/BoxController";
import equipeController from "./controllers/EquipeController";
import { setupSwagger } from "./swagger";

dotenv.config();

const app = express();
app.use(express.json());

// Configurar Swagger
setupSwagger(app);

// Registrar rotas
app.use("/api/treinadores", treinadorController);
app.use("/api/pokemons", pokemonController);
app.use("/api/itens", itemController);
app.use("/api/boxes", boxController);
app.use("/api/equipes", equipeController);

// Sincronizar banco e subir servidor
const PORT = process.env.PORT || 3000;

sequelize
  .sync() // mantém dados existentes, sem recriar tabelas
  .then(() => {
    console.log("Banco de dados conectado!");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });
