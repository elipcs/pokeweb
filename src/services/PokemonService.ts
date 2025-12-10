import { PokemonRepository } from "../repository/PokemonRepository";

const pokemonRepository = new PokemonRepository();

export class PokemonService {
  async getAll() {
    return await pokemonRepository.getAllPokemons();
  }

  async getById(id: number) {
    const pokemon = await pokemonRepository.getPokemonById(id);
    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }
    return pokemon;
  }

  async create(data: {
    name?: string;
    type?: string;
    level?: number;
    hp?: number;
    attack?: number;
    defense?: number;
    spAtk?: number;
    spDef?: number;
    speed?: number;
  }) {
    const { name, type, level, hp, attack, defense, spAtk, spDef, speed } =
      data;

    if (
      !name ||
      !type ||
      level === undefined ||
      hp === undefined ||
      attack === undefined ||
      defense === undefined ||
      spAtk === undefined ||
      spDef === undefined ||
      speed === undefined
    ) {
      throw new Error("Todos os campos do Pokémon são obrigatórios");
    }

    return await pokemonRepository.createPokemon(
      name,
      type,
      level,
      hp,
      attack,
      defense,
      spAtk,
      spDef,
      speed
    );
  }

  async update(
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
    const pokemon = await pokemonRepository.updatePokemon(id, data);
    if (!pokemon) {
      throw new Error("Pokémon não encontrado");
    }
    return pokemon;
  }

  async delete(id: number) {
    const deleted = await pokemonRepository.deletePokemon(id);
    if (!deleted) {
      throw new Error("Pokémon não encontrado");
    }
    return true;
  }
}


