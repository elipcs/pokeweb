import { PokemonRepository } from "../repository/PokemonRepository";

const pokemonRepository = new PokemonRepository();

export class PokemonService {
  async getAll(params?: { page?: number; limit?: number; type?: string; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await pokemonRepository.getAllPokemons({
      limit,
      offset,
      type: params?.type,
      name: params?.name
    });
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
    trainerId?: number;
    boxId?: number | null;
    teamId?: number | null;
  }) {
    const { name, type, level, hp, attack, defense, spAtk, spDef, speed, trainerId, boxId, teamId } =
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
      speed === undefined ||
      trainerId === undefined
    ) {
      throw new Error("Todos os campos obrigatórios do Pokémon devem ser preenchidos");
    }

    // Validação: Pokémon não pode estar em box e equipe simultaneamente
    if (boxId !== null && boxId !== undefined && teamId !== null && teamId !== undefined) {
      throw new Error("Um Pokémon não pode estar em uma box e em uma equipe simultaneamente");
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
      speed,
      trainerId,
      boxId,
      teamId
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
      trainerId: number;
      boxId: number | null;
      teamId: number | null;
    }>
  ) {
    // Validação: Pokémon não pode estar em box e equipe simultaneamente
    if (data.boxId !== undefined && data.teamId !== undefined && data.boxId !== null && data.teamId !== null) {
      throw new Error("Um Pokémon não pode estar em uma box e em uma equipe simultaneamente");
    }
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


