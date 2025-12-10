import { Pokemon } from "../models/Pokemon";

export class PokemonRepository {
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

  async getAllPokemons() {
    return await Pokemon.findAll();
  }

  async getPokemonById(id: number) {
    return await Pokemon.findByPk(id);
  }

  async updatePokemon(
    id: number,
    data: Partial<{
      name: string;
      type: string;
      level: number;
      hp: number;
      attack: number;
      defense: number;
      spAtk: number;
      spDef: number;
      speed: number;
    }>
  ) {
    const pokemon = await Pokemon.findByPk(id);
    if (!pokemon) return null;

    return await pokemon.update(data);
  }

  async deletePokemon(id: number) {
    const pokemon = await Pokemon.findByPk(id);
    if (!pokemon) return false;

    await pokemon.destroy();
    return true;
  }
}
