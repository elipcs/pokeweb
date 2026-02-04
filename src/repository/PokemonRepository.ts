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
    speed: number,
    trainerId: number,
    boxId?: number | null,
    teamId?: number | null,
    teamPosition?: number | null
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
      speed,
      trainerId,
      boxId: boxId ?? null,
      teamId: teamId ?? null,
      teamPosition: teamPosition ?? null
    });

    return pokemon;
  }

  async getAllPokemons(options?: { limit?: number; offset?: number; type?: string }) {
    const where: any = {};
    if (options?.type) {
      where.type = options.type;
    }

    return await Pokemon.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
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
      trainerId: number;
      boxId: number | null;
      teamId: number | null;
      teamPosition: number | null;
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
