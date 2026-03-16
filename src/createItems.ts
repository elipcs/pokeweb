import { Treinador } from "./models/Treinador";
import { Item } from "./models/Item";
import sequelize from "./config/database";

async function createItems() {
  await sequelize.sync();

  // Buscar o admin
  const admin = await Treinador.findOne({
    where: { email: "admin@pokeweb.com" }
  });

  if (!admin) {
    console.log("Admin não encontrado. Execute createAdmin.ts primeiro.");
    process.exit(1);
  }

  const items = [
    // Pokébolas
    {
      name: "Pokébola",
      description: "Uma pokébola comum para capturar pokémon em condições normais.",
      category: "Pokéballs",
      quantity: 20,
      treinadorId: admin.id
    },
    {
      name: "Superball",
      description: "Uma versão melhorada da pokébola com maior taxa de sucesso.",
      category: "Pokéballs",
      quantity: 10,
      treinadorId: admin.id
    },
    {
      name: "Ultraball",
      description: "A melhor pokébola padrão disponível, com altíssima taxa de sucesso.",
      category: "Pokéballs",
      quantity: 5,
      treinadorId: admin.id
    },
    // Medicamentos
    {
      name: "Antídoto",
      description: "Cura o envenenamento de um pokémon.",
      category: "Medicine",
      quantity: 15,
      treinadorId: admin.id
    },
    {
      name: "Antisséptico",
      description: "Cura queimaduras de um pokémon.",
      category: "Medicine",
      quantity: 10,
      treinadorId: admin.id
    },
    {
      name: "Descongelante",
      description: "Descongela um pokémon congelado.",
      category: "Medicine",
      quantity: 8,
      treinadorId: admin.id
    },
    // Berries
    {
      name: "Framboesa",
      description: "Uma baga que cura a confusão de um pokémon.",
      category: "Berries",
      quantity: 12,
      treinadorId: admin.id
    },
    {
      name: "Mirtilo",
      description: "Uma baga que reduz a especial de um pokémon inimigo.",
      category: "Berries",
      quantity: 12,
      treinadorId: admin.id
    },
    {
      name: "Cereja",
      description: "Uma baga que cura a paralisia de um pokémon.",
      category: "Berries",
      quantity: 12,
      treinadorId: admin.id
    }
  ];

  console.log(`Criando itens para admin: ${admin.email}...`);

  for (const itemData of items) {
    const [item, created] = await Item.findOrCreate({
      where: { name: itemData.name, treinadorId: admin.id },
      defaults: itemData
    });

    if (created) {
      console.log(`✓ Item criado: ${item.name} (${item.category})`);
    } else {
      console.log(`- Item já existe: ${item.name}`);
    }
  }

  console.log("Itens carregados com sucesso!");
  process.exit(0);
}

createItems().catch(console.error);
