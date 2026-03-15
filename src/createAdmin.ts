import { Treinador } from "./models/Treinador";
import sequelize from "./config/database";

async function createAdmin() {
  await sequelize.sync();
  
  const [admin, created] = await Treinador.findOrCreate({
    where: { email: "admin@pokeweb.com" },
    defaults: {
      name: "Administrador Global",
      email: "admin@pokeweb.com",
      password: "admin", // The model has a hook to hash this
      role: "ADMIN"
    }
  });

  if (created) {
    console.log("Usuário administrador criado com sucesso!");
    console.log("Email: admin@pokeweb.com");
    console.log("Senha: admin");
  } else {
    console.log("Usuário administrador já existe no banco de dados.");
  }
  
  process.exit(0);
}

createAdmin().catch(console.error);
