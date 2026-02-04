import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import "./models/relationships"; // Importar relacionamentos
import treinadorController from "./controllers/TreinadorController";
import pokemonController from "./controllers/PokemonController";
import itemController from "./controllers/ItemController";
import boxController from "./controllers/BoxController";
import equipeController from "./controllers/EquipeController";
import { AuthController } from "./controllers/AuthController";
import { verifyToken, isAdmin } from "./middleware/authMiddleware";
import { setupSwagger } from "./swagger";

const authController = new AuthController();

dotenv.config();

const app = express();
app.use(express.json());

// Configurar Swagger
setupSwagger(app);

// Registrar rotas
// Auth Routes
app.post("/api/auth/login", authController.login);
app.post("/api/auth/register", authController.register);

// Protected Routes
app.use("/api/treinadores", verifyToken, treinadorController);
app.use("/api/pokemons", verifyToken, pokemonController);
app.use("/api/itens", verifyToken, itemController);
app.use("/api/boxes", verifyToken, boxController);
app.use("/api/equipes", verifyToken, equipeController);

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
