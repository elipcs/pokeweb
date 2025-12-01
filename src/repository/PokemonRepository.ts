/*
 * Repository Pokemon - COMENTADO TEMPORARIAMENTE
 * Será ativado em entregas futuras
 */

/*
import { Pokemon } from "../models/Pokemon";

export class PokemonRepository {
  // Criar um novo Pokémon
  async createPokemon(
    name: string,
    type: string,
    level: number,
    hp: number,
    attack: number,
    defense: number,
    spAtk: number,
    spDef: number,
    speed: number
  ) {
    const pokemon = await Pokemon.create({
      name,
      type,
      level,
      hp,
      attack,
      defense,
      spAtk,
      spDef,
      speed
    });

    return pokemon;
  }

  // Listar todos os Pokémons
  async getAllPokemons() {
    return await Pokemon.findAll();
  }

  // Buscar Pokémon por ID
  async getPokemonById(id: number) {
    return await Pokemon.findByPk(id);
  }

  // Atualizar Pokémon
  async updatePokemon(id: number, data: Partial<{
    name: string;
    type: string;
    level: number;
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  }>) {
    const pokemon = await Pokemon.findByPk(id);
    if (!pokemon) return null;
    
    return await pokemon.update(data);
  }

  // Deletar Pokémon
  async deletePokemon(id: number) {
    const pokemon = await Pokemon.findByPk(id);
    if (!pokemon) return false;
    
    await pokemon.destroy();
    return true;
  }
}
*/
