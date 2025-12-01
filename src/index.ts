import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import treinadorController from "./controllers/TreinadorController";

dotenv.config();

const app = express();
app.use(express.json());

// Registrar rotas
app.use("/treinadores", treinadorController);

// Sincronizar banco e subir servidor
const PORT = process.env.PORT || 3000;

sequelize
  .sync({ force: true }) // CUIDADO: apaga a tabela toda vez que sobe!
  .then(() => {
    console.log("Banco de dados conectado!");
    app.listen(PORT, () =>
      console.log(`Servidor rodando na porta ${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });
