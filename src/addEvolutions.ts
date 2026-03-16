import { Pokemon } from "./models/Pokemon";
import sequelize from "./config/database";

async function addEvolutions() {
  await sequelize.sync();

  const evolutionData = [
    { name: "Charmander", evolvesTo: "Charmeleon", evolutionLevel: 16 },
    { name: "Charmeleon", evolvesTo: "Charizard", evolutionLevel: 36 },
    { name: "Squirtle", evolvesTo: "Wartortle", evolutionLevel: 16 },
    { name: "Wartortle", evolvesTo: "Blastoise", evolutionLevel: 36 },
    { name: "Bulbasaur", evolvesTo: "Ivysaur", evolutionLevel: 16 },
    { name: "Ivysaur", evolvesTo: "Venusaur", evolutionLevel: 32 },
    { name: "Pidgeot", evolvesTo: null, evolutionLevel: null },
    { name: "Pikachu", evolvesTo: "Raichu", evolutionLevel: 25 }
  ];

  console.log("Adicionando dados de evolução...\n");

  for (const data of evolutionData) {
    const pokemon = await Pokemon.findOne({ where: { name: data.name } });
    
    if (pokemon) {
      await pokemon.update({
        evolvesTo: data.evolvesTo,
        evolutionLevel: data.evolutionLevel
      });
      console.log(`✓ ${data.name}${data.evolvesTo ? ` → evolui para ${data.evolvesTo} no nível ${data.evolutionLevel}` : " (sem evolução)"}`);
    } else {
      console.log(`✗ ${data.name} não encontrado no banco`);
    }
  }

  console.log("\nDados de evolução atualizados!");
  process.exit(0);
}

addEvolutions().catch(console.error);
