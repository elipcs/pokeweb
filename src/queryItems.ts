import { Item } from "./models/Item";
import sequelize from "./config/database";

async function queryItems() {
  await sequelize.sync();
  
  const items = await Item.findAll({
    order: [['id', 'DESC']],
    limit: 20
  });

  console.log("\n📦 ITENS NO BANCO DE DADOS:\n");
  console.log("ID | Nome | Categoria | Quantidade | Treinador ID");
  console.log("---+------+-----------+------------+-------------");
  
  items.forEach(item => {
    console.log(`${item.id} | ${item.name} | ${item.category} | ${item.quantity} | ${item.treinadorId}`);
  });

  console.log(`\nTotal de itens: ${items.length}`);
  
  process.exit(0);
}

queryItems().catch(console.error);
