import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import "./models/relationships"; // Importar relacionamentos
import treinadorController from "./controllers/TreinadorController";
import pokemonController from "./controllers/PokemonController";
import itemController from "./controllers/ItemController";
import boxController from "./controllers/BoxController";
import equipeController from "./controllers/EquipeController";
import { setupSwagger } from "./swagger";

dotenv.config();

const app = express();
app.use(express.json());

<<<<<<< HEAD
// Registrar rotas com prefixo /api
app.use("/api/treinadores", treinadorController);
app.use("/api/pokemons", pokemonController);
app.use("/api/items", itemController);
=======
// Configurar Swagger
setupSwagger(app);

// Registrar rotas
app.use("/api/treinadores", treinadorController);
app.use("/api/pokemons", pokemonController);
app.use("/api/itens", itemController);
>>>>>>> 3303afb (Adiciona documentação do swagger)
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
